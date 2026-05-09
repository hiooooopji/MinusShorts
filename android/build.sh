#!/bin/bash
# Build YouTube Browser APK

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export ANDROID_SDK_ROOT="$HOME/android-sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH"

GRADLE_BIN=~/.gradle/wrapper/dists/gradle-8.8-bin/*/gradle-8.8/bin/gradle

echo "Building YouTube Browser APK..."
echo "Java version:"
java -version 2>&1 | head -1

cd "$(dirname "$0")"
$GRADLE_BIN clean assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo "BUILD SUCCESSFUL!"
    echo "APK location: app/build/outputs/apk/debug/app-debug.apk"
    ls -lh app/build/outputs/apk/debug/app-debug.apk
else
    echo ""
    echo "BUILD FAILED"
fi
