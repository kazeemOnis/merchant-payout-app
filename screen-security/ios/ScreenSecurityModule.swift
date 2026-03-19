import ExpoModulesCore
import LocalAuthentication
import UIKit

final class BiometricsNotEnrolledException: Exception {
  override var reason: String {
    "Biometrics are not enrolled on this device. Please set up Face ID or Touch ID in Settings."
  }
}

final class BiometricUnavailableException: Exception {
  override var reason: String {
    "Biometrics are not available on this device."
  }
}


public class ScreenSecurityModule: Module {
  private var screenshotObserver: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("ScreenSecurity")

    Events("onScreenshotTaken")

    OnCreate {
      print("[ScreenSecurity] OnCreate — registering screenshot observer")
      self.screenshotObserver = NotificationCenter.default.addObserver(
        forName: UIApplication.userDidTakeScreenshotNotification,
        object: nil,
        queue: .main
      ) { [weak self] _ in
        print("[ScreenSecurity] userDidTakeScreenshotNotification fired — emitting onScreenshotTaken")
        self?.sendEvent("onScreenshotTaken")
      }
      print("[ScreenSecurity] Screenshot observer registered: \(self.screenshotObserver != nil)")
    }

    OnDestroy {
      print("[ScreenSecurity] OnDestroy — removing screenshot observer")
      if let observer = self.screenshotObserver {
        NotificationCenter.default.removeObserver(observer)
        self.screenshotObserver = nil
      }
    }

    // iOS Simulator does NOT trigger UIApplication.userDidTakeScreenshotNotification
    // via Cmd+S. Use this to test the JS → UI flow without a real device.
    #if DEBUG
    Function("simulateScreenshot") {
      print("[ScreenSecurity] simulateScreenshot called — posting notification manually")
      NotificationCenter.default.post(
        name: UIApplication.userDidTakeScreenshotNotification,
        object: nil
      )
    }
    #endif

    AsyncFunction("getDeviceId") { () -> String in
      let id = UIDevice.current.identifierForVendor?.uuidString ?? UUID().uuidString
      print("[ScreenSecurity] getDeviceId → \(id.prefix(8))...")
      return id
    }

    AsyncFunction("isBiometricAuthenticated") { () async throws -> Bool in
      print("[ScreenSecurity] isBiometricAuthenticated called")
      let context = LAContext()
      var policyError: NSError?

      guard context.canEvaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, error: &policyError) else {
        if let laError = policyError as? LAError, laError.code == .biometryNotEnrolled {
          print("[ScreenSecurity] Biometrics not enrolled")
          throw BiometricsNotEnrolledException()
        }
        print("[ScreenSecurity] Biometrics unavailable: \(policyError?.localizedDescription ?? "unknown")")
        throw BiometricUnavailableException()
      }

      do {
        let result = try await context.evaluatePolicy(
          .deviceOwnerAuthenticationWithBiometrics,
          localizedReason: "Verify your identity to authorise this payout"
        )
        print("[ScreenSecurity] Biometric result: \(result)")
        return result
      } catch let laError as LAError {
        switch laError.code {
        case .userCancel, .appCancel, .systemCancel, .userFallback:
          print("[ScreenSecurity] Biometric cancelled by user")
          return false
        case .biometryNotEnrolled:
          throw BiometricsNotEnrolledException()
        default:
          print("[ScreenSecurity] Biometric error: \(laError.localizedDescription)")
          return false
        }
      }
    }
  }
}
