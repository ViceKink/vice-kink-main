
import React, { useState, useEffect } from 'react';
import { X, Image, Smile, AlignLeft, BookOpen, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import ComicCreator from './ComicCreator';
import { toast } from 'sonner';

interface Community {
  id: string;
  name: string;
  type: 'vice' | 'kink';
}

interface CreatePostModalProps {
  onClose: () => void;
  onPost: (content: string, type: 'text' | 'comic', comicData?: any) => void;
}

const CreatePostModal = ({ onClose, onPost }: CreatePostModalProps) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState<'text' | 'photo' | 'comic'>('text');
  const [comicData, setComicData] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const { data, error } = await supabase
          .from('communities')
          .select('id, name, type')
          .order('name');
          
        if (error) throw error;
        setCommunities(data || []);
      } catch (error) {
        console.error('Error fetching communities:', error);
        toast.error('Failed to load communities');
      }
    };
    
    fetchCommunities();
  }, []);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('post-photos')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('post-photos')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };
  
  const handleSaveComic = (panels: any[]) => {
    setComicData(panels);
  };
  
  const handlePost = async () => {
    if (activeTab === 'text' && content.trim()) {
      try {
        setIsLoading(true);
        
        // Create post in the database
        const { data, error } = await supabase
          .from('posts')
          .insert({
            user_id: user?.id,
            title: title || null,
            content,
            type: 'text',
            community_id: selectedCommunity || null
          })
          .select()
          .single();
          
        if (error) throw error;
        
        toast.success('Post created successfully');
        onPost(content, 'text');
      } catch (error) {
        console.error('Error creating post:', error);
        toast.error('Failed to create post');
      } finally {
        setIsLoading(false);
      }
    } else if (activeTab === 'photo' && content.trim() && selectedImage) {
      try {
        setIsLoading(true);
        
        // Upload image first
        const imageUrl = await uploadImage(selectedImage);
        if (!imageUrl) throw new Error('Failed to upload image');
        
        // Create post with the image URL
        const { data, error } = await supabase
          .from('posts')
          .insert({
            user_id: user?.id,
            title: title || null,
            content,
            type: 'photo',
            community_id: selectedCommunity || null,
            media_url: imageUrl
          })
          .select()
          .single();
          
        if (error) throw error;
        
        toast.success('Post created successfully');
        onClose();
      } catch (error) {
        console.error('Error creating post with image:', error);
        toast.error('Failed to create post');
      } finally {
        setIsLoading(false);
      }
    } else if (activeTab === 'comic' && content.trim() && comicData) {
      try {
        setIsLoading(true);
        
        // In a real implementation, we would upload the comic data to Supabase storage
        // For now, we'll just handle it as a JSON string
        const comicDataString = JSON.stringify(comicData);
        
        const { data, error } = await supabase
          .from('posts')
          .insert({
            user_id: user?.id,
            title: title || null,
            content,
            type: 'comic',
            community_id: selectedCommunity || null,
            media_url: comicDataString // In a real implementation, this would be a URL to the stored comic data
          })
          .select()
          .single();
          
        if (error) throw error;
        
        toast.success('Comic post created successfully');
        onPost(content, 'comic', comicData);
      } catch (error) {
        console.error('Error creating comic post:', error);
        toast.error('Failed to create comic post');
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.error('Please add some content to your post');
    }
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
          
          <div className="mb-4">
            <Input
              placeholder="Post title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-2"
            />
            
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedCommunity || ''} onValueChange={setSelectedCommunity}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a community (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No community</SelectItem>
                  {communities.map((community) => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name} ({community.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs defaultValue="text" value={activeTab} onValueChange={(value) => setActiveTab(value as 'text' | 'photo' | 'comic')}>
            <TabsList className="mb-4">
              <TabsTrigger value="text" className="flex items-center gap-2">
                <AlignLeft className="h-4 w-4" />
                Text Post
              </TabsTrigger>
              <TabsTrigger value="photo" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Photo
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
                  <Smile className="w-4 h-4" />
                  Feeling
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="photo" className="space-y-4">
              <Textarea 
                placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
                className="min-h-[100px] border-none focus-visible:ring-0 bg-muted"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                {imagePreviewUrl ? (
                  <div className="relative">
                    <img 
                      src={imagePreviewUrl} 
                      alt="Preview" 
                      className="max-h-[250px] mx-auto object-contain rounded-lg"
                    />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-background/80"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreviewUrl(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop an image, or click to select one
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <label className="cursor-pointer">
                        Browse
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="comic">
              <div className="mb-4">
                <Textarea 
                  placeholder="Add a description to your comic..."
                  className="min-h-[80px] border-none focus-visible:ring-0 bg-muted mb-4"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
              
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
            disabled={
              isLoading || 
              !content.trim() || 
              (activeTab === 'photo' && !selectedImage) || 
              (activeTab === 'comic' && !comicData)
            }
          >
            {isLoading ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
