package expo.modules.screensecurity

import android.annotation.SuppressLint
import android.app.Activity
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.core.os.bundleOf
import androidx.fragment.app.FragmentActivity
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val TAG = "ScreenSecurity"

class BiometricsNotEnrolledException : CodedException(
  "BIOMETRICS_NOT_ENROLLED",
  "Biometrics not enrolled on this device. Please set up Fingerprint or Face authentication in your device Settings.",
  null,
)

class BiometricUnavailableException : CodedException(
  "BIOMETRIC_UNAVAILABLE",
  "Biometrics are not available on this device.",
  null,
)

class ScreenSecurityModule : Module() {
  // Stored as Any? to avoid compile-time API level issues; cast inside API-guarded blocks.
  private var screenCaptureCallback: Any? = null

  override fun definition() = ModuleDefinition {
    Name("ScreenSecurity")

    Events("onScreenshotTaken")

    OnActivityEntersForeground {
      Log.d(TAG, "OnActivityEntersForeground — registering screen capture callback")
      registerScreenCapture()
    }

    OnActivityEntersBackground {
      Log.d(TAG, "OnActivityEntersBackground — unregistering screen capture callback")
      unregisterScreenCapture()
    }

    // Activity.ScreenCaptureCallback requires API 34. On older emulators or
    // API < 34 devices this event won't fire natively. Use this to test the
    // JS → UI flow.
    if (BuildConfig.DEBUG) {
      Function("simulateScreenshot") {
        Log.d(TAG, "simulateScreenshot called — emitting onScreenshotTaken manually")
        sendEvent("onScreenshotTaken", bundleOf())
      }
    }

    AsyncFunction("getDeviceId") {
      val id = Settings.Secure.getString(
        appContext.reactContext?.contentResolver,
        Settings.Secure.ANDROID_ID,
      ) ?: ""
      Log.d(TAG, "getDeviceId → ${id.take(8)}...")
      id
    }

    AsyncFunction("isBiometricAuthenticated") { promise: Promise ->
      Log.d(TAG, "isBiometricAuthenticated called")
      val context = appContext.reactContext
        ?: throw Exception("No React context available")

      val biometricManager = BiometricManager.from(context)
      when (biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG)) {
        BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> {
          Log.d(TAG, "Biometrics not enrolled")
          throw BiometricsNotEnrolledException()
        }
        BiometricManager.BIOMETRIC_SUCCESS -> Log.d(TAG, "Biometrics available")
        else -> {
          Log.d(TAG, "Biometrics unavailable")
          throw BiometricUnavailableException()
        }
      }

      val activity = context.currentActivity as? FragmentActivity
        ?: throw Exception("No foreground FragmentActivity available")

      activity.runOnUiThread {
        val executor = ContextCompat.getMainExecutor(activity)

        val callback = object : BiometricPrompt.AuthenticationCallback() {
          override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
            Log.d(TAG, "Biometric authentication succeeded")
            promise.resolve(true)
          }

          override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
            Log.d(TAG, "Biometric authentication error [$errorCode]: $errString")
            promise.resolve(false)
          }

          override fun onAuthenticationFailed() {
            Log.d(TAG, "Biometric attempt failed — prompt stays open")
          }
        }

        val promptInfo = BiometricPrompt.PromptInfo.Builder()
          .setTitle("Authorise Payout")
          .setDescription("Verify your identity to complete this payout")
          .setNegativeButtonText("Cancel")
          .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG)
          .build()

        BiometricPrompt(activity, executor, callback).authenticate(promptInfo)
      }
    }
  }


  @SuppressLint("NewApi")
  private fun registerScreenCapture() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      val activity = appContext.reactContext?.currentActivity ?: run {
        Log.w(TAG, "registerScreenCapture: no current activity")
        return
      }
      val callback = Activity.ScreenCaptureCallback {
        Log.d(TAG, "ScreenCaptureCallback fired — emitting onScreenshotTaken")
        sendEvent("onScreenshotTaken", bundleOf())
      }
      screenCaptureCallback = callback
      activity.registerScreenCaptureCallback(
        ContextCompat.getMainExecutor(activity),
        callback,
      )
      Log.d(TAG, "ScreenCaptureCallback registered (API ${Build.VERSION.SDK_INT})")
    } else {
      Log.d(TAG, "ScreenCaptureCallback skipped — API ${Build.VERSION.SDK_INT} < 34")
    }
  }

  @SuppressLint("NewApi")
  private fun unregisterScreenCapture() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      val activity = appContext.reactContext?.currentActivity ?: return
      (screenCaptureCallback as? Activity.ScreenCaptureCallback)?.let { cb ->
        activity.unregisterScreenCaptureCallback(cb)
        screenCaptureCallback = null
        Log.d(TAG, "ScreenCaptureCallback unregistered")
      }
    }
  }
}
