
import React, { useState } from 'react';
import { Pencil, Trash2, Image, Move, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ComicBubble, BubbleToolbar, BubbleType } from './ComicBubble';

export interface Bubble {
  id: string;
  type: BubbleType;
  content: string;
  position: { x: number; y: number };
}

export interface ComicPanelData {
  id: string;
  image?: string;
  title?: string;
  content: string;
  bubbles: Bubble[];
  gridArea?: string;
}

interface ComicPanelProps {
  panel: ComicPanelData;
  onEdit: (id: string) => void;
  onUpdate: (panel: ComicPanelData) => void;
  onRemove: (id: string) => void;
  isEditing: boolean;
}

export const ComicPanel: React.FC<ComicPanelProps> = ({ 
  panel, 
  onEdit, 
  onUpdate, 
  onRemove, 
  isEditing 
}) => {
  const [tempContent, setTempContent] = useState(panel.content);
  const [tempTitle, setTempTitle] = useState(panel.title || '');
  
  const handleSave = () => {
    onUpdate({
      ...panel,
      content: tempContent,
      title: tempTitle
    });
    onEdit(''); // Close editing
  };
  
  const handleImageUpload = () => {
    // Mock upload by setting a sample image URL
    const sampleImages = [
      "/lovable-uploads/d35b405d-2dbf-4fcc-837b-1d48cb945bf4.png",
      "/lovable-uploads/ea8c69d9-6b5b-4bba-aceb-7d05f9a47ee5.png",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop"
    ];
    
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    onUpdate({
      ...panel,
      image: randomImage
    });
  };
  
  const handleAddBubble = (type: BubbleType) => {
    const newBubble: Bubble = {
      id: `bubble-${Date.now()}`,
      type,
      content: type === 'speech' ? 'Speech text here' : 
              type === 'thought' ? 'Thought bubble text' : 'Description text',
      position: { x: 50, y: 50 }
    };
    
    onUpdate({
      ...panel,
      bubbles: [...panel.bubbles, newBubble]
    });
  };
  
  const handleUpdateBubble = (id: string, content: string) => {
    onUpdate({
      ...panel,
      bubbles: panel.bubbles.map(bubble => 
        bubble.id === id ? { ...bubble, content } : bubble
      )
    });
  };
  
  const handleBubblePositionChange = (id: string, position: { x: number; y: number }) => {
    onUpdate({
      ...panel,
      bubbles: panel.bubbles.map(bubble => 
        bubble.id === id ? { ...bubble, position } : bubble
      )
    });
  };
  
  const handleDeleteBubble = (id: string) => {
    onUpdate({
      ...panel,
      bubbles: panel.bubbles.filter(bubble => bubble.id !== id)
    });
  };
  
  return (
    <div 
      className="bg-background rounded-lg border border-border relative group"
      style={panel.gridArea ? { gridArea: panel.gridArea } : {}}
    >
      {isEditing ? (
        <div className="p-4 space-y-3">
          <div className="mb-3 flex justify-between">
            <h4 className="font-medium">Edit Panel</h4>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit('')}>
                <X className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave}>
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center justify-center gap-1"
              onClick={handleImageUpload}
            >
              <Image className="h-4 w-4" />
              {panel.image ? 'Change Image' : 'Add Image'}
            </Button>
            
            {panel.image && (
              <div className="relative">
                <img 
                  src={panel.image} 
                  alt="Panel background" 
                  className="w-full h-40 object-cover rounded-md" 
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-background/80"
                  onClick={() => onUpdate({ ...panel, image: undefined })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium">Panel Title</label>
              <Input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="Optional title..."
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Content/Caption</label>
              <Input
                value={tempContent}
                onChange={(e) => setTempContent(e.target.value)}
                placeholder="Panel content or caption..."
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Bubbles</label>
              <BubbleToolbar onAddBubble={handleAddBubble} />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full min-h-[200px]">
          {panel.image ? (
            <img 
              src={panel.image} 
              alt="Panel content"
              className="w-full h-full object-cover rounded-lg" 
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center rounded-lg">
              <p className="text-muted-foreground">No image</p>
            </div>
          )}
          
          {panel.title && (
            <div className="absolute top-2 right-2 bg-purple-500 text-white px-3 py-1 text-sm font-bold uppercase transform rotate-2 shadow-md">
              {panel.title}
            </div>
          )}
          
          {panel.content && (
            <div className="absolute bottom-2 left-0 right-0 mx-2 bg-black/70 text-white p-2 rounded text-sm">
              {panel.content}
            </div>
          )}
          
          {/* Render all bubbles */}
          {panel.bubbles.map(bubble => (
            <ComicBubble 
              key={bubble.id}
              id={bubble.id}
              type={bubble.type}
              content={bubble.content}
              position={bubble.position}
              onUpdate={handleUpdateBubble}
              onPositionChange={handleBubblePositionChange}
              onDelete={handleDeleteBubble}
            />
          ))}
          
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="outline" className="h-8 w-8 bg-background/80" onClick={() => onEdit(panel.id)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8 bg-background/80 text-destructive" onClick={() => onRemove(panel.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
