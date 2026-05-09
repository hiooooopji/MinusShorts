#!/bin/bash

# Build script for YouTube Browser APK

echo "YouTube Browser APK Builder"
echo "==========================="
echo ""

# Check if Android SDK is available
if [ -z "$ANDROID_SDK_ROOT" ] && [ -z "$ANDROID_HOME" ]; then
    echo "Warning: ANDROID_SDK_ROOT or ANDROID_HOME not set"
    echo "Make sure Android SDK is installed and configured"
fi

# Navigate to android directory
cd "$(dirname "$0")"

# Make gradlew executable if it exists
if [ -f "gradlew" ]; then
    chmod +x gradlew
else
    echo "Error: gradlew not found. Make sure you're in the android directory."
    exit 1
fi

echo "Building Debug APK..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo "Build successful!"
    echo "APK location: app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    
    # Show file info
    ls -lh app/build/outputs/apk/debug/app-debug.apk
else
    echo ""
    echo "Build failed. Check the error messages above."
    exit 1
fi
