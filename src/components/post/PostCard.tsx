import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Rocket } from 'lucide-react';
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
import { BoostButton } from '@/components/boost/BoostButton';

interface Post {
  id: string;
  user_id: string;
  title?: string;
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

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user, isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const [localComments, setLocalComments] = useState<Comment[]>([]);
  const [localLikesCount, setLocalLikesCount] = useState(post.likes_count);
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const fetchComments = async () => {
      if (!post.id) return;
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id, 
          content, 
          created_at, 
          user_id
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching comments:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(comment => comment.user_id))];
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar')
          .in('id', userIds);
        
        if (profilesError) {
          console.error('Error fetching profiles for comments:', profilesError);
          return;
        }
        
        const profilesMap: Record<string, { name: string; avatar?: string }> = {};
        
        if (profilesData) {
          profilesData.forEach(profile => {
            profilesMap[profile.id] = {
              name: profile.name || 'Anonymous',
              avatar: profile.avatar
            };
          });
        }
        
        const commentsWithUsers = data.map(comment => {
          const userProfile = profilesMap[comment.user_id] || { name: 'Anonymous' };
          
          return {
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at,
            user: {
              id: comment.user_id,
              name: userProfile.name,
              avatar: userProfile.avatar
            }
          };
        });
        
        setLocalComments(commentsWithUsers);
      }
    };
    
    fetchComments();
  }, [post.id]);
  
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
  
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      if (liked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);
          
        if (error) throw error;
        return { action: 'unlike' };
      } else {
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
      setLocalLikesCount(prev => data.action === 'like' ? prev + 1 : prev - 1);
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts', post.user_id] });
      if (post.community_id) {
        queryClient.invalidateQueries({ queryKey: ['communityPosts', post.community_id] });
      }
    },
    onError: (error) => {
      toast.error('Failed to update like');
      console.error('Like error:', error);
    }
  });
  
  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !comment.trim()) throw new Error('User not authenticated or empty comment');
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          user_id: user.id,
          post_id: post.id,
          content: comment.trim()
        })
        .select();
        
      if (error) throw error;
      return data[0];
    },
    onSuccess: (newComment) => {
      const getProfile = async () => {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('name, avatar')
          .eq('id', user?.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile for new comment:', error);
          return;
        }
        
        setLocalComments(prev => [...prev, {
          id: newComment.id,
          content: newComment.content,
          created_at: newComment.created_at,
          user: {
            id: user?.id || '',
            name: profile?.name || user?.name || 'Anonymous',
            avatar: profile?.avatar || user?.photos?.[0]
          }
        }]);
      };
      
      getProfile();
      
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts', post.user_id] });
      if (post.community_id) {
        queryClient.invalidateQueries({ queryKey: ['communityPosts', post.community_id] });
      }
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
                <Link 
                  to={`/community/${post.community_id}`}
                  className="hover:underline"
                >
                  {post.community_name}
                </Link>
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
        {post.title && (
          <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
        )}
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
          <div>{localLikesCount} likes</div>
          <div>{localComments.length} comments</div>
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
        
        {user && post.user_id === user.id && (
          <BoostButton
            entityId={post.id}
            entityType="post"
            className="flex-1 flex items-center justify-center gap-2"
          />
        )}
        
        <Button 
          variant="ghost"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <MessageSquare className="h-5 w-5" />
          {!isMobile && "Comment"}
        </Button>
      </div>
      
      {localComments.length > 0 && (
        <div className="px-4 py-3 border-t border-border">
          <h4 className="text-sm font-medium mb-3">Comments</h4>
          <div className="space-y-3">
            {localComments.map(comment => (
              <div key={comment.id} className="flex items-start gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={comment.user.avatar} alt={comment.user.name} />
                  <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-muted rounded-lg p-2">
                    <div className="font-medium text-xs">{comment.user.name}</div>
                    <div className="text-sm mt-1">{comment.content}</div>
                  </div>
                  <div className="text-xs text-foreground/60 mt-1">
                    {timeAgo(comment.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
