
# Bolt Prompt Template

Below is a comprehensive prompt template to use with Bolt to create the Vice Kink app:

```
I want you to help me build a dating app called "Vice Kink" using Expo and React Native with TypeScript. The app should connect to a Supabase backend with the following URL: https://qgdacrkeafssldlxmajm.supabase.co and anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnZGFjcmtlYWZzc2xkbHhtYWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3Mzk4MTEsImV4cCI6MjA1ODMxNTgxMX0.mA3mj9HpoykT0jVmt7IgVHItcHIjiCkw3iI4Ra6urrA

The app focuses on connecting people with shared interests, vices, and kinks. I need you to build the following core features:

1. Authentication: Email/password signup and login with profile creation
2. Profile Management: Create and edit user profiles with photos, bio, preferences
3. Discovery: Users can discover and match with others based on interests
4. Matching: Like/dislike/superlike functionality with match notifications
5. Messaging: Chat between matched users
6. Posts: Users can create and interact with posts (text, images, comics)
7. Communities: Join communities based on interests

Important technical considerations:
- Use React Query for data fetching
- Implement secure authentication with Supabase
- Use Expo features for camera, location, and notifications
- Ensure responsive design for various device sizes
- When users delete their profile, preserve their posts/comments but anonymize them (set user_id to null)

The database has the following key tables:
- profiles (user information)
- posts (user-generated content)
- profile_interactions (likes/dislikes between users)
- matches (when users mutually like each other)
- messages (chat between matched users)
- communities (interest-based groups)
- vices and kinks (interest categories)

Please start by creating the project structure and authentication flow, then we'll build step by step.
```

Feel free to customize this prompt by adding specific details about UI preferences, feature priorities, or other requirements.
