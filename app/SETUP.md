# App Setup Guide

## Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS: Xcode 15+ (Mac only)
- Android: Android Studio with an emulator or a physical device

## Firebase Configuration

These files are **gitignored** and must be obtained from the Firebase console for the `snapquote-5d09f` project:

| File                       | Platform | Where to place                 |
| -------------------------- | -------- | ------------------------------ |
| `GoogleService-Info.plist` | iOS      | `app/GoogleService-Info.plist` |
| `google-services.json`     | Android  | `app/google-services.json`     |

1. Go to the [Firebase Console](https://console.firebase.google.com/) → Project `snapquote-5d09f`
2. Navigate to **Project Settings → Your apps**
3. Download the config file for the relevant platform and place it in the `app/` directory

## Environment Variables

Copy `.env.example` to `.env.local` (if present) and fill in the required values. At minimum:

```
EXPO_PUBLIC_API_URL=https://videoinvoice.up.railway.app
```

For local development against a local API server, the app auto-detects `localhost` on simulators/emulators via [app/config.ts](config.ts).

## Install & Run

```bash
cd app
npm install

# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo run:ios

# Run on Android emulator
npx expo run:android
```

## Bundle Identifiers

| Platform | Bundle ID              |
| -------- | ---------------------- |
| iOS      | `com.videoinvoice.app` |
| Android  | `com.videoinvoice.app` |
