# 🚀 Quick Start - Native Apps

## For Windows Desktop APP (Easiest)

### 5-Minute Setup

**1. Install Node.js** (if not already)
```
Download from nodejs.org
Install it
```

**2. Open Command Prompt or PowerShell**
```
Navigate to: zekat_app/client
```

**3. Install & Build** (one command)
```bash
npm install && npm install --save-dev electron electron-builder concurrently wait-on electron-is-dev
```

**4. Run in Development**
```bash
npm run electron-dev
```
✅ App launches automatically!

**5. Create Installer** (for distribution)
```bash
npm run electron-build
```

Creates:
- `Zakat-Tracker-Setup-1.0.0.exe` (Installer)
- `Zakat-Tracker-1.0.0.exe` (Portable)

### ✨ Features as Native App
✓ Looks like real Windows app  
✓ In Start Menu  
✓ System tray integration  
✓ Works offline  
✓ Fast startup  

---

## For iOS App (Requires Mac)

### Prerequisites
- Mac computer (free alternative: Mac in cloud)
- Xcode (free from App Store)
- Apple ID (free)

### Steps

**1-3. Same as Windows**
```bash
cd zekat_app/client
npm install
npm install --save-dev @capacitor/cli @capacitor/core
```

**4. Add iOS**
```bash
npm run capacitor-add-ios
npm run build
```

**5. Open Xcode**
```bash
npm run capacitor-open-ios
```

**6. In Xcode**
- Select your Apple ID
- Click Run (▶)
- App installs on simulator

---

## For Android App (Easiest Mobile)

### Prerequisites
- **Android Studio** (free - download 1 time)
- PC or Mac

### Steps

**1-3. Same setup**
```bash
cd zekat_app/client
npm install
npm install --save-dev @capacitor/cli @capacitor/core
```

**4. Add Android**
```bash
npm run capacitor-add-android
npm run build
```

**5. Open Android Studio**
```bash
npm run capacitor-open-android
```

**6. In Android Studio**
- Wait for Gradle sync
- Click Run (▶)
- Select emulator or device
- App installs!

---

## 💾 Creating Installer/Packages

### Windows Desktop Installer

```bash
cd zekat_app/client
npm run electron-build
```

Output folder: `dist/`

Files:
- `Zakat-Tracker-Setup-1.0.0.exe` ← **Share this**
- `Zakat-Tracker-1.0.0.exe` ← Or this for portable

### iOS App (for App Store)

```bash
npm run capacitor-build-ios
# Then in Xcode: Product → Archive → Upload
```

### Android App (for Play Store)

```bash
npm run capacitor-build-android
# Then in Android Studio: Build → Generate Signed APK
```

---

## 📦 Share Your App

### Windows
1. Build: `npm run electron-build`
2. Share: The .exe files
3. Users run installer or portable executable

### iOS
1. Apple Developer Account ($99/year)
2. Submit to App Store
3. Users download from App Store

### Android
1. Google Play Account ($25 one-time)
2. Upload APK
3. Users download from Play Store

---

## 🔧 Troubleshooting

**Windows app won't start?**
```bash
# Clear everything and rebuild
rm -rf node_modules dist
npm install
npm run electron-build
```

**Node/npm not found?**
```
Reinstall Node.js from nodejs.org
Restart terminal after install
```

**Permission denied?**
```bash
# Run as Administrator
# Or use absolute paths
```

---

## 📱 App on Phone (Bonus)

Same React code works on browser too!

**Local Network Access:**
1. Find PC's IP: `ipconfig` (look for IPv4)
2. On phone WiFi: Visit `http://[IP]:3000`
3. See app on phone!

---

## ✅ Summary

You now have:

| Platform | Type | File | How to Share |
|----------|------|------|--------------|
| Windows | Desktop | .exe | Email/Download |
| iOS | Mobile | .ipa | App Store |
| Android | Mobile | .apk | Play Store |
| Browser | Web | - | URL/Website |

---

**Next Step**: Follow the detailed guide in `NATIVE_APP_BUILD.md`

Build and share! 🎉
