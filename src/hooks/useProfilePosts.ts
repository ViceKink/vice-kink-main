
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ComicPanelData } from '@/components/post/comic/ComicPanel';

export const useProfilePosts = (profileId?: string) => {
  // Fetch user posts
  return useQuery({
    queryKey: ['userPosts', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          created_at,
          likes_count,
          comments_count,
          media_url,
          community_id,
          type,
          title
        `)
        .eq('user_id', profileId)
        .order('created_at', { ascending: false });
        
      if (postsError) {
        console.error('Error fetching user posts:', postsError);
        return [];
      }
      
      if (postsData.length === 0) return [];
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('name, avatar')
        .eq('id', profileId)
        .single();
      
      if (profileError) {
        console.error('Error fetching profile for posts:', profileError);
        return postsData.map(post => ({
          ...post,
          images: post.media_url ? 
            (post.type === 'comic' ? undefined : [post.media_url]) : 
            undefined,
          comicData: post.type === 'comic' && post.media_url ? 
            JSON.parse(post.media_url) as ComicPanelData[] : 
            undefined,
          user: {
            name: 'Anonymous',
            avatar: undefined
          }
        }));
      }
      
      const communityIds = postsData
        .filter(post => post.community_id)
        .map(post => post.community_id);
      
      let communitiesMap = {};
      
      if (communityIds.length > 0) {
        const { data: communitiesData, error: communitiesError } = await supabase
          .from('communities')
          .select('id, name')
          .in('id', communityIds);
        
        if (!communitiesError && communitiesData) {
          communitiesMap = communitiesData.reduce((acc, community) => {
            acc[community.id] = community;
            return acc;
          }, {});
        }
      }
      
      return postsData.map(post => {
        const community = post.community_id ? communitiesMap[post.community_id] : null;
        
        return {
          id: post.id,
          user_id: post.user_id,
          title: post.title,
          content: post.content,
          type: post.type || 'text',
          images: post.type !== 'comic' && post.media_url ? [post.media_url] : undefined,
          comicData: post.type === 'comic' && post.media_url ? 
            JSON.parse(post.media_url) as ComicPanelData[] : 
            undefined,
          created_at: post.created_at,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          community_id: post.community_id,
          community_name: community ? community.name : undefined,
          user: {
            name: profileData?.name || 'Anonymous',
            avatar: profileData?.avatar
          }
        };
      });
    },
    enabled: !!profileId
  });
};
