
import { supabase } from '@/integrations/supabase/client';
import { ComicPanelData } from '@/components/post/comic/ComicPanel';

export const fetchPosts = async () => {
  // Calculate the time 1 hour ago for boost expiration
  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);
  const oneHourAgoISOString = oneHourAgo.toISOString();
  
  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select(`
      id,
      user_id,
      title,
      content,
      created_at,
      likes_count,
      comments_count,
      media_url,
      community_id,
      boosted_at,
      type
    `)
    .order('created_at', { ascending: false });
  
  if (postsError) {
    console.error('Error fetching posts:', postsError);
    throw postsError;
  }
  
  const userIds = [...new Set(postsData.map(post => post.user_id))];
  
  const { data: profilesData, error: profilesError } = await supabase
    .from('profiles')
    .select('id, name, avatar')
    .in('id', userIds);
  
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    throw profilesError;
  }
  
  const profilesMap = profilesData.reduce((acc, profile) => {
    acc[profile.id] = profile;
    return acc;
  }, {});
  
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
  
  const postsWithProfiles = postsData.map(post => {
    const profile = profilesMap[post.user_id] || { name: 'Anonymous' };
    const community = post.community_id ? communitiesMap[post.community_id] : null;
    
    // Process based on post type
    let processedPost = {
      id: post.id,
      user_id: post.user_id,
      title: post.title,
      content: post.content,
      created_at: post.created_at,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      community_id: post.community_id,
      community_name: community ? community.name : undefined,
      boosted_at: post.boosted_at,
      type: post.type || 'text',
      user: {
        name: profile.name || 'Anonymous',
        avatar: profile.avatar
      }
    };
    
    // Handle different post types
    if (post.type === 'comic' && post.media_url) {
      try {
        // Parse comic data from media_url
        const comicData = JSON.parse(post.media_url) as ComicPanelData[];
        
        // Filter out empty panels
        const nonEmptyPanels = comicData.filter(panel => {
          const hasContent = panel.content && panel.content.trim().length > 0;
          const hasTitle = panel.title && panel.title.trim().length > 0;
          const hasImage = !!panel.image;
          const hasBubbles = panel.bubbles && panel.bubbles.length > 0;
          
          return hasContent || hasTitle || hasImage || hasBubbles;
        });
        
        if (nonEmptyPanels.length > 0) {
          processedPost['comicData'] = nonEmptyPanels;
        }
      } catch (e) {
        console.error("Failed to parse comic data:", e);
      }
    } else if (post.media_url) {
      processedPost['images'] = [post.media_url];
    }
    
    return processedPost;
  });

  // Sort posts based on boost status and creation date
  // Only consider posts as boosted if they were boosted less than 1 hour ago
  return postsWithProfiles.sort((a, b) => {
    const aIsBoosted = a.boosted_at && new Date(a.boosted_at) > new Date(oneHourAgoISOString);
    const bIsBoosted = b.boosted_at && new Date(b.boosted_at) > new Date(oneHourAgoISOString);
    
    if (aIsBoosted && !bIsBoosted) {
      return -1; // a comes first
    } else if (!aIsBoosted && bIsBoosted) {
      return 1; // b comes first
    } else if (aIsBoosted && bIsBoosted) {
      // Both are boosted, use boosted_at time
      return new Date(b.boosted_at).getTime() - new Date(a.boosted_at).getTime();
    } else {
      // Neither are boosted, use created_at time
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
};
