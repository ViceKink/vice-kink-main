
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PostCard } from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import CreatePostModal from '@/components/post/CreatePostModal';

const Home = () => {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ['allPosts', searchQuery],
    queryFn: async () => {
      // First fetch the posts
      let postsQuery = supabase
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
        .order('created_at', { ascending: false });
      
      // Apply search filter if it exists
      if (searchQuery) {
        postsQuery = postsQuery.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }
      
      const { data: postsData, error: postsError } = await postsQuery;
      
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
      
      // Get all community IDs
      const communityIds = postsData
        .filter(post => post.community_id)
        .map(post => post.community_id);
      
      // Fetch community data if there are any community IDs
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
      
      // Merge the post data with profile information
      const postsWithProfiles = postsData.map(post => {
        const profile = profilesMap[post.user_id] || { name: 'Anonymous' };
        const community = post.community_id ? communitiesMap[post.community_id] : null;
        
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
          community_name: community ? community.name : undefined,
          user: {
            name: profile.name || 'Anonymous',
            avatar: profile.avatar
          }
        };
      });
      
      return postsWithProfiles;
    }
  });
  
  const handleCreatePost = () => {
    setShowCreatePostModal(true);
  };
  
  const handlePostCreated = () => {
    setShowCreatePostModal(false);
    refetch();
  };
  
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
  
  return (
    <div className="min-h-screen py-24 px-4 md:px-6">
      <div className="max-w-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Home</h1>
          <Button 
            onClick={handleCreatePost}
            className="bg-vice-purple hover:bg-vice-dark-purple"
          >
            <PlusCircle className="mr-1.5 h-4 w-4" />
            Create Post
          </Button>
        </div>
        
        <div className="mb-6 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts, communities, or users..."
              className="pl-10 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {posts.length === 0 ? (
          <div className="p-8 bg-white dark:bg-card rounded-2xl shadow-md text-center">
            <h3 className="text-xl font-bold mb-4">No Posts Yet</h3>
            <p className="text-foreground/70 mb-6">
              Be the first to create a post and share your thoughts!
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
      
      {showCreatePostModal && (
        <CreatePostModal 
          onClose={() => setShowCreatePostModal(false)}
          onPost={handlePostCreated}
        />
      )}
    </div>
  );
};

export default Home;
