import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Heart, PenSquare, MessageSquare, Bookmark, MoreHorizontal, Image, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface Post {
  id: string;
  user_id: string;
  content: string;
  images?: string[];
  created_at: string;
  likes_count: number;
  comments_count: number;
  user: {
    name: string;
    avatar?: string;
  };
}

const mockPosts: Post[] = [
  {
    id: '1',
    user_id: 'user-123',
    content: "Just finished a photoshoot for my new profile. What do you all think of my new look? #NewProfilePic #ModelVibes",
    images: ["/lovable-uploads/d35b405d-2dbf-4fcc-837b-1d48cb945bf4.png"],
    created_at: new Date(Date.now() - 3600000).toISOString(),
    likes_count: 24,
    comments_count: 5,
    user: {
      name: "Niharika Singh",
      avatar: "/lovable-uploads/d35b405d-2dbf-4fcc-837b-1d48cb945bf4.png"
    }
  },
  {
    id: '2',
    user_id: 'user-456',
    content: "Looking for someone to connect with in Mumbai this weekend. Anyone up for coffee and good conversation? #MumbaiMeetup #WeekendVibes",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    likes_count: 18,
    comments_count: 12,
    user: {
      name: "Arjun Kumar"
    }
  },
  {
    id: '3',
    user_id: 'user-789',
    content: "Just updated my kinks section - feeling exposed but liberated! Anyone else feel nervous sharing their desires publicly? #AuthenticSelf #Vulnerability",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    likes_count: 42,
    comments_count: 8,
    user: {
      name: "Priya Desai",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop"
    }
  }
];

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [scrollY, setScrollY] = useState(0);
  const [newPostContent, setNewPostContent] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    
    const newPost: Post = {
      id: `temp-${Date.now()}`,
      user_id: user?.id || 'anonymous',
      content: newPostContent,
      created_at: new Date().toISOString(),
      likes_count: 0,
      comments_count: 0,
      user: {
        name: user?.name || 'Anonymous',
        avatar: user?.photos?.[0]
      }
    };
    
    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setIsCreatingPost(false);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthenticated && (
        <section 
          className="relative h-screen flex items-center justify-center overflow-hidden"
        >
          <div 
            className="absolute inset-0 bg-gradient-to-br from-vice-purple/30 to-vice-dark-purple/30 dark:from-vice-purple/10 dark:to-vice-black"
            style={{
              transform: `translateY(${scrollY * 0.2}px)`,
            }}
          ></div>
          
          <div 
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1603697257125-e4989f4ece13?q=80&w=1964&auto=format&fit=crop')] bg-cover bg-center opacity-20 dark:opacity-10"
            style={{
              transform: `scale(${1 + scrollY * 0.0005})`,
            }}
          ></div>
          
          <div className="container relative z-10 px-4 md:px-6 text-center">
            <div 
              className="animate-fade-in"
              style={{
                animationDelay: '0.3s',
                opacity: 0,
                animationFillMode: 'forwards',
              }}
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4">
                <span className="text-vice-purple">Vice</span> Kink
              </h1>
              
              <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-foreground/80">
                Find someone who gets your kinks, or spice up your marriage through creative erotic expression
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <NavLink 
                  to="/discover" 
                  className={cn(
                    "px-6 py-3 rounded-lg bg-vice-purple text-white transition-all duration-300",
                    "hover:bg-vice-dark-purple shadow-md hover:shadow-lg transform hover:-translate-y-1",
                    "focus:outline-none focus:ring-2 focus:ring-vice-purple focus:ring-opacity-50"
                  )}
                >
                  Start Discovering
                </NavLink>
                
                <NavLink 
                  to="/auth" 
                  className={cn(
                    "px-6 py-3 rounded-lg bg-transparent border border-vice-purple/50 text-foreground",
                    "transition-all duration-300 hover:bg-vice-purple/10 hover:border-vice-purple",
                    "focus:outline-none focus:ring-2 focus:ring-vice-purple focus:ring-opacity-50"
                  )}
                >
                  Sign In
                </NavLink>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {isAuthenticated && (
        <section className="py-6 px-1 sm:px-2 md:px-4 bg-background mt-16 md:mt-16">
          <div className="container mx-auto max-w-3xl">
            <div className="bg-card rounded-xl shadow-md mb-6 overflow-hidden border border-border">
              {!isCreatingPost ? (
                <div className="p-4 flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.photos?.[0]} alt={user?.name} />
                    <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div 
                    className="flex-1 bg-muted rounded-full px-4 py-2 text-muted-foreground cursor-pointer hover:bg-muted/80"
                    onClick={() => setIsCreatingPost(true)}
                  >
                    What's on your mind, {user?.name?.split(' ')[0]}?
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.photos?.[0]} alt={user?.name} />
                      <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{user?.name}</div>
                  </div>
                  
                  <Textarea 
                    placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
                    className="min-h-[120px] mb-3 border-none focus-visible:ring-0 bg-muted"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Image className="w-4 h-4" />
                        Photo
                      </Button>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsCreatingPost(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-vice-purple hover:bg-vice-dark-purple" 
                        size="sm"
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim()}
                      >
                        Post
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
      
      {!isAuthenticated && (
        <section className="py-20 px-4 md:px-6 bg-white dark:bg-black/30">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Express Your Desires Creatively
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Heart className="w-10 h-10 text-vice-red" />}
                title="Meaningful Connections"
                description="Find partners who share your unique desires and interests through our advanced matching algorithm."
              />
              
              <FeatureCard 
                icon={<PenSquare className="w-10 h-10 text-vice-purple" />}
                title="Creative Expression"
                description="Share your desires through text stories and interactive comics in a supportive environment."
              />
              
              <FeatureCard 
                icon={<MessageSquare className="w-10 h-10 text-vice-dark-purple" />}
                title="Safe Communication"
                description="Connect through secure messaging and share your preferences with like-minded individuals."
              />
            </div>
          </div>
        </section>
      )}
      
      {!isAuthenticated && (
        <section className="py-16 px-4 md:px-6 bg-gradient-to-br from-vice-purple/20 to-vice-dark-purple/20">
          <div className="container mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Ready to explore your desires?
            </h2>
            
            <p className="text-lg max-w-2xl mx-auto mb-8 text-foreground/80">
              Join our community today and discover connections that understand your unique interests.
            </p>
            
            <NavLink 
              to="/auth" 
              className={cn(
                "px-8 py-4 rounded-lg bg-vice-purple text-white transition-all duration-300",
                "hover:bg-vice-dark-purple shadow-md hover:shadow-xl transform hover:-translate-y-1",
                "focus:outline-none focus:ring-2 focus:ring-vice-purple focus:ring-opacity-50"
              )}
            >
              Get Started Now
            </NavLink>
          </div>
        </section>
      )}
      
      <footer className="py-8 px-4 md:px-6 bg-secondary/50 dark:bg-black/50 mt-auto">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-lg font-semibold">
                <span className="text-vice-purple">Vice</span> Kink
              </div>
              <p className="text-sm text-foreground/60">
                © 2023 All rights reserved.
              </p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-foreground/60 hover:text-vice-purple transition-colors">
                Terms
              </a>
              <a href="#" className="text-foreground/60 hover:text-vice-purple transition-colors">
                Privacy
              </a>
              <a href="#" className="text-foreground/60 hover:text-vice-purple transition-colors">
                Guidelines
              </a>
              <a href="#" className="text-foreground/60 hover:text-vice-purple transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const isMobile = useIsMobile();
  
  const toggleLike = () => {
    setLiked(!liked);
  };
  
  const toggleSave = () => {
    setSaved(!saved);
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
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user.avatar} alt={post.user.name} />
            <AvatarFallback>{post.user.name[0]}</AvatarFallback>
          </Avatar>
          
          <div>
            <div className="font-medium">{post.user.name}</div>
            <div className="text-xs text-foreground/60">{timeAgo(post.created_at)}</div>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
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
          <div>{post.likes_count + (liked ? 1 : 0)} likes</div>
          <div>{post.comments_count} comments</div>
        </div>
      </div>
      
      <div className="px-4 py-1 border-t border-border flex justify-between">
        <Button 
          variant="ghost" 
          className={cn("flex-1 flex items-center justify-center gap-2", liked && "text-red-500")}
          onClick={toggleLike}
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
        
        <Button 
          variant="ghost"
          className={cn("flex-1 flex items-center justify-center gap-2", saved && "text-yellow-500")}
          onClick={toggleSave}
        >
          <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
          {!isMobile && "Save"}
        </Button>
      </div>
      
      <div className="px-4 py-3 border-t border-border flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.photos?.[0]} alt={user?.name} />
          <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
        </Avatar>
        
        <Input 
          placeholder="Write a comment..." 
          className="rounded-full bg-muted border-none"
        />
      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white dark:bg-card rounded-2xl shadow-md hover:shadow-lg transition-all p-6 transform hover:-translate-y-1 duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-foreground/70">{description}</p>
    </div>
  );
};

export default Home;
