# Building Native Apps - Step by Step

## 🖥️ Windows Desktop App

### Prerequisites
- Node.js 16+
- Windows 10 or later

### Step 1: Install Dependencies

```bash
cd zekat_app/client
npm install
npm install --save-dev electron electron-builder concurrently wait-on electron-is-dev
```

### Step 2: Build for Windows

```bash
# Development mode (with hot reload)
npm run electron-dev

# Production build (standalone .exe installer)
npm run electron-build
```

This creates:
- **Installer**: `dist/Zakat-Tracker-Setup-1.0.0.exe`
- **Portable**: `dist/Zakat-Tracker-1.0.0.exe` (no installation needed)

### Step 3: Install on Windows

**Option 1: Installer**
- Run `Zakat-Tracker-Setup-1.0.0.exe`
- Follow installation wizard
- App appears in Start Menu

**Option 2: Portable**
- Run `Zakat-Tracker-1.0.0.exe` directly
- No installation needed
- Can run from USB drive

### What Users Get
✅ Native Windows application  
✅ Start Menu shortcut  
✅ Auto-updates (can be configured)  
✅ Offline database  
✅ System tray icon  

---

## 📱 iOS App

### Prerequisites
- **Mac with Xcode** (iOS development requires Mac)
- Node.js 16+
- iOS 12+
- Xcode Command Line Tools

### Step 1: Setup

```bash
# Install Capacitor globally
npm install -g @capacitor/cli

# Navigate to client
cd zekat_app/client

# Install dependencies
npm install

# Install iOS platform
npm run capacitor-add-ios
```

### Step 2: Build for iOS

```bash
# Build React app
npm run build

# Sync files to iOS
npm run capacitor-sync

# Open Xcode
npm run capacitor-open-ios
```

### Step 3: Configure in Xcode

1. **Xcode opens automatically**
2. **Select Team**: 
   - Go to Signing & Capabilities
   - Select your Apple ID
3. **Configure Bundle ID**: 
   - Change to: `com.yourname.zekatapp`
4. **Allow localhost**: 
   - Go to App Transport Security
   - Allow http://localhost:5000

### Step 4: Build & Test

**Option 1: Simulator**
```
Build → Run on Simulator
```

**Option 2: Real Device**
```
1. Connect iPhone via USB
2. Select device in Xcode
3. Click Run (Play button)
```

### Step 5: Distribute to App Store

```bash
# Archive for App Store
Product → Archive

# Upload to App Store Connect
Upload to App Store
```

---

## 📱 Android App

### Prerequisites
- **Android Studio** (download from developer.android.com)
- **Android SDK 21+**
- **Java Development Kit (JDK)**
- Node.js 16+

### Step 1: Setup Environment

**Windows:**
```bash
# Set ANDROID_HOME environment variable
setx ANDROID_HOME "C:\Users\YourUsername\AppData\Local\Android\sdk"
setx JAVA_HOME "C:\Program Files\Android\Android Studio\jre"
```

**Mac/Linux:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

### Step 2: Add Android Platform

```bash
cd zekat_app/client

# Add Android
npm run capacitor-add-android

# Sync files
npm run capacitor-sync
```

### Step 3: Open Android Studio

```bash
npm run capacitor-open-android
```

### Step 4: Configure

1. **Build config**: 
   - Let Android Studio download SDKs
2. **Gradle sync**: 
   - Wait for initial sync
3. **Permissions**: 
   - Already configured in app

### Step 5: Build

**Option 1: Debug APK (testing)**
```
Build → Build Bundle(s) / APK(s) → Build APK(s)
```

**Option 2: Release APK (distribution)**
```
Build → Generate Signed Bundle / APK...
```

### Step 6: Run

**Emulator:**
```
1. Create Virtual Device in AVD Manager
2. Run emulator
3. Click Run in Android Studio
```

**Real Device:**
```
1. Enable USB Debugging on phone
2. Connect via USB
3. Click Run in Android Studio
```

### Step 7: Upload to Play Store

```
1. Create Google Play Developer account
2. Generate signed APK/AAB
3. Upload to Google Play Console
4. Wait for review
```

---

## 🔧 Complete Build Process

### For All Platforms at Once

**Step 1: Prepare Backend**
```bash
cd zekat_app/server
npm install
```

**Step 2: Build React App**
```bash
cd zekat_app/client
npm install
npm run build
```

**Step 3: Platform-Specific Builds**

**Windows Desktop:**
```bash
npm run electron-build
# Creates .exe in dist/
```

**iOS:**
```bash
npm run capacitor-sync
npm run capacitor-open-ios
# Then build in Xcode
```

**Android:**
```bash
npm run capacitor-sync
npm run capacitor-open-android
# Then build in Android Studio
```

---

## 📦 Build Output

### Windows
```
dist/
├── Zakat-Tracker-Setup-1.0.0.exe    (Installer)
├── Zakat-Tracker-1.0.0.exe          (Portable)
└── ...
```

### iOS
```
ios/
├── App/
├── Pods/
└── Zakat Tracker.xcworkspace
```

### Android
```
android/
├── app/
├── build/
└── outputs/apk/ or /bundle/
```

---

## ⚙️ Configuration

### App Manifest (capacitor.config.json)

```json
{
  "appId": "com.zekatapp.app",
  "appName": "Zakat Tracker",
  "webDir": "build",
  "plugins": {
    "CapacitorHttp": {
      "enabled": true
    }
  }
}
```

### Backend URL

Development:
```
http://localhost:5000
```

Production:
```
https://api.yourdomain.com
```

---

## 🚀 Distribution

### Windows

**Option 1: Installer (Recommended)**
- Users run .exe → Install → Use
- System integration (Start Menu, uninstall)
- Automatic updates possible

**Option 2: Portable**
- Single executable file
- Run from USB drive
- No system changes

**Where to Distribute:**
- GitHub Releases
- Your website
- Windows Store (paid)

### iOS

**Requirements:**
- Apple Developer Account ($99/year)
- App Store review (3-5 days)
- Paid app available

**Steps:**
1. Create App Store listing
2. Upload binary (IPA)
3. Submit for review
4. Wait for approval
5. Publish to App Store

### Android

**Requirements:**
- Google Play Developer Account ($25 one-time)
- Simple review process
- Free/paid options

**Steps:**
1. Create Play Store listing
2. Upload APK/AAB
3. Fill store details
4. Submit (usually live in 2-4 hours)

---

## 🔍 Troubleshooting

### Electron Build Issues

```bash
# Clear cache
rm -rf node_modules dist package-lock.json
npm install
npm run electron-build
```

### iOS Build Issues

```bash
# Pod install
cd ios
pod install
cd ..

# Clean build
rm -rf ios/build
npm run capacitor-open-ios
```

### Android Build Issues

```bash
# Gradle sync in Android Studio
# File → Sync Now

# Or command line
./gradlew sync
./gradlew build
```

### API Connection Issues

**Check:**
1. Backend server running
2. Correct URL in capacitor.config.json
3. Firewall not blocking port 5000
4. App has network permissions

---

## 💡 Development Tips

### Hot Reload (Electron)
```bash
npm run electron-dev
# Changes refresh automatically
```

### Hot Reload (Mobile)
```bash
# Edit code
npm run build
npm run capacitor-sync
# Restart app
```

### Testing on Real Devices

Always test on:
- ✓ Multiple screen sizes
- ✓ Different network conditions
- ✓ Slow internet
- ✓ Without internet
- ✓ With interrupted connections

### Performance

- Monitor app size (< 50MB ideal)
- Test on older devices
- Check battery consumption
- Monitor data usage

---

## 📝 App Signing for Stores

### Code Signing Certificate

**iOS:**
- Automatic (Apple Developer account)
- Or manual in Xcode

**Android:**
- Generate key: `keytool -genkey -v -keystore my-release-key.jks ...`
- Use in Android Studio
- Keep safe (required for updates)

**Windows:**
- Optional (self-sign or buy cert)
- Electron-builder can handle

---

## 🌐 Analytics & Crash Reporting

Consider adding:
- **Sentry.io** - Error tracking
- **Firebase Analytics** - User analytics
- **AppCenter** - Crash reports

```javascript
// Example
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_DSN_KEY",
  environment: process.env.NODE_ENV
});
```

---

## 📋 Checklist Before Release

- [ ] All tests passing
- [ ] Performance optimized
- [ ] Data backup working
- [ ] Offline mode tested
- [ ] Multi-language if needed
- [ ] Privacy policy written
- [ ] Terms of service ready
- [ ] Crash reporting configured
- [ ] Analytics set up
- [ ] Icon/splash screens created
- [ ] App store listings written
- [ ] Beta testers recruited
- [ ] Reviewed by Islamic scholars

---

## 📞 Support

**Resources:**
- Capacitor Docs: capacitorjs.com
- Electron Docs: electronjs.org
- React Docs: react.dev
- Xcode Help: Apple Developer
- Android Studio Help: Android Developer

**Common Questions:**
- Q: Can I use same code for all platforms?
  A: Yes! React code works everywhere, native bits in platform folders

- Q: How to update app after release?
  A: Electron: built-in auto-update
     iOS: App Store only
     Android: Play Store only

- Q: Can I sell the app?
  A: Yes, set pricing in store (requires merchant account)

---

**Build Status**: Ready to ship! 🚀
