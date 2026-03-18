import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Checkout',
  slug: 'checkout',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'checkout',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.checkout.app',
    associatedDomains: ['applinks:dashboard.checkout.com'],
    infoPlist: {
      NSFaceIDUsageDescription: 'Verify your identity to authorise payouts over £1,000.',
    },
  },
  android: {
    package: 'com.checkout.app',
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#186AFE',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 300,
        resizeMode: 'contain',
        backgroundColor: '#186AFE',
        dark: {
          backgroundColor: '#186AFE',
        },
      },
    ],
    [
      'expo-font',
      {
        fonts: [
          './assets/fonts/Inter.ttf',
          './assets/fonts/Inter-Italic.ttf',
          './assets/fonts/IBMPlexMono-Thin.ttf',
          './assets/fonts/IBMPlexMono-ExtraLight.ttf',
          './assets/fonts/IBMPlexMono-Light.ttf',
          './assets/fonts/IBMPlexMono-Regular.ttf',
          './assets/fonts/IBMPlexMono-Medium.ttf',
          './assets/fonts/IBMPlexMono-SemiBold.ttf',
          './assets/fonts/IBMPlexMono-Bold.ttf',
          './assets/fonts/IBMPlexMono-Italic.ttf',
          './assets/fonts/IBMPlexMono-LightItalic.ttf',
          './assets/fonts/IBMPlexMono-MediumItalic.ttf',
          './assets/fonts/IBMPlexMono-BoldItalic.ttf',
          './assets/fonts/IBMPlexMono-SemiBoldItalic.ttf',
          './assets/fonts/IBMPlexMono-ThinItalic.ttf',
          './assets/fonts/IBMPlexMono-ExtraLightItalic.ttf',
        ],
      },
    ],
  ],
  extra: {
    eas: {
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID ?? '',
    },
  },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
