import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HeartIcon, MessageCircle, MoreVertical, Trash2 } from 'lucide-react';
import { ComicPanelData } from './comic/ComicPanel';
import './comic/comic.css';
import { BoostButton } from '@/components/boost/BoostButton';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface PostCardProps {
  post: {
    id: string;
    user: {
      name: string;
      avatar?: string;
    };
    user_id: string;
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
  onDelete?: () => void;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string | null;
  user: {
    name: string;
    avatar?: string;
  };
}

interface CommentItemProps {
  comment: Comment;
  onDelete: (commentId: string) => Promise<void>;
}

const CommentItem = ({ comment, onDelete }: CommentItemProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      setCurrentUserId(data.session?.user?.id || null);
    };
    
    fetchCurrentUser();
  }, []);
  
  const isCommentOwner = currentUserId === comment.user_id && comment.user_id !== null;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="flex gap-2 p-2 rounded-lg bg-muted/20">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.user.avatar} />
        <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">{comment.user.name}</p>
            <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
          </div>
          {isCommentOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(comment.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <p className="text-sm">{comment.content}</p>
      </div>
    </div>
  );
};

export const PostCard = ({ post, onDelete }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.comments_count);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isCurrentUserPost, setIsCurrentUserPost] = useState(false);
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
      
      const { data: commentsData, error } = await supabase
        .from('comments')
        .select('id, content, user_id, created_at')
        .eq('post_id', post.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching comments:", error);
        setIsLoadingComments(false);
        return;
      }
      
      if (commentsData.length === 0) {
        setComments([]);
        setIsLoadingComments(false);
        return;
      }
      
      const userIds = commentsData
        .filter(comment => comment.user_id !== null)
        .map(comment => comment.user_id);
      
      let profilesMap = {};
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, avatar')
          .in('id', userIds);
        
        if (profilesError) {
          console.error("Error fetching profiles for comments:", profilesError);
        } else if (profilesData) {
          profilesMap = profilesData.reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});
        }
      }
      
      const formattedComments: Comment[] = commentsData.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        user: {
          name: comment.user_id ? profilesMap[comment.user_id]?.name || 'Anonymous' : 'Deleted User',
          avatar: comment.user_id ? profilesMap[comment.user_id]?.avatar : undefined
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
        const newCommentWithUser = {
          id: newComment[0].id,
          content: newComment[0].content,
          created_at: newComment[0].created_at,
          user_id: newComment[0].user_id,
          user: {
            name: userData?.name || 'Anonymous',
            avatar: userData?.avatar
          }
        };
        
        setComments(prevComments => [newCommentWithUser, ...prevComments]);
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
  
  const handleDeleteComment = async (commentId: string) => {
    try {
      const sessionData = await supabase.auth.getSession();
      const userId = sessionData.data.session?.user?.id;
      
      if (!userId) {
        toast.error("You need to be logged in to delete comments");
        return;
      }
      
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);
        
      if (error) {
        console.error("Error deleting comment:", error);
        toast.error("Failed to delete comment");
        return;
      }
      
      setComments(comments.filter(comment => comment.id !== commentId));
      setCommentsCount(prevCount => Math.max(0, prevCount - 1));
      toast.success("Comment deleted successfully");
      
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    } catch (err) {
      console.error("Failed to delete comment:", err);
      toast.error("Failed to delete comment");
    }
  };
  
  const handleDeletePost = async () => {
    try {
      const sessionData = await supabase.auth.getSession();
      const userId = sessionData.data.session?.user?.id;
      
      if (!userId) {
        toast.error("You need to be logged in to delete posts");
        return;
      }
      
      if (userId !== post.user_id) {
        toast.error("You can only delete your own posts");
        return;
      }
      
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
        .eq('user_id', userId);
        
      if (error) {
        console.error("Error deleting post:", error);
        toast.error("Failed to delete post");
        return;
      }
      
      toast.success("Post deleted successfully");
      
      if (onDelete) {
        onDelete();
      }
      
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    } catch (err) {
      console.error("Failed to delete post:", err);
      toast.error("Failed to delete post");
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
  
  const formatTextWithLineBreaks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9]+\.[a-zA-Z]{2,}\.[a-zA-Z]{2,})|([a-zA-Z0-9]+\.[a-zA-Z]{2,})/g;
    
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      let lastIndex = 0;
      const parts = [];
      let match;
      let processedLine = line;
      
      while ((match = urlRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        
        let url = match[0];
        
        if (!url.match(/^https?:\/\//)) {
          url = 'https://' + url;
        }
        
        parts.push(
          <a 
            key={`${lineIndex}-${match.index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            {match[0]}
          </a>
        );
        
        lastIndex = match.index + match[0].length;
      }
      
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }
      
      if (parts.length === 0) {
        return (
          <React.Fragment key={lineIndex}>
            {line}
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        );
      }
      
      return (
        <React.Fragment key={lineIndex}>
          {parts}
          {lineIndex < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };
  
  const renderComicContent = () => {
    if (!post.comicData || post.comicData.length === 0) {
      return null;
    }
    
    const hasLayout = post.comicData.some(panel => panel.gridArea);
    
    if (hasLayout) {
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
  
  useEffect(() => {
    const checkCurrentUser = async () => {
      const sessionData = await supabase.auth.getSession();
      const userId = sessionData.data.session?.user?.id;
      setIsCurrentUserPost(userId === post.user_id && post.user_id !== null);
    };
    
    checkCurrentUser();
  }, [post.user_id]);
  
  const postUserName = post.user && post.user.name ? post.user.name : 'Deleted User';
  const postUserAvatar = post.user && post.user.avatar ? post.user.avatar : undefined;
  
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={postUserAvatar} />
              <AvatarFallback>{postUserName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{postUserName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(post.created_at)}
                {post.community_name && ` · ${post.community_name}`}
              </p>
            </div>
          </div>
          
          {isCurrentUserPost && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Post</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this post? This action cannot be undone and will also remove all comments on this post.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        
        {post.title && (
          <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
        )}
        
        {post.content && (
          <div className="mb-4 whitespace-pre-line">{formatTextWithLineBreaks(post.content)}</div>
        )}
        
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
                  <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    onDelete={handleDeleteComment} 
                  />
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
