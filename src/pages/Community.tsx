
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { PostCard } from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

const Community = () => {
  const { id } = useParams();
  const [showCreatePostModal, setShowCreatePostModal] = React.useState(false);
  
  const { data: community, isLoading: communityLoading } = useQuery({
    queryKey: ['community', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communities')
        .select('id, name, type, description')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching community:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!id
  });
  
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['communityPosts', id],
    queryFn: async () => {
      // First fetch the posts
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
          community_id
        `)
        .eq('community_id', id)
        .order('created_at', { ascending: false });
      
      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }
      
      // Collect unique user IDs from posts
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      
      // Fetch all profiles in one query
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, avatar')
        .in('id', userIds);
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      // Create a map of user IDs to profile data for quick lookup
      const profilesMap = profilesData.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});
      
      // Merge the post data with profile information
      const postsWithProfiles = postsData.map(post => {
        const profile = profilesMap[post.user_id] || { name: 'Anonymous' };
        
        return {
          id: post.id,
          user_id: post.user_id,
          title: post.title,
          content: post.content,
          images: post.media_url ? [post.media_url] : undefined,
          created_at: post.created_at,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          community_id: post.community_id,
          community_name: community?.name,
          user: {
            name: profile.name || 'Anonymous',
            avatar: profile.avatar
          }
        };
      });
      
      return postsWithProfiles;
    },
    enabled: !!id && !!community
  });
  
  const handleCreatePost = () => {
    setShowCreatePostModal(true);
  };
  
  const isLoading = communityLoading || postsLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen py-24 px-4 md:px-6 flex justify-center items-center">
        <div className="animate-pulse space-y-6 w-full max-w-xl mx-auto">
          <div className="h-8 w-40 bg-gray-300 rounded mx-auto"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (!community) {
    return (
      <div className="min-h-screen py-24 px-4 md:px-6 flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Community Not Found</h1>
          <p className="mb-6">The community you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-24 px-4 md:px-6">
      <div className="max-w-xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">{community.name}</h1>
          {community.description && (
            <p className="mt-2 text-foreground/70">{community.description}</p>
          )}
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-vice-purple/10 text-vice-purple text-sm">
            {community.type}
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Posts</h2>
          <Button 
            onClick={handleCreatePost}
            className="bg-vice-purple hover:bg-vice-dark-purple"
          >
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Create Post
          </Button>
        </div>
        
        {posts.length === 0 ? (
          <div className="p-8 bg-white dark:bg-card rounded-2xl shadow-md text-center">
            <h3 className="text-xl font-bold mb-4">No Posts Yet</h3>
            <p className="text-foreground/70 mb-6">
              Be the first to create a post in this community!
            </p>
            <Button 
              className="bg-vice-purple hover:bg-vice-dark-purple"
              onClick={handleCreatePost}
            >
              Create Post
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
