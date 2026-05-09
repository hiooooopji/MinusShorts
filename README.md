# YouTube Browser

A dedicated browser that only runs YouTube with a built-in **Shorts blocker extension**. Available for **Desktop** (Windows/macOS/Linux via Electron) and **Android** (APK via WebView).

This application creates a locked-down browsing environment where users can only access YouTube while optionally hiding all Shorts content.

## Features

- **Locked Navigation**: Only allows YouTube domains and essential Google authentication services
- **Built-in Shorts Blocker**: Hides all YouTube Shorts from:
  - Homepage recommendations
  - Sidebar suggestions
  - Search results
  - Navigation menu
  - Direct /shorts/ URLs are blocked and redirected
- **Toggle Control**: Enable/disable Shorts blocking from the menu (`Cmd/Ctrl+Shift+S` on desktop)
- **Clean Interface**: No browser chrome, just YouTube
- **Cross-platform**: Desktop (Windows/macOS/Linux) + Android APK


## Quick Start

### Desktop (Electron)

```bash
# Install dependencies
npm install

# Run the application
npm start

# Build for distribution
npm run build
```

### Android (APK)

See [android/README.md](android/README.md) for detailed instructions.

```bash
cd android
chmod +x build-apk.sh
./build-apk.sh
# APK will be at: app/build/outputs/apk/debug/app-debug.apk
```

### Using the Shorts Blocker

The Shorts blocker is **enabled by default**. To toggle:

- **Menu**: Extensions → Block Shorts
- **Keyboard**: `Cmd+Shift+S` (macOS) or `Ctrl+Shift+S` (Windows/Linux)

When enabled, all Shorts content is hidden via CSS injection and JavaScript DOM manipulation. When disabled, the page reloads normally without the blocker.

### Using the Shorts Blocker (Android)

The Android version has the Shorts blocker **always enabled**. The implementation uses Android WebView with JavaScript injection to hide Shorts elements and blocks `/shorts/` URLs at the navigation level.

### Building for Distribution

```bash
# Build for your current platform
npm run build

# The packaged app will be in the `dist` folder
```

## Allowed Domains

The browser only allows navigation to:
- `youtube.com`, `www.youtube.com`, `m.youtube.com`
- `youtu.be` (YouTube short links)
- `accounts.google.com` (for sign-in)
- `myaccount.google.com` (account management)

Any attempt to navigate to other websites will be blocked.

## How the Shorts Blocker Works

The extension injects a content script (`shorts-blocker.js`) that:

1. **CSS Hiding**: Injects styles to hide Shorts elements by:
   - `[is-shorts]` attribute selectors
   - `ytd-reel-shelf-renderer` components
   - `ytd-rich-section-renderer[is-shorts]` shelves
   - Navigation tabs and links with "Shorts" in the title

2. **URL Interception**: 
   - Overrides `history.pushState` and `history.replaceState` to block /shorts/ navigation
   - Intercepts click events on Shorts links
   - Redirects direct /shorts/ URL access to youtube.com

3. **DOM MutationObserver**: Watches for dynamically loaded content and continuously removes Shorts elements as YouTube's SPA adds them

4. **Periodic Cleanup**: Runs every second to catch any missed elements

## Security Notes

- External links from YouTube will open in your system's default browser
- The app uses Electron's context isolation for security
- Node.js integration is disabled in the renderer process
- Content scripts are injected securely via `executeJavaScript` API

## License

MIT
