
# Database Structure

Vice Kink uses a Supabase database with the following key tables and relationships. The mobile app should connect to the same database to maintain consistency.

## Key Tables

### `profiles`
- Stores user profile information
- Connected to auth.users via user ID
- Contains fields like name, age, location, bio, preferences

### `posts`
- User-generated content (text, images, comics)
- Related to profiles via user_id
- Can be associated with communities

### `communities`
- Interest groups users can join
- Has members, posts, and related metadata

### `profile_interactions`
- Records likes, dislikes, and super-likes between users
- Used for matchmaking logic

### `matches`
- Created when two users mutually like each other
- Foundation for the messaging system

### `messages`
- Communication between matched users
- Contains message content, read status, and timestamps

### `vices` and `kinks`
- Predefined lists of interests users can select
- Many-to-many relationship with profiles via junction tables

### `profile_vices` and `profile_kinks`
- Junction tables connecting profiles with their selected interests

## Database Schema Example

When a profile is deleted, posts and comments are preserved but anonymized by setting `user_id` to null. This maintains the content while removing the personal association.

```sql
-- Important note for post retrieval with deleted users
SELECT 
  p.*,
  COALESCE(profiles.name, 'Deleted User') as author_name,
  COALESCE(profiles.avatar, 'default_avatar_url') as author_avatar
FROM 
  posts p
LEFT JOIN 
  profiles ON p.user_id = profiles.id
```
