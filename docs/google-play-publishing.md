
# Publishing to Google Play Store

This guide explains how to prepare and publish your app to the Google Play Store.

## Prerequisites
- Google Play Developer account ($25 one-time fee)
- Android Studio installed on your computer

## Steps to Publish

### 1. Prepare your project

After cloning your project repository, install dependencies:

```bash
npm install
```

### 2. Build your project

```bash
npm run build
```

### 3. Add Android platform (if not already added)

```bash
npx cap add android
```

### 4. Sync your web code to the native project

```bash
npx cap sync android
```

### 5. Update Android resources

Place your icon and splash screen files in the `android-resources` directory, then run:

```bash
npx cap sync android
```

### 6. Open the project in Android Studio

```bash
npx cap open android
```

### 7. Configure your app in Android Studio

1. Update the version code and version name in `android/app/build.gradle`
2. Configure signing keys for your app

### 8. Generate a signed App Bundle

1. In Android Studio, go to Build > Generate Signed Bundle / APK
2. Select Android App Bundle
3. Create or use an existing keystore
4. Follow the wizard to generate the AAB file

### 9. Upload to Google Play Console

1. Log in to [Google Play Console](https://play.google.com/console)
2. Create a new app or select an existing one
3. Navigate to Production > Create new release
4. Upload your AAB file
5. Complete the store listing, content rating, and pricing details
6. Submit for review

## Important Notes

- Keep your signing keystore file secure - losing it means you cannot update your app
- The review process typically takes 1-3 business days
- Make sure your app complies with Google Play policies
