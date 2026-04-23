# 📦 Publishing Guide - App Stores

## 🖥️ Windows Distribution

### Method 1: Direct Download (Easiest)

**Step 1: Build the app**
```bash
cd zekat_app/client
npm run electron-build
```

**Step 2: Files created**
- `dist/Zakat-Tracker-Setup-1.0.0.exe` - Installer
- `dist/Zakat-Tracker-1.0.0.exe` - Portable

**Step 3: Share**
- Upload to your website
- Share on GitHub Releases
- Email to users
- Post on social media

**Users Run:**
- Double-click .exe
- Follow installer
- Launch from Start Menu

---

### Method 2: Windows Store (Official)

**Requirements:**
- Windows Developer Account ($19/year)
- Code signing certificate

**Steps:**
1. Create Windows Store account
2. Reserve app name
3. In Visual Studio: Package for Store
4. Upload .appx file
5. Wait for review (3-5 days)
6. App appears in Windows Store

---

## 📱 iOS App Store

### Prerequisites
- **Mac computer** (built-ins Simulator, can't publish from Windows)
- **Apple Developer Account** ($99/year)
- Xcode installed

### Step 1: Code Sign

```bash
cd zekat_app/client

# Build and sync
npm run build
npm run capacitor-sync
npm run capacitor-open-ios
```

In Xcode:
```
Signing & Capabilities
→ Select your Team
→ Update Bundle ID to your domain
  (com.yourcompany.zekatapp)
```

### Step 2: Create App Store Listing

1. Visit: [App Store Connect](https://appstoreconnect.apple.com)
2. Click **My Apps**
3. Click **+ New App**
4. Select platform: iOS
5. Select bundle ID: `com.yourcompany.zekatapp`
6. Fill in:
   - App Name
   - Primary Language
   - Bundle ID
   - SKU (unique ID)

### Step 3: Fill App Info

```
Version Release:
├─ Version Number: 1.0.0
├─ Build Number: 1

Description:
├─ App description (English, other languages)
├─ Keywords: zakat, islam, finance, calculator
├─ Support URL
├─ Privacy Policy URL

Pricing:
├─ Free or Paid
├─ Countries where available
```

### Step 4: Add Screenshots & Icon

```
Required:
├─ App Icon (1024x1024)
├─ Screenshots (at least 2)
├─ Preview Video (optional)

Upload for:
├─ iPhone 6.5"
├─ iPhone 5.5"
├─ iPad (if supporting)
```

### Step 5: Build & Archive

In Xcode:

```
1. Select "Any iOS Device"
2. Product → Build For → Archiving
3. Product → Archive
4. Manager Windows opens
5. Click "Distribute App"
6. Select "App Store Connect"
7. Follow steps
```

### Step 6: Submit for Review

Back in App Store Connect:

```
1. Build section → Select your build
2. Review information → Fill required fields
3. App Review Information:
   - Sign-in credentials (if needed)
   - App-specific URLs
   - Reviewer notes
4. Click "Submit for Review"
```

### Step 7: Wait & Publish

- Review time: 3-5 days
- Apple may request changes
- Once approved, click "Release This Version"
- App goes live in 1-2 hours

---

## 📱 Google Play Store

### Prerequisites
- **Google Play Developer Account** ($25 one-time)
- PC or Mac
- Android Studio

### Step 1: Create Developer Account

1. Visit: [Google Play Console](https://play.google.com/console)
2. Sign in with Google account
3. Pay $25 registration fee
4. Accept agreements
5. Create developer profile

### Step 2: Build Release APK

In Android Studio:

```
1. Build → Generate Signed Bundle / APK
2. Select: Android App Bundle (recommended)
3. Create new key store:
   - Store Path: save securely
   - Keystore Password: save securely
   - Key Alias: "zekat_app_key"
   - Key Password: same as keystore
4. Build Release
5. Wait for build completion
```

**Save your keystore file** - you need it for all updates!

### Step 3: Create App in Play Console

```
1. All apps → Create new app
2. App name: "Zakat Tracker"
3. Category: Finance
4. Type: Free or Paid
5. Content rating: Complete form
6. Policies: Read & accept
```

### Step 4: Add App Details

```
Store presence:
├─ Title (max 50 chars)
├─ Short description (80 chars)
├─ Full description (max 4000 chars)
├─ Screenshots (at least 2)
├─ Feature image (1024x500)
├─ App icon (512x512)

Content rating:
├─ Complete questionnaire
├─ Get rating (E, T, M, A, AO)

Additional:
├─ Website
├─ Privacy policy
├─ Support email
```

### Step 5: Upload APK

```
Testing → Internal testing → Create release
Upload AAB or APK → Select your file
Review required:
├─ Release name: v1.0.0
├─ Release notes: Initial release
└─ Upload & review
```

### Step 6: Testing (Internal)

```
1. Internal testing: 5 users
2. Beta testing: up to 10,000 users
3. Production: all users

For initial release:
- Start with Internal (24 hours)
- Move to Production
```

### Step 7: Submit for Review

```
Setup → App content:
├─ Ads: Does app have ads? (No for us)
├─ Content: Appropriate for all ages
├─ Targeting: Adult content? (No)

Click: "Go to Production"
Review time: Usually 2-4 hours
```

### Step 8: Launch

Once approved:
```
Internal testing → Manage release
→ Move to Production
→ App goes live!
```

---

## 🔐 Security & Privacy

### Before Publishing

**Privacy Policy Required**

```
Template structure:
├─ What data you collect
├─ How you use it
├─ How you store it
├─ User rights
├─ Contact information

For Zakat Tracker:
├─ Collect: Transaction data, assets
├─ Use: Zakat calculation
├─ Store: SQLite locally
├─ Share: Not shared with anyone
```

### Terms of Service

```
Include:
├─ User responsibilities
├─ Limitation of liability
├─ Disclaimer about Islamic advice
├─ Copyright notice
```

---

## 📋 Pre-Launch Checklist

### Functionality
- [ ] All features working
- [ ] No crashes or bugs
- [ ] Tested on real devices
- [ ] Database working
- [ ] API connections tested
- [ ] Offline mode tested

### Content
- [ ] App icon professional
- [ ] Screenshots clear
- [ ] Description accurate
- [ ] No grammatical errors
- [ ] Privacy policy complete
- [ ] Contact info included

### Compliance
- [ ] Terms of service
- [ ] Privacy policy
- [ ] Permissions justified
- [ ] No paid features hidden
- [ ] Rating appropriate

### Testing
- [ ] Tested on old devices
- [ ] Tested on slow internet
- [ ] Tested offline
- [ ] Tested with no money
- [ ] Tested with large amounts
- [ ] Tested multi-currency

---

## 📊 Version Management

### Semantic Versioning

```
Version: 1.0.0
├─ 1 = Major (big features)
├─ 0 = Minor (small features)
└─ 0 = Patch (bug fixes)

Examples:
├─ 1.0.0 → Initial release
├─ 1.0.1 → Bug fixes
├─ 1.1.0 → New features
├─ 2.0.0 → Major redesign
```

### Update Process

**Windows:**
```bash
# Update version in package.json
npm run electron-build
# New .exe created with version
# Users run it, auto-updates if configured
```

**iOS:**
```
In App Store Connect:
1. Upload new build
2. New version number
3. Submit for review
4. Users get update notification
```

**Android:**
```
In Play Console:
1. Upload new APK/AAB
2. Increment version code
3. Review and publish
4. Users get update
```

---

## 💰 Monetization (Optional)

### Free with Ads
```
- Add ad network (AdMob)
- Show banner/interstitial ads
- Keep app free
- Revenue per 1000 impressions
```

### Freemium Model
```
- Basic version: Free
- Premium version: Paid features
- Subscription option
```

### Paid App
```
- One-time purchase
- Set price in store
- Payment processed by store
- Payout to bank
```

### For Zakat Tracker
We recommend **keeping free** - as Zakat is Islamic charity, 
charging for it may contradict the spirit of giving.

---

## 📈 Post-Launch

### Monitor
- User reviews and ratings
- Crash reports
- Issue submissions
- Feature requests

### Update Schedule
```
Week 1: Bug fixes
Month 1: Polish features
Quarter 1: New features
Year 1: Major update
```

### User Feedback
```
Respond to:
- 1-star reviews (critical bugs)
- Feature requests
- Questions in reviews
- Support emails
```

---

## 🚨 Common Issues

### Windows Store Rejection
```
Common reasons:
- App crashes on launch
- Missing privacy policy
- Misleading screenshots
- Adult content unexpectedly

Solution:
- Fix issues
- Resubmit
```

### iOS Rejection
```
Common reasons:
- Crashes on test device
- Misleading screenshots
- Broken features
- Privacy concerns

Solution:
- Test thoroughly
- Resubmit with explanation
```

### Android Rejection
```
Common reasons:
- Malware/security
- Policy violation
- Copyright issue
- Inappropriate content

Solution:
- Very rare
- Usually just resubmit
```

---

## 📞 Support

After publishing, users may contact you about:
- How to use the app
- Feature requests
- Bug reports
- Zakat questions

Provide:
- Email support
- FAQ page
- User guide (from this repo)
- Community forum (optional)

---

## 🎉 Success Checklist

- [ ] App built successfully
- [ ] All platforms tested
- [ ] Documentation complete
- [ ] Accounts created (store, developer)
- [ ] Requirements met
- [ ] App submitted
- [ ] Waiting for approval
- [ ] App published!

---

**Congratulations! Your app is now available to millions of users!** 🚀
