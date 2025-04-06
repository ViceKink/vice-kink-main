
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HeartIcon, MessageCircle } from 'lucide-react';
import { ComicPanelData } from './comic/ComicPanel';
import './comic/comic.css';
import { BoostButton } from '@/components/boost/BoostButton';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';

interface PostCardProps {
  post: {
    id: string;
    user: {
      name: string;
      avatar?: string;
    };
    title?: string;
    content: string;
    created_at: string;
    likes_count: number;
    comments_count: number;
    images?: string[];
    comicData?: ComicPanelData[];
    type?: 'text' | 'photo' | 'comic';
    community_name?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    name: string;
    avatar?: string;
  };
}

export const PostCard = ({ post }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const queryClient = useQueryClient();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  const toggleLike = async () => {
    try {
      const sessionData = await supabase.auth.getSession();
      const userId = sessionData.data.session?.user?.id;
      
      if (!userId) {
        toast.error("You need to be logged in to like posts");
        return;
      }
      
      setIsLiked(!isLiked);
      setLikesCount(prevCount => isLiked ? prevCount - 1 : prevCount + 1);
      
      if (!isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .insert({ post_id: post.id, user_id: userId });
          
        if (error) throw error;
        
        await supabase
          .from('posts')
          .update({ likes_count: likesCount + 1 })
          .eq('id', post.id);
          
        toast.success("Post liked");
      } else {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', userId);
          
        if (error) throw error;
        
        await supabase
          .from('posts')
          .update({ likes_count: likesCount - 1 })
          .eq('id', post.id);
          
        toast.success("Post unliked");
      }
      
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      setIsLiked(!isLiked);
      setLikesCount(prevCount => isLiked ? prevCount + 1 : prevCount - 1);
      toast.error("Failed to update like");
    }
  };
  
  const handleComment = () => {
    setShowCommentInput(!showCommentInput);
    
    if (!showCommentInput && comments.length === 0) {
      fetchComments();
    }
  };
  
  const fetchComments = async () => {
    try {
      setIsLoadingComments(true);
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          user_id,
          created_at,
          profiles (name, avatar)
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching comments:", error);
        setIsLoadingComments(false);
        return;
      }
      
      const formattedComments: Comment[] = data.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user: {
          name: comment.profiles?.name || 'Anonymous',
          avatar: comment.profiles?.avatar
        }
      }));
      
      setComments(formattedComments);
      setIsLoadingComments(false);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setIsLoadingComments(false);
    }
  };
  
  const submitComment = async () => {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    try {
      setIsSubmittingComment(true);
      
      const sessionData = await supabase.auth.getSession();
      const userId = sessionData.data.session?.user?.id;
      
      if (!userId) {
        toast.error("You need to be logged in to comment");
        return;
      }
      
      const { data: userData } = await supabase
        .from('profiles')
        .select('name, avatar')
        .eq('id', userId)
        .single();
      
      const { data: newComment, error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: userId,
          content: commentText.trim()
        })
        .select();
        
      if (error) throw error;
      
      if (newComment && newComment.length > 0) {
        setComments(prevComments => [
          ...prevComments,
          {
            id: newComment[0].id,
            content: newComment[0].content,
            created_at: newComment[0].created_at,
            user: {
              name: userData?.name || 'Anonymous',
              avatar: userData?.avatar
            }
          }
        ]);
        
        setCommentsCount(prevCount => prevCount + 1);
      }
      
      toast.success("Comment added");
      setCommentText('');
      
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const sessionData = await supabase.auth.getSession();
        const userId = sessionData.data.session?.user?.id;
        
        if (!userId) return;
        
        const { data, error } = await supabase
          .from('post_likes')
          .select('id')
          .eq('post_id', post.id)
          .eq('user_id', userId)
          .maybeSingle();
          
        if (error) throw error;
        
        setIsLiked(!!data);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };
    
    checkLikeStatus();
  }, [post.id]);
  
  const renderComicContent = () => {
    if (!post.comicData || post.comicData.length === 0) {
      return null;
    }
    
    const hasLayout = post.comicData.some(panel => panel.gridArea);
    
    if (hasLayout) {
      // Filter out any panels that don't have content, images, or bubbles
      const nonEmptyPanels = post.comicData.filter(panel => {
        const hasContent = panel.content && panel.content.trim().length > 0;
        const hasTitle = panel.title && panel.title.trim().length > 0;
        const hasImage = !!panel.image;
        const hasBubbles = panel.bubbles && panel.bubbles.length > 0;
        
        return hasContent || hasTitle || hasImage || hasBubbles;
      });

      if (nonEmptyPanels.length === 0) {
        return null;
      }
      
      return (
        <div 
          className="grid gap-2 mb-4 bg-muted/20 p-2 rounded-lg"
          style={{ 
            display: 'grid',
            gridTemplateRows: 'repeat(3, minmax(100px, auto))',
            gridTemplateColumns: 'repeat(2, 1fr)',
          }}
        >
          {nonEmptyPanels.map(panel => (
            <div
              key={panel.id}
              className="relative bg-background rounded-lg overflow-hidden"
              style={{ 
                gridArea: panel.gridArea,
                minHeight: '120px'
              }}
            >
              {panel.image ? (
                <img 
                  src={panel.image} 
                  alt="Comic panel"
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  {(panel.title || panel.content || (panel.bubbles && panel.bubbles.length > 0)) ? (
                    <div className="p-2 w-full h-full"></div>
                  ) : (
                    <p className="text-muted-foreground text-sm">No image</p>
                  )}
                </div>
              )}
              
              {panel.title && (
                <div className="absolute top-2 right-2 bg-purple-500 text-white px-2 py-1 text-xs font-bold uppercase transform rotate-2 shadow-md">
                  {panel.title}
                </div>
              )}
              
              {panel.content && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs">
                  {panel.content}
                </div>
              )}
              
              {panel.bubbles?.map(bubble => (
                <div 
                  key={bubble.id}
                  className={`absolute bg-white rounded-2xl p-2 text-xs shadow-md border border-gray-200 max-w-[180px] ${
                    bubble.type === 'speech' ? 'speech-bubble' : 
                    bubble.type === 'thought' ? 'thought-bubble' : ''
                  }`}
                  style={{ 
                    top: `${bubble.position.y}px`, 
                    left: `${bubble.position.x}px`,
                    zIndex: 5
                  }}
                >
                  {bubble.content}
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }
    
    // Filter non-layout panels as well
    const nonEmptyPanels = post.comicData.filter(panel => {
      const hasContent = panel.content && panel.content.trim().length > 0;
      const hasTitle = panel.title && panel.title.trim().length > 0;
      const hasImage = !!panel.image;
      const hasBubbles = panel.bubbles && panel.bubbles.length > 0;
      
      return hasContent || hasTitle || hasImage || hasBubbles;
    });

    if (nonEmptyPanels.length === 0) {
      return null;
    }
    
    return (
      <div className="space-y-2 mb-4">
        {nonEmptyPanels.map(panel => (
          <div 
            key={panel.id}
            className="relative bg-background rounded-lg overflow-hidden"
            style={{ minHeight: '200px' }}
          >
            {panel.image ? (
              <img 
                src={panel.image} 
                alt="Comic panel"
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full min-h-[200px] bg-muted flex items-center justify-center">
                {(panel.title || panel.content || (panel.bubbles && panel.bubbles.length > 0)) ? (
                  <div className="p-2 w-full h-full"></div>
                ) : (
                  <p className="text-muted-foreground">No image</p>
                )}
              </div>
            )}
            
            {panel.title && (
              <div className="absolute top-2 right-2 bg-purple-500 text-white px-3 py-1 text-sm font-bold uppercase transform rotate-2 shadow-md">
                {panel.title}
              </div>
            )}
            
            {panel.content && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm">
                {panel.content}
              </div>
            )}
            
            {panel.bubbles?.map(bubble => (
              <div 
                key={bubble.id}
                className={`absolute bg-white rounded-2xl p-2 text-xs shadow-md border border-gray-200 max-w-[180px] ${
                  bubble.type === 'speech' ? 'speech-bubble' : 
                  bubble.type === 'thought' ? 'thought-bubble' : ''
                }`}
                style={{ 
                  top: `${bubble.position.y}px`, 
                  left: `${bubble.position.x}px`,
                  zIndex: 5
                }}
              >
                {bubble.content}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.user.avatar} />
              <AvatarFallback>{post.user.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(post.created_at)}
                {post.community_name && ` · ${post.community_name}`}
              </p>
            </div>
          </div>
        </div>
        
        {post.title && (
          <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        )}
        
        {post.content && <p className="mb-4">{post.content}</p>}
        
        {post.type === 'comic' ? (
          renderComicContent()
        ) : post.images && post.images.length > 0 ? (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img src={post.images[0]} alt="" className="w-full max-h-[500px] object-cover" />
          </div>
        ) : null}
        
        <div className="flex items-center justify-between mt-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className={isLiked ? "text-red-500" : ""}
              onClick={toggleLike}
            >
              <HeartIcon className={`h-4 w-4 mr-1 ${isLiked ? "fill-red-500" : ""}`} />
              {likesCount || 0}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleComment}>
              <MessageCircle className="h-4 w-4 mr-1" />
              {commentsCount || 0}
            </Button>
            <BoostButton entityId={post.id} entityType="post" className="text-foreground" />
          </div>
        </div>
        
        {showCommentInput && (
          <div className="mt-4">
            {comments.length > 0 && (
              <div className="mb-4 space-y-3 max-h-[300px] overflow-y-auto">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-2 p-2 rounded-lg bg-muted/20">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.user.avatar} />
                      <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{comment.user.name}</p>
                        <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {isLoadingComments && (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">Loading comments...</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full h-24"
              />
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCommentInput(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={submitComment} 
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="bg-vice-purple hover:bg-vice-dark-purple"
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
