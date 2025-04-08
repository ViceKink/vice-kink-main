
# Publishing to Google Play Store from Windows

This guide explains how to prepare and publish your app to the Google Play Store using a Windows PC.

## Prerequisites
- Google Play Developer account ($25 one-time fee)
- Android Studio installed on your Windows computer
- Node.js and npm installed
- Git installed

## Steps to Publish

### 1. Export and prepare your project

First, export your Lovable project to GitHub using the "Export to GitHub" option, then:

```bash
# Clone your repository
git clone <YOUR_GITHUB_REPO_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_DIRECTORY>

# Install dependencies
npm install

# Install Capacitor Android platform (if not already done)
npm install @capacitor/android
```

### 2. Build your project

```bash
# Build the web app
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

Place your icon and splash screen files in the `android-resources` directory:
- adaptive-icon-background.png (432x432 PNG)
- adaptive-icon-foreground.png (432x432 PNG)
- icon.png (512x512 PNG)
- splash.png (1920x1920 PNG)

Then run:

```bash
npx cap sync android
```

### 6. Open the project in Android Studio

```bash
npx cap open android
```

This will open the Android Studio project that Capacitor has created.

### 7. Configure your app in Android Studio

1. Update the app version:
   - Open `android/app/build.gradle`
   - Find the `versionCode` and `versionName` properties
   - Increment `versionCode` by 1 (e.g., from 1 to 2)
   - Update `versionName` to your desired version (e.g., "1.0.1")

2. Configure signing keys for your app:
   - In Android Studio, go to Build > Generate Signed Bundle / APK
   - Select "Android App Bundle"
   - Click "Create new..." to create a new keystore
   - Fill in the required keystore information:
     - Keystore path (save it somewhere safe)
     - Password
     - Alias
     - Key password
   - Complete the wizard to create your keystore

   **IMPORTANT**: Save your keystore file (.jks) and passwords securely! If you lose these, you'll be unable to update your app in the future.

### 8. Generate a signed App Bundle

1. In Android Studio, go to Build > Generate Signed Bundle / APK
2. Select "Android App Bundle"
3. Select your keystore and enter your passwords
4. Choose "release" build variant
5. Click "Finish" to generate the AAB file
6. The AAB file will be generated at the location shown in Android Studio (usually in `app/release/`)

### 9. Upload to Google Play Console

1. Log in to [Google Play Console](https://play.google.com/console)
2. Create a new app or select an existing one
3. Navigate to Production > Create new release
4. Upload your AAB file
5. Complete the store listing information:
   - App title
   - Short description
   - Full description
   - Screenshots (at least 2)
   - Feature graphic
   - Icon
6. Complete content rating questionnaire
7. Set up pricing and distribution
8. Submit for review

## Important Notes

- Keep your signing keystore file (.jks) secure - losing it means you cannot update your app
- The review process typically takes 1-3 business days
- Make sure your app complies with Google Play policies
- For subsequent updates, repeat steps 2, 4, 7 (just update version numbers), 8 and 9

## Troubleshooting

- If you encounter Java-related errors, make sure your JAVA_HOME environment variable is set correctly
- For any build errors in Android Studio, go to Build > Clean Project and try again
- Check that your app ID in capacitor.config.ts matches the package name in your Android Studio project
