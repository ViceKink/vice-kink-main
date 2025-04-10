
# Screens & Navigation

## Navigation Structure

```
App
├── Auth Stack
│   ├── Login Screen
│   └── Signup Screen
│       └── Profile Creation Screens (wizard)
└── Main Tab Navigator
    ├── Home Tab
    │   ├── Feed Screen
    │   └── Post Detail Screen
    ├── Discover Tab
    │   ├── Discovery Screen
    │   └── Profile Detail Screen
    ├── Messages Tab
    │   ├── Matches List Screen
    │   ├── Likes Screen
    │   └── Chat Screen
    ├── Communities Tab
    │   ├── Communities List Screen
    │   └── Community Detail Screen
    └── Profile Tab
        ├── User Profile Screen
        ├── Edit Profile Screen
        └── Settings Screen
```

## Key Screens

### Authentication Screens

1. **Login Screen**
   - Email & password fields
   - Login button
   - Forgot password option
   - Sign up link

2. **Signup Screen**
   - Email, password, name, username fields
   - Terms acceptance checkbox
   - Submit button

3. **Profile Creation Wizard**
   - Multiple steps for different profile sections
   - Progress indicator
   - Photo upload
   - Preferences selection
   - Location setup

### Main Application Screens

1. **Home Feed**
   - List of posts from matches and communities
   - Create post button
   - Filter options
   - Pull-to-refresh

2. **Discovery Screen**
   - Profile cards to swipe/tap
   - Like/dislike/superlike buttons
   - Filter button
   - Match animations when matching occurs

3. **Messages & Matches**
   - Two tabs: Matches and Likes
   - List of conversations with preview
   - Unread indicators
   - Chat screen with message input and history

4. **Profile Screens**
   - View profile with photos, bio, interests
   - Tabs for personal info and posts
   - Edit profile button (own profile)
   - Like/message buttons (other profiles)

5. **Communities**
   - List of available communities
   - Joined communities section
   - Community details with members and posts
   - Join/leave buttons

6. **Settings**
   - Account settings
   - Privacy controls
   - Notification preferences
   - Logout and delete account options

## Navigation Logic

- Implement deep linking for notifications
- Handle auth state for protected routes
- Preserve navigation state where appropriate
- Implement smooth transitions between screens
