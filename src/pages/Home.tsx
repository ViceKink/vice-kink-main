
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PostCard } from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

const Home = () => {
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['allPosts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          created_at,
          likes_count,
          comments_count,
          media_url,
          profiles(name, avatar)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
      
      return data.map(post => ({
        id: post.id,
        user_id: post.user_id,
        content: post.content,
        images: post.media_url ? [post.media_url] : undefined,
        created_at: post.created_at,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        user: {
          name: post.profiles?.name || 'Anonymous',
          avatar: post.profiles?.avatar
        }
      }));
    }
  });
  
  const handleCreatePost = () => {
    toast.info('Post creation coming soon!');
    // Future implementation: setShowCreatePostModal(true);
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
    </div>
  );
};

export default Home;
