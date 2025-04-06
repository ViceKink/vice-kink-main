
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PostCard } from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import CreatePostModal from '@/components/post/CreatePostModal';
import { ComicPanelData } from '@/components/post/comic/ComicPanel';

const Home = () => {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['allPosts'],
    queryFn: async () => {
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
        .order('boosted_at', { ascending: false, nullsFirst: false })
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
            
            processedPost['comicData'] = nonEmptyPanels;
          } catch (e) {
            console.error("Failed to parse comic data:", e);
          }
        } else if (post.media_url) {
          processedPost['images'] = [post.media_url];
        }
        
        return processedPost;
      });
      
      return postsWithProfiles;
    }
  });
  
  useEffect(() => {
    if (posts.length > 0) {
      if (!searchQuery) {
        setFilteredPosts(posts);
        return;
      }
      
      const query = searchQuery.toLowerCase();
      const filtered = posts.filter(post => 
        (post.title && post.title.toLowerCase().includes(query)) ||
        (post.content && post.content.toLowerCase().includes(query)) ||
        (post.user.name && post.user.name.toLowerCase().includes(query)) ||
        (post.community_name && post.community_name.toLowerCase().includes(query))
      );
      
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);
  
  const handleCreatePost = () => {
    setShowCreatePostModal(true);
  };
  
  const handlePostCreation = (content, type, comicData) => {
    console.log('Post created:', { content, type, comicData });
    setShowCreatePostModal(false);
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
        
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-foreground/50" />
          </div>
          <Input
            type="text"
            placeholder="Search posts, communities, or users..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {filteredPosts.length === 0 ? (
          <div className="p-8 bg-white dark:bg-card rounded-2xl shadow-md text-center">
            {searchQuery ? (
              <>
                <h3 className="text-xl font-bold mb-4">No Results Found</h3>
                <p className="text-foreground/70 mb-6">
                  No posts match your search for "{searchQuery}"
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setSearchQuery('')}
                >
                  Clear Search
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
      
      {showCreatePostModal && (
        <CreatePostModal 
          onClose={() => setShowCreatePostModal(false)}
          onPost={handlePostCreation}
        />
      )}
    </div>
  );
};

export default Home;
