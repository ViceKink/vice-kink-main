# Authentication

## Authentication Flow

Vice Kink uses Supabase Authentication with the following flows:

1. **Email & Password**
   - Primary authentication method
   - Email verification required
   - Password reset functionality

2. **Sign-up Process**
   - Collect email, password, name, and username
   - Create auth record and profile
   - Send verification email
   - Handle email confirmation

3. **Login Process**
   - Email and password validation
   - Fetch user profile data after successful auth
   - Store session securely

4. **Session Management**
   - Persistent sessions with secure storage
   - Auto-refresh for expired tokens
   - Logout functionality

## User Profile Creation

After authentication, each user needs a profile in the profiles table:

```typescript
// Example profile structure
interface UserProfile {
  id: string;            // Same as auth.users id
  name: string;
  username: string;
  age?: number;
  birthDate?: string;
  gender?: string;
  location?: string;
  location_lat?: number;
  location_lng?: number;
  bio?: string;
  avatar?: string;
  photos?: string[];
  vices?: string[];
  kinks?: string[];
  // Other preference fields...
}
```

## Profile Deletion

When users delete their account:
- Keep their posts and comments but anonymize them
- Remove all personal data
- Delete matches, likes, and messages
- Use the `deleteUserProfile` function that nullifies user_id in posts/comments

## Auth Context Provider

Implement a robust auth context provider that:
1. Manages authentication state
2. Provides login/signup/logout methods
3. Handles profile fetching and updating
4. Persists sessions across app restarts
