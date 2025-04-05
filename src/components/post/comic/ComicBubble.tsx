
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Cloud, StickyNote, X, Check, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export type BubbleType = 'speech' | 'thought' | 'description';
export type BubbleStyle = 'comic-round' | 'comic-cloud' | 'comic-sharp' | 'comic-burst' | 'modern';

export interface Bubble {
  id: string;
  type: BubbleType;
  content: string;
  position: { x: number; y: number };
  style?: BubbleStyle;
  color?: string;
}

export interface BubbleProps {
  id: string;
  type: BubbleType;
  content: string;
  position: { x: number; y: number };
  style?: BubbleStyle;
  color?: string;
  onUpdate: (id: string, updates: Partial<Bubble>) => void;
  onDelete: (id: string) => void;
}

// Define bubble color options
export const bubbleColors = {
  white: { bg: 'bg-white', text: 'text-black', border: 'border-gray-300' },
  red: { bg: 'bg-[#ea384c]', text: 'text-white', border: 'border-[#ea384c]' },
  orange: { bg: 'bg-[#F97316]', text: 'text-white', border: 'border-[#F97316]' },
  pink: { bg: 'bg-[#D946EF]', text: 'text-white', border: 'border-[#D946EF]' },
  purple: { bg: 'bg-[#8B5CF6]', text: 'text-white', border: 'border-[#8B5CF6]' },
  blue: { bg: 'bg-[#33C3F0]', text: 'text-black', border: 'border-[#33C3F0]' },
  yellow: { bg: 'bg-yellow-300', text: 'text-black', border: 'border-yellow-300' },
};

export const ComicBubble: React.FC<BubbleProps> = ({ 
  id, 
  type, 
  content, 
  position, 
  style = 'comic-round',
  color = 'white',
  onUpdate,
  onDelete
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [localContent, setLocalContent] = useState(content);
  const [localStyle, setLocalStyle] = useState(style);
  const [localColor, setLocalColor] = useState(color);
  
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = position.x;
    const startPosY = position.y;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      onUpdate(id, {
        position: {
          x: startPosX + dx,
          y: startPosY + dy
        }
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleSave = () => {
    onUpdate(id, { 
      content: localContent,
      style: localStyle,
      color: localColor
    });
    setEditing(false);
  };
  
  // Different styles based on bubble type and style
  const getClassNames = () => {
    const colorClasses = bubbleColors[color as keyof typeof bubbleColors] || bubbleColors.white;
    
    let baseClasses = `absolute ${colorClasses.bg} ${colorClasses.text} p-3 shadow-md border ${colorClasses.border} min-w-[120px] max-w-[250px] z-10`;
    
    if (style === 'comic-round') {
      if (type === 'speech') {
        return `${baseClasses} comic-speech-round`;
      } else if (type === 'thought') {
        return `${baseClasses} comic-thought-round`;
      } else {
        return `${baseClasses} comic-description-round`;
      }
    } else if (style === 'comic-cloud') {
      if (type === 'speech') {
        return `${baseClasses} comic-speech-cloud`;
      } else if (type === 'thought') {
        return `${baseClasses} comic-thought-cloud`;
      } else {
        return `${baseClasses} comic-description-cloud`;
      }
    } else if (style === 'comic-sharp') {
      if (type === 'speech') {
        return `${baseClasses} comic-speech-sharp`;
      } else if (type === 'thought') {
        return `${baseClasses} comic-thought-sharp`;
      } else {
        return `${baseClasses} comic-description-sharp`;
      }
    } else if (style === 'comic-burst') {
      if (type === 'speech') {
        return `${baseClasses} comic-speech-burst`;
      } else if (type === 'thought') {
        return `${baseClasses} comic-thought-burst`;
      } else {
        return `${baseClasses} comic-description-burst`;
      }
    } else { // modern
      if (type === 'speech') {
        return `${baseClasses} speech-bubble`;
      } else if (type === 'thought') {
        return `${baseClasses} thought-bubble`;
      } else {
        return `${baseClasses} text-sm px-4 rounded-md`;
      }
    }
  };
  
  return (
    <div 
      className={getClassNames()}
      style={{ 
        top: `${position.y}px`, 
        left: `${position.x}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: editing ? 100 : 5,
        transform: type === 'description' ? 'translateX(-50%)' : undefined
      }}
    >
      {editing ? (
        <div className="flex flex-col gap-2">
          <Textarea 
            value={localContent}
            onChange={(e) => setLocalContent(e.target.value)}
            className="text-sm min-h-[60px]"
            autoFocus
          />
          
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between text-sm">
              <span>Style:</span>
              <div className="flex gap-2">
                <button 
                  className={`w-6 h-6 border ${localStyle === 'comic-round' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setLocalStyle('comic-round')}
                >
                  <span className="sr-only">Round</span>
                  <div className="w-full h-full rounded-full bg-gray-200"></div>
                </button>
                <button 
                  className={`w-6 h-6 border ${localStyle === 'comic-cloud' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setLocalStyle('comic-cloud')}
                >
                  <span className="sr-only">Cloud</span>
                  <div className="w-full h-full rounded-full bg-gray-200" style={{borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%'}}></div>
                </button>
                <button 
                  className={`w-6 h-6 border ${localStyle === 'comic-sharp' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setLocalStyle('comic-sharp')}
                >
                  <span className="sr-only">Sharp</span>
                  <div className="w-full h-full bg-gray-200 rotate-45"></div>
                </button>
                <button 
                  className={`w-6 h-6 border ${localStyle === 'comic-burst' ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setLocalStyle('comic-burst')}
                >
                  <span className="sr-only">Burst</span>
                  <div className="w-full h-full bg-gray-200" style={{clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'}}></div>
                </button>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>Color:</span>
              <div className="flex gap-1">
                {Object.entries(bubbleColors).map(([colorName, _]) => (
                  <button
                    key={colorName}
                    className={`w-5 h-5 rounded-full border ${localColor === colorName ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setLocalColor(colorName)}
                    style={{ backgroundColor: colorName === 'white' ? '#FFFFFF' : 
                      colorName === 'red' ? '#ea384c' : 
                      colorName === 'orange' ? '#F97316' : 
                      colorName === 'pink' ? '#D946EF' : 
                      colorName === 'purple' ? '#8B5CF6' : 
                      colorName === 'blue' ? '#33C3F0' : 
                      colorName === 'yellow' ? '#FACC15' : 
                      '#FFFFFF' }}
                  >
                    <span className="sr-only">{colorName}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-1 mt-2">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div 
            className="absolute top-0 right-0 -mt-2 -mr-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-6 w-6 bg-background shadow-sm border" 
              onClick={() => onDelete(id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div 
            className="handle w-full h-6 absolute -top-3 left-0 cursor-grab"
            onMouseDown={handleDragStart}
          />
          <div 
            className="absolute inset-0 cursor-grab" 
            onMouseDown={handleDragStart}
          />
          <p 
            className="text-sm whitespace-pre-wrap z-10 relative" 
            onClick={() => setEditing(true)}
          >
            {content}
          </p>
        </>
      )}
    </div>
  );
};

// Component to add new bubbles to panels - now with proper dialogs
export const BubbleToolbar: React.FC<{ 
  onAddBubble: (type: BubbleType) => void 
}> = ({ onAddBubble }) => {
  const [showSpeechDialog, setShowSpeechDialog] = useState(false);
  const [showThoughtDialog, setShowThoughtDialog] = useState(false);
  const [showDescDialog, setShowDescDialog] = useState(false);
  const [content, setContent] = useState("");
  const [style, setStyle] = useState<BubbleStyle>("comic-round");
  const [color, setColor] = useState<string>("white");
  
  const handleAddBubble = (type: BubbleType) => {
    // Reset form state
    setContent("");
    setStyle("comic-round");
    setColor("white");
    
    // Show appropriate dialog
    if (type === "speech") setShowSpeechDialog(true);
    else if (type === "thought") setShowThoughtDialog(true);
    else setShowDescDialog(true);
  };
  
  const handleSubmit = (type: BubbleType) => {
    onAddBubble(type);
    
    // Close all dialogs
    setShowSpeechDialog(false);
    setShowThoughtDialog(false);
    setShowDescDialog(false);
  };
  
  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleAddBubble('speech')}
          className="flex items-center gap-1"
        >
          <MessageSquare className="h-4 w-4" />
          Speech
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleAddBubble('thought')}
          className="flex items-center gap-1"
        >
          <Cloud className="h-4 w-4" />
          Thought
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleAddBubble('description')}
          className="flex items-center gap-1"
        >
          <StickyNote className="h-4 w-4" />
          Description
        </Button>
      </div>

      <Dialog open={showSpeechDialog} onOpenChange={setShowSpeechDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Speech Bubble</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Speech Text:</label>
              <Textarea 
                placeholder="What do you want your character to say?" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bubble Style:</label>
              <div className="flex flex-wrap gap-2">
                {['comic-round', 'comic-cloud', 'comic-sharp', 'comic-burst', 'modern'].map((bubbleStyle) => (
                  <button 
                    key={bubbleStyle}
                    className={`w-12 h-10 border ${style === bubbleStyle ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setStyle(bubbleStyle as BubbleStyle)}
                  >
                    <div className={`w-full h-full ${bubbleStyle === 'comic-round' ? 'rounded-full' : 
                      bubbleStyle === 'comic-cloud' ? 'rounded-[50%/60%]' :
                      bubbleStyle === 'comic-sharp' ? 'rotate-45' :
                      bubbleStyle === 'comic-burst' ? '' : 'rounded-md'}`}
                      style={bubbleStyle === 'comic-burst' ? {clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'} : {}}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSpeechDialog(false)}>Cancel</Button>
            <Button onClick={() => handleSubmit('speech')}>Add Bubble</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showThoughtDialog} onOpenChange={setShowThoughtDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Thought Bubble</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Thought Text:</label>
              <Textarea 
                placeholder="What is your character thinking?" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bubble Style:</label>
              <div className="flex flex-wrap gap-2">
                {['comic-round', 'comic-cloud', 'comic-sharp', 'comic-burst', 'modern'].map((bubbleStyle) => (
                  <button 
                    key={bubbleStyle}
                    className={`w-12 h-10 border ${style === bubbleStyle ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setStyle(bubbleStyle as BubbleStyle)}
                  >
                    <div className={`w-full h-full ${bubbleStyle === 'comic-round' ? 'rounded-full' : 
                      bubbleStyle === 'comic-cloud' ? 'rounded-[50%/60%]' :
                      bubbleStyle === 'comic-sharp' ? 'rotate-45' :
                      bubbleStyle === 'comic-burst' ? '' : 'rounded-md'}`}
                      style={bubbleStyle === 'comic-burst' ? {clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'} : {}}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowThoughtDialog(false)}>Cancel</Button>
            <Button onClick={() => handleSubmit('thought')}>Add Bubble</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDescDialog} onOpenChange={setShowDescDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Description Box</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Description Text:</label>
              <Textarea 
                placeholder="Add a description or narration..." 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Box Style:</label>
              <div className="flex flex-wrap gap-2">
                {['comic-round', 'comic-cloud', 'comic-sharp', 'comic-burst', 'modern'].map((bubbleStyle) => (
                  <button 
                    key={bubbleStyle}
                    className={`w-12 h-10 border ${style === bubbleStyle ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setStyle(bubbleStyle as BubbleStyle)}
                  >
                    <div className={`w-full h-full ${bubbleStyle === 'comic-round' ? 'rounded-full' : 
                      bubbleStyle === 'comic-cloud' ? 'rounded-[50%/60%]' :
                      bubbleStyle === 'comic-sharp' ? 'rotate-45' :
                      bubbleStyle === 'comic-burst' ? '' : 'rounded-md'}`}
                      style={bubbleStyle === 'comic-burst' ? {clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'} : {}}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDescDialog(false)}>Cancel</Button>
            <Button onClick={() => handleSubmit('description')}>Add Box</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
