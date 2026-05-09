# YouTube Browser - Android APK

Android WebView-based YouTube browser with built-in Shorts blocker.

## Features

- **Locked to YouTube**: Only youtube.com and Google auth domains allowed
- **Built-in Shorts Blocker**: Hides all YouTube Shorts (enabled by default)
- **Pull to Refresh**: Swipe down to reload the page
- **Back Navigation**: Hardware back button goes back in WebView history

## Build Requirements

- Android Studio Hedgehog (2023.1.1) or newer
- Android SDK 34
- Java 17
- Gradle 8.2+

## Build APK

### Using Android Studio

1. Open Android Studio
2. Select "Open" and choose the `android/` folder
3. Wait for Gradle sync to complete
4. Go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**
5. APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Using Command Line

```bash
cd /home/siddharth/Documents/youtube-mobile/android

# Make gradlew executable
chmod +x gradlew

# Build debug APK
./gradlew assembleDebug

# Or build release APK (requires signing)
./gradlew assembleRelease

# APK location:
# Debug: app/build/outputs/apk/debug/app-debug.apk
# Release: app/build/outputs/apk/release/app-release-unsigned.apk
```

## Project Structure

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/youtube/browser/
│   │   │   └── MainActivity.java    # Main activity with WebView
│   │   ├── res/layout/
│   │   │   └── activity_main.xml    # WebView layout
│   │   └── AndroidManifest.xml      # App config
│   └── build.gradle                 # App-level build config
├── build.gradle                     # Project-level build config
└── settings.gradle                  # Project settings
```

## Shorts Blocker Implementation

The Shorts blocker is implemented in `MainActivity.java`:

1. **URL Interception**: `shouldOverrideUrlLoading()` blocks `/shorts/` URLs
2. **JavaScript Injection**: Injects CSS + JS on every page load via `onPageFinished()`
3. **DOM Manipulation**: Hides elements matching Shorts selectors
4. **MutationObserver**: Continuously removes Shorts as they're dynamically loaded

## Customization

To toggle Shorts blocker at runtime, you would add a menu option that calls `toggleShortsBlocker(boolean)`.

## Signing for Release

To create a signed release APK:

1. Generate keystore:
```bash
keytool -genkey -v -keystore youtube-browser.keystore -alias youtube-browser -keyalg RSA -keysize 2048 -validity 10000
```

2. Add to `app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file("youtube-browser.keystore")
            storePassword "your-password"
            keyAlias "youtube-browser"
            keyPassword "your-password"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

3. Build: `./gradlew assembleRelease`
