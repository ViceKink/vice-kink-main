
import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Post {
  id: string;
  user_id: string;
  content: string;
  images?: string[];
  created_at: string;
  likes_count: number;
  comments_count: number;
  community_id?: string;
  community_name?: string;
  user: {
    name: string;
    avatar?: string;
  };
}

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user, isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  
  // Check if the user has already liked the post
  useEffect(() => {
    if (!user?.id) return;
    
    const checkUserLike = async () => {
      const { data } = await supabase
        .from('post_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', post.id)
        .single();
      
      setLiked(!!data);
    };
    
    checkUserLike();
  }, [user?.id, post.id]);
  
  // Create mutation for liking a post
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      if (liked) {
        // Unlike post
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);
          
        if (error) throw error;
        return { action: 'unlike' };
      } else {
        // Like post
        const { error } = await supabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: post.id
          });
          
        if (error) throw error;
        return { action: 'like' };
      }
    },
    onSuccess: (data) => {
      setLiked(data.action === 'like');
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts', post.user_id] });
    },
    onError: (error) => {
      toast.error('Failed to update like');
      console.error('Like error:', error);
    }
  });
  
  // Create mutation for adding a comment
  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !comment.trim()) throw new Error('User not authenticated or empty comment');
      
      const { error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          post_id: post.id,
          content: comment.trim()
        });
        
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts', post.user_id] });
      toast.success('Comment added');
    },
    onError: (error) => {
      toast.error('Failed to add comment');
      console.error('Comment error:', error);
    }
  });
  
  const toggleLike = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to like posts');
      return;
    }
    likeMutation.mutate();
  };
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to comment');
      return;
    }
    commentMutation.mutate();
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit(e);
    }
  };
  
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return `${interval} year${interval === 1 ? '' : 's'} ago`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `${interval} month${interval === 1 ? '' : 's'} ago`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `${interval} day${interval === 1 ? '' : 's'} ago`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    }
    
    return `${Math.floor(seconds)} second${seconds === 1 ? '' : 's'} ago`;
  };
  
  return (
    <div className="bg-card rounded-xl shadow-md overflow-hidden border border-border">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user.avatar} alt={post.user.name} />
            <AvatarFallback>{post.user.name[0]}</AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            {post.community_name && (
              <div className="text-xs text-vice-purple font-medium">
                {post.community_name}
              </div>
            )}
            <Link 
              to={`/profile/${post.user_id}`} 
              className="font-medium hover:underline"
            >
              {post.user.name}
            </Link>
            <div className="text-xs text-foreground/60">{timeAgo(post.created_at)}</div>
          </div>
        </div>
      </div>
      
      <div className="px-4 pb-3">
        <p className="whitespace-pre-line">{post.content}</p>
      </div>
      
      {post.images && post.images.length > 0 && (
        <div className="w-full">
          {post.images.length === 1 ? (
            <img 
              src={post.images[0]} 
              alt="Post content" 
              className="w-full h-auto max-h-[500px] object-cover"
            />
          ) : (
            <div className="grid grid-cols-2 gap-1">
              {post.images.map((img, index) => (
                <img 
                  key={index}
                  src={img} 
                  alt={`Post content ${index + 1}`} 
                  className="w-full h-auto max-h-[300px] object-cover"
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="px-4 py-2 border-t border-border text-sm text-foreground/60">
        <div className="flex justify-between">
          <div>{post.likes_count + (liked && !likeMutation.isPending ? 1 : 0)} likes</div>
          <div>{post.comments_count} comments</div>
        </div>
      </div>
      
      <div className="px-4 py-1 border-t border-border flex justify-between">
        <Button 
          variant="ghost" 
          className={cn("flex-1 flex items-center justify-center gap-2", liked && "text-red-500")}
          onClick={toggleLike}
          disabled={likeMutation.isPending}
        >
          <Heart className={cn("h-5 w-5", liked && "fill-current")} />
          {!isMobile && "Like"}
        </Button>
        
        <Button 
          variant="ghost"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <MessageSquare className="h-5 w-5" />
          {!isMobile && "Comment"}
        </Button>
      </div>
      
      <form onSubmit={handleCommentSubmit} className="px-4 py-3 border-t border-border flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.photos?.[0]} alt={user?.name} />
          <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 relative">
          <Input 
            placeholder="Write a comment..." 
            className="rounded-full bg-muted border-none pr-16"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {comment.trim() && (
            <Button 
              type="submit" 
              size="sm" 
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 bg-vice-purple hover:bg-vice-dark-purple"
              disabled={commentMutation.isPending}
            >
              Post
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};
