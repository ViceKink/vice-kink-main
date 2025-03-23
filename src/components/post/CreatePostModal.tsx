
import React, { useState } from 'react';
import { X, Image, Smile, AlignLeft, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth';
import ComicCreator from './ComicCreator';

interface CreatePostModalProps {
  onClose: () => void;
  onPost: (content: string, type: 'text' | 'comic', comicData?: any) => void;
}

const CreatePostModal = ({ onClose, onPost }: CreatePostModalProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'comic'>('text');
  const [comicData, setComicData] = useState<any>(null);
  
  const handlePost = () => {
    if (activeTab === 'text' && content.trim()) {
      onPost(content, 'text');
    } else if (activeTab === 'comic' && comicData) {
      onPost(content, 'comic', comicData);
    }
  };
  
  const handleSaveComic = (panels: any[]) => {
    setComicData(panels);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold">Create Post</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.photos?.[0]} alt={user?.name} />
              <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="font-medium">{user?.name}</div>
          </div>
          
          <Tabs defaultValue="text" value={activeTab} onValueChange={(value) => setActiveTab(value as 'text' | 'comic')}>
            <TabsList className="mb-4">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <AlignLeft className="h-4 w-4" />
                Text Post
              </TabsTrigger>
              <TabsTrigger value="comic" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Comic
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-4">
              <Textarea 
                placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
                className="min-h-[150px] border-none focus-visible:ring-0 bg-muted"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  Photo
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Smile className="w-4 h-4" />
                  Feeling
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="comic">
              <ComicCreator 
                onSave={handleSaveComic}
                onCancel={() => setActiveTab('text')}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            className="bg-vice-purple hover:bg-vice-dark-purple" 
            onClick={handlePost}
            disabled={(activeTab === 'text' && !content.trim()) || (activeTab === 'comic' && !comicData)}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
