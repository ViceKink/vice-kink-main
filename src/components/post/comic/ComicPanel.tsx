import React, { useState } from 'react';
import { Pencil, Trash2, Image, X, Check, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileInput } from '@/components/ui/file-input';
import { ComicBubble, BubbleToolbar, BubbleType, Bubble } from './ComicBubble';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

export interface ComicPanelData {
  id: string;
  image?: string;
  bgColor?: string;
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

const bgColors = [
  { label: 'White', value: '#FFFFFF' },
  { label: 'Light Gray', value: '#F3F4F6' },
  { label: 'Light Blue', value: '#DBEAFE' },
  { label: 'Light Red', value: '#FEE2E2' },
  { label: 'Light Green', value: '#DCFCE7' },
  { label: 'Light Yellow', value: '#FEF3C7' },
  { label: 'Light Purple', value: '#F3E8FF' },
];

export const ComicPanel: React.FC<ComicPanelProps> = ({ 
  panel, 
  onEdit, 
  onUpdate, 
  onRemove, 
  isEditing 
}) => {
  const [tempContent, setTempContent] = useState(panel.content);
  const [tempTitle, setTempTitle] = useState(panel.title || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bgColor, setBgColor] = useState(panel.bgColor || '#FFFFFF');
  const [titlePosition, setTitlePosition] = useState({ x: 20, y: 20 });
  const [contentPosition, setContentPosition] = useState({ x: 20, y: panel.image ? 160 : 60 });
  const [isDraggingTitle, setIsDraggingTitle] = useState(false);
  const [isDraggingContent, setIsDraggingContent] = useState(false);
  
  const handleSave = () => {
    onUpdate({
      ...panel,
      content: tempContent,
      title: tempTitle,
      bgColor
    });
    onEdit(''); // Close editing
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpdate({
          ...panel,
          image: event.target.result as string
        });
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleSelectBackground = (colorValue: string) => {
    setBgColor(colorValue);
    onUpdate({
      ...panel,
      image: undefined,
      bgColor: colorValue
    });
  };
  
  const handleAddBubble = (type: BubbleType, content: string) => {
    const newBubble: Bubble = {
      id: `bubble-${Date.now()}`,
      type,
      content,
      position: { x: 50, y: 50 },
      style: 'comic-round',
      color: 'white'
    };
    
    onUpdate({
      ...panel,
      bubbles: [...panel.bubbles, newBubble]
    });
  };
  
  const handleUpdateBubble = (id: string, updates: Partial<Bubble>) => {
    onUpdate({
      ...panel,
      bubbles: panel.bubbles.map(bubble => 
        bubble.id === id ? { ...bubble, ...updates } : bubble
      )
    });
  };
  
  const handleDeleteBubble = (id: string) => {
    onUpdate({
      ...panel,
      bubbles: panel.bubbles.filter(bubble => bubble.id !== id)
    });
  };
  
  const handleTitleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingTitle(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = titlePosition.x;
    const startPosY = titlePosition.y;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      setTitlePosition({
        x: startPosX + dx,
        y: startPosY + dy
      });
    };
    
    const handleMouseUp = () => {
      setIsDraggingTitle(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleContentDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingContent(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = contentPosition.x;
    const startPosY = contentPosition.y;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      setContentPosition({
        x: startPosX + dx,
        y: startPosY + dy
      });
    };
    
    const handleMouseUp = () => {
      setIsDraggingContent(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
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
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full flex items-center justify-center gap-1"
                onClick={() => document.getElementById(`file-upload-${panel.id}`)?.click()}
              >
                <Image className="h-4 w-4" />
                Upload Image
              </Button>
              <input
                type="file"
                id={`file-upload-${panel.id}`}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              
              <div className="flex items-center justify-center">
                <div className="border-t border-border w-full"></div>
                <span className="px-2 text-xs text-muted-foreground">OR</span>
                <div className="border-t border-border w-full"></div>
              </div>
              
              <div>
                <p className="text-xs mb-1 text-center">Background Color</p>
                <div className="grid grid-cols-7 gap-2 justify-center">
                  {bgColors.map((color) => (
                    <button
                      key={color.value}
                      className={`w-6 h-6 rounded border ${bgColor === color.value ? 'ring-2 ring-primary' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleSelectBackground(color.value)}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>
            
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
            
            <Button
              className="w-full bg-vice-purple hover:bg-vice-dark-purple mt-2"
              onClick={handleSave}
            >
              <Check className="h-4 w-4 mr-2" />
              Save Panel
            </Button>
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
            <div 
              className="w-full h-full flex items-center justify-center rounded-lg"
              style={{ backgroundColor: panel.bgColor || '#F3F4F6' }}
            >
              {!panel.bgColor && <p className="text-muted-foreground">No image</p>}
            </div>
          )}
          
          {panel.title && (
            <div 
              className="absolute bg-purple-500 text-white px-3 py-1 text-sm font-bold uppercase transform rotate-2 shadow-md cursor-grab"
              style={{
                top: `${titlePosition.y}px`,
                left: `${titlePosition.x}px`,
                cursor: isDraggingTitle ? 'grabbing' : 'grab',
              }}
              onMouseDown={handleTitleDragStart}
            >
              {panel.title}
            </div>
          )}
          
          {panel.content && (
            <div 
              className="absolute bg-black/70 text-white p-2 rounded text-sm cursor-grab"
              style={{
                top: `${contentPosition.y}px`,
                left: `${contentPosition.x}px`,
                cursor: isDraggingContent ? 'grabbing' : 'grab',
              }}
              onMouseDown={handleContentDragStart}
            >
              {panel.content}
            </div>
          )}
          
          {panel.bubbles.map(bubble => (
            <ComicBubble 
              key={bubble.id}
              id={bubble.id}
              type={bubble.type}
              content={bubble.content}
              position={bubble.position}
              style={bubble.style}
              color={bubble.color}
              onUpdate={(id, updates) => handleUpdateBubble(id, updates)}
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
