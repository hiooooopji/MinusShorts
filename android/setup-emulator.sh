#!/bin/bash

# Android Emulator Setup Script for Linux
set -e

echo "Android Emulator Setup"
echo "======================"
echo ""

# Configuration
ANDROID_SDK_ROOT="$HOME/android-sdk"
SDK_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"

# Check dependencies
echo "Checking dependencies..."
if ! command -v java &> /dev/null; then
    echo "Installing OpenJDK 17..."
    sudo apt update
    sudo apt install -y openjdk-17-jdk
fi

if ! command -v wget &> /dev/null; then
    sudo apt install -y wget unzip
fi

# Create SDK directory
echo "Setting up Android SDK at $ANDROID_SDK_ROOT..."
mkdir -p "$ANDROID_SDK_ROOT"
cd "$ANDROID_SDK_ROOT"

# Download command line tools
if [ ! -d "cmdline-tools" ]; then
    echo "Downloading Android SDK command line tools..."
    wget -q "$SDK_URL" -O commandlinetools.zip
    unzip -q commandlinetools.zip
    mkdir -p cmdline-tools/latest
    mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true
    rm commandlinetools.zip
fi

# Set environment variables
export ANDROID_SDK_ROOT="$ANDROID_SDK_ROOT"
export PATH="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator:$PATH"

# Add to .bashrc if not already there
if ! grep -q "ANDROID_SDK_ROOT" ~/.bashrc; then
    echo "" >> ~/.bashrc
    echo "# Android SDK" >> ~/.bashrc
    echo "export ANDROID_SDK_ROOT=\"$ANDROID_SDK_ROOT\"" >> ~/.bashrc
    echo 'export PATH="$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator:$PATH"' >> ~/.bashrc
fi

# Accept licenses
echo "Accepting SDK licenses..."
yes | sdkmanager --licenses > /dev/null 2>&1 || true

# Install required packages
echo "Installing SDK packages..."
sdkmanager "platform-tools" "emulator" "platforms;android-34" "build-tools;34.0.0" "system-images;android-34;google_apis;x86_64"

# Create AVD (Android Virtual Device)
echo "Creating Android emulator..."
avdmanager create avd -n youtube_test -k "system-images;android-34;google_apis;x86_64" -d pixel_7 --force

# Configure emulator for better performance
echo "hw.gpu.enabled=yes" >> ~/.android/avd/youtube_test.avd/config.ini
echo "hw.gpu.mode=host" >> ~/.android/avd/youtube_test.avd/config.ini
echo "hw.ramSize=2048" >> ~/.android/avd/youtube_test.avd/config.ini

echo ""
echo "Setup complete!"
echo ""
echo "To use the emulator:"
echo "1. Source your .bashrc: source ~/.bashrc"
echo "2. Start emulator: emulator -avd youtube_test -no-snapshot-load"
echo "3. In another terminal, install APK: adb install app/build/outputs/apk/debug/app-debug.apk"
echo ""

# Create convenience script
cat > "$ANDROID_SDK_ROOT/start-emulator.sh" << 'EOF'
#!/bin/bash
cd "$ANDROID_SDK_ROOT/emulator"
./emulator -avd youtube_test -no-snapshot-load -gpu host
EOF
chmod +x "$ANDROID_SDK_ROOT/start-emulator.sh"

echo "Created start-emulator.sh at $ANDROID_SDK_ROOT/start-emulator.sh"
