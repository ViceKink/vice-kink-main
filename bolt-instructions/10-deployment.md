
# Deployment Guidelines

## Expo Build Process

1. **Configure app.json**
   - Set appropriate app name, slug, and version
   - Configure permissions
   - Add icons and splash screens

2. **Build Types**
   - Development builds for testing
   - Preview builds for stakeholder reviews
   - Production builds for stores

3. **Build Commands**
   ```bash
   # Install EAS CLI
   npm install -g eas-cli
   
   # Login to Expo
   eas login
   
   # Configure EAS build
   eas build:configure
   
   # Create development build
   eas build --profile development --platform ios/android
   
   # Create preview build
   eas build --profile preview --platform ios/android
   
   # Create production build
   eas build --profile production --platform ios/android
   ```

## App Store Submission

1. **Apple App Store**
   - Create App Store Connect account
   - Prepare app metadata, screenshots, descriptions
   - Follow App Review Guidelines
   - Submit build through EAS or manually

2. **Google Play Store**
   - Create Google Play Console account
   - Prepare store listing materials
   - Set up content rating questionnaire
   - Submit APK/AAB through EAS or manually

## Environment Management

1. **Environment Variables**
   - Use app.config.js for environment-specific configs
   - Secure storage for sensitive keys
   - Different Supabase keys per environment

2. **Feature Flags**
   - Implement feature flags for gradual rollout
   - Control features remotely
   - A/B testing capability

## Monitoring & Analytics

1. **Error Tracking**
   - Implement error boundaries
   - Set up crash reporting
   - Log key events and errors

2. **Usage Analytics**
   - Track key user journeys
   - Monitor performance metrics
   - Analyze user engagement

## Updates

1. **OTA Updates with Expo**
   - Implement Expo Updates
   - Rollout strategy for patches
   - Version management

2. **Native Updates**
   - Plan for native code changes
   - Maintain backward compatibility
   - Version migration strategy
