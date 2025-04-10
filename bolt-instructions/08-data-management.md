
# Data Management

## State Management Strategy

- **Global Authentication State**
  - Use Zustand for global auth state
  - Store and persist auth tokens securely

- **Data Fetching**
  - Use React Query for data fetching, caching, and synchronization
  - Implement optimistic updates for better UX
  - Handle offline/online scenarios

- **Key Stores**
  - Auth store (user session, profile)
  - UI store (theme, preferences)
  - Feature-specific stores as needed

## Data Fetching Example

```typescript
// Example of a React Query hook for fetching profile data
const useProfileData = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, name, username, age, birthDate, gender,
          location, location_lat, location_lng, bio, avatar,
          photos, vices, kinks
        `)
        .eq('id', profileId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!profileId
  });
};

// Example of fetching user posts
const useProfilePosts = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ['userPosts', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          id, user_id, content, created_at, likes_count, comments_count,
          media_url, community_id, type, title
        `)
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });
        
      // Handle posts from deleted users showing "Deleted User"
      // Format and return the posts with author info
      // ...processing logic here
      
      return formattedPosts;
    },
    enabled: !!profileId
  });
};
```

## Caching Strategy

- Cache discovery profiles to reduce API calls
- Implement infinite scroll with cursor-based pagination
- Prefetch likely-to-be-viewed content
- Update cache on create/update operations

## Offline Support

- Cache essential data for offline viewing
- Queue mutations for when connectivity returns
- Show appropriate offline indicators
- Sync when back online

## Performance Considerations

- Use windowing for long lists (FlashList or similar)
- Lazy load images and heavy content
- Debounce frequent operations like search
- Optimize re-renders with memo and callbacks
