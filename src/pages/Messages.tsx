
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Heart } from 'lucide-react';
import { useAuth } from '@/context/auth';

// Mock data for likes
const mockLikes = [
  {
    id: '1',
    user: {
      id: 'user123',
      name: 'Niharika Singh',
      photo: '/lovable-uploads/d35b405d-2dbf-4fcc-837b-1d48cb945bf4.png',
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    user: {
      id: 'user456',
      name: 'Arjun Kumar',
      photo: null,
    },
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    user: {
      id: 'user789',
      name: 'Priya Desai',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop',
    },
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock data for conversations
const mockConversations = [
  {
    id: 'conv1',
    user: {
      id: 'user123',
      name: 'Niharika Singh',
      photo: '/lovable-uploads/d35b405d-2dbf-4fcc-837b-1d48cb945bf4.png',
    },
    lastMessage: {
      content: 'I really enjoyed our conversation about art yesterday!',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isRead: true,
    },
  },
  {
    id: 'conv2',
    user: {
      id: 'user456',
      name: 'Arjun Kumar',
      photo: null,
    },
    lastMessage: {
      content: 'Would you be interested in getting coffee sometime?',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      isRead: false,
    },
  },
  {
    id: 'conv3',
    user: {
      id: 'user789',
      name: 'Priya Desai',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop',
    },
    lastMessage: {
      content: 'Check out this event I found!',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      isRead: true,
    },
  },
];

// Mock conversation messages
const mockMessages = [
  {
    id: 'msg1',
    sender: 'user123',
    content: 'Hi there! I noticed we share an interest in photography.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg2',
    sender: 'currentUser',
    content: 'Yes! I love taking landscape photos. What about you?',
    timestamp: new Date(Date.now() - 1.9 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg3',
    sender: 'user123',
    content: 'I mostly do portrait photography, but I\'ve been wanting to try landscapes.',
    timestamp: new Date(Date.now() - 1.8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg4',
    sender: 'currentUser',
    content: 'That\'s cool! I could give you some tips if you\'re interested.',
    timestamp: new Date(Date.now() - 1.7 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'msg5',
    sender: 'user123',
    content: 'I really enjoyed our conversation about art yesterday!',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

const Messages = () => {
  const { user } = useAuth();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  
  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
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
    <div className="container mx-auto px-4 max-w-6xl pt-20 pb-24 md:pb-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Messages</h1>
      
      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="likes" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Likes
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="messages" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Conversations List */}
            <div className="md:col-span-1 bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="p-3 border-b border-border">
                <h2 className="font-medium">Conversations</h2>
              </div>
              
              <div className="divide-y divide-border">
                {mockConversations.map((conversation) => (
                  <div 
                    key={conversation.id}
                    className={`p-3 cursor-pointer transition-colors hover:bg-accent/50 ${
                      activeConversation === conversation.id ? 'bg-accent' : ''
                    } ${!conversation.lastMessage.isRead ? 'bg-accent/30' : ''}`}
                    onClick={() => setActiveConversation(conversation.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conversation.user.photo || undefined} alt={conversation.user.name} />
                        <AvatarFallback>{conversation.user.name[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{conversation.user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(conversation.lastMessage.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Messages */}
            <div className="md:col-span-2 bg-card rounded-lg shadow-sm border border-border overflow-hidden flex flex-col h-[600px]">
              {activeConversation ? (
                <>
                  <div className="p-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={mockConversations.find(c => c.id === activeConversation)?.user.photo || undefined} 
                          alt={mockConversations.find(c => c.id === activeConversation)?.user.name} 
                        />
                        <AvatarFallback>
                          {mockConversations.find(c => c.id === activeConversation)?.user.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {mockConversations.find(c => c.id === activeConversation)?.user.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {mockMessages.map((message) => (
                      <div 
                        key={message.id}
                        className={`flex ${message.sender === 'currentUser' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender === 'currentUser' 
                            ? 'bg-vice-purple text-white rounded-br-none' 
                            : 'bg-accent rounded-bl-none'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <span className={`text-xs mt-1 block ${
                            message.sender === 'currentUser' ? 'text-white/70' : 'text-muted-foreground'
                          }`}>
                            {timeAgo(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 border-t border-border">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Type a message..." 
                        className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vice-purple"
                      />
                      <button className="bg-vice-purple hover:bg-vice-dark-purple text-white rounded-full px-4 py-2 text-sm font-medium transition-colors">
                        Send
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    Select a conversation from the list to start chatting
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="likes" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {mockLikes.map((like) => (
              <div 
                key={like.id}
                className="bg-card rounded-lg shadow-sm overflow-hidden border border-border hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={like.user.photo || undefined} alt={like.user.name} />
                      <AvatarFallback>{like.user.name[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <h3 className="font-medium">{like.user.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Liked you {timeAgo(like.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-2 mt-4">
                    <button className="flex-1 bg-vice-purple hover:bg-vice-dark-purple text-white rounded-lg py-2 text-sm font-medium transition-colors">
                      Message
                    </button>
                    <button className="flex-1 bg-transparent border border-border hover:bg-accent rounded-lg py-2 text-sm font-medium transition-colors">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Messages;
