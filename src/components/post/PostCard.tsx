
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HeartIcon, MessageCircle } from 'lucide-react';
import { ComicPanelData } from './comic/ComicPanel';
import './comic/comic.css';
import { BoostButton } from '@/components/boost/BoostButton';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

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

export const PostCard = ({ post }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const queryClient = useQueryClient();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  const toggleLike = () => {
    setIsLiked(!isLiked);
    
    // Update local state immediately for better UX
    const newLikesCount = isLiked ? post.likes_count - 1 : post.likes_count + 1;
    
    // We'll simulate updating the likes count here
    // In a real implementation, this would call an API endpoint
    toast.success(isLiked ? "Post unliked" : "Post liked");
    
    // Refresh posts data after like/unlike
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    }, 300);
  };
  
  const handleComment = () => {
    toast.info("Comments feature coming soon");
  };
  
  const renderComicContent = () => {
    if (!post.comicData || post.comicData.length === 0) {
      return null;
    }
    
    // Check if the comic data has layout information
    const hasLayout = post.comicData.some(panel => panel.gridArea);
    
    if (hasLayout) {
      return (
        <div 
          className="grid gap-2 mb-4 bg-muted/20 p-2 rounded-lg"
          style={{ 
            display: 'grid',
            gridTemplateRows: 'repeat(3, minmax(100px, auto))',
            gridTemplateColumns: 'repeat(2, 1fr)',
          }}
        >
          {post.comicData.map(panel => (
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
                  <p className="text-muted-foreground text-sm">No image</p>
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
              
              {/* Render bubbles */}
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
    
    // Vertical layout for default view
    return (
      <div className="space-y-2 mb-4">
        {post.comicData.map(panel => (
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
                <p className="text-muted-foreground">No image</p>
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
            
            {/* Render bubbles */}
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
              <HeartIcon className="h-4 w-4 mr-1" />
              {post.likes_count || 0}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleComment}>
              <MessageCircle className="h-4 w-4 mr-1" />
              {post.comments_count || 0}
            </Button>
            <BoostButton entityId={post.id} entityType="post" className="text-foreground" />
          </div>
        </div>
      </div>
    </Card>
  );
};
