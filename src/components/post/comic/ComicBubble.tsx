
import React, { useState, useEffect, useRef } from 'react';
import { X, Edit2, ChevronDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { bubbleStyles } from './comic-bubble-styles';

export type BubbleType = 'speech' | 'thought' | 'description';

export interface Bubble {
  id: string;
  type: BubbleType;
  content: string;
  position: { x: number; y: number };
  style?: string;
  color?: string;
}

interface ComicBubbleProps {
  id: string;
  type: BubbleType;
  content: string;
  position: { x: number; y: number };
  style?: string;
  color?: string;
  onUpdate: (id: string, updates: Partial<Bubble>) => void;
  onDelete: (id: string) => void;
}

export const ComicBubble: React.FC<ComicBubbleProps> = ({
  id,
  type,
  content,
  position,
  style = 'comic-round',
  color = 'white',
  onUpdate,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState(content);
  const [isDragging, setIsDragging] = useState(false);
  const [editPopoverOpen, setEditPopoverOpen] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  // Effect to focus on text area when editing starts
  useEffect(() => {
    if (isEditing) {
      const textArea = document.getElementById(`bubble-edit-${id}`);
      if (textArea) {
        textArea.focus();
      }
    }
  }, [isEditing, id]);
  
  // Auto-open edit mode for newly created bubbles
  useEffect(() => {
    // If content is still the default template text, open edit mode
    const isDefaultContent = 
      (type === 'speech' && content === 'Speech text here') ||
      (type === 'thought' && content === 'Thought bubble text') ||
      (type === 'description' && content === 'Description text');
    
    if (isDefaultContent) {
      setIsEditing(true);
      setEditPopoverOpen(true);
    }
  }, [content, type]);
  
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    
    setIsDragging(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startPosX = position.x;
    const startPosY = position.y;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
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
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleSaveContent = () => {
    onUpdate(id, { content: tempContent });
    setIsEditing(false);
    setEditPopoverOpen(false);
  };
  
  const handleCancel = () => {
    setTempContent(content);
    setIsEditing(false);
    setEditPopoverOpen(false);
  };
  
  const getTypeIcon = () => {
    switch (type) {
      case 'speech': return '💬';
      case 'thought': return '💭';
      case 'description': return '📝';
      default: return '💬';
    }
  };
  
  const getBubbleClassName = () => {
    let className = `absolute p-3 shadow-md select-none min-w-[100px] max-w-[200px] text-sm`;
    
    if (type === 'speech') {
      className += ' speech-bubble';
    } else if (type === 'thought') {
      className += ' thought-bubble';
    } else {
      className += ' rounded-md border border-gray-200';
    }
    
    if (isDragging) {
      className += ' cursor-grabbing opacity-80';
    } else {
      className += ' cursor-grab';
    }
    
    return className;
  };
  
  return (
    <Popover open={editPopoverOpen} onOpenChange={setEditPopoverOpen}>
      <PopoverTrigger asChild>
        <div
          ref={bubbleRef}
          className={getBubbleClassName()}
          style={{ 
            left: `${position.x}px`,
            top: `${position.y}px`,
            backgroundColor: color,
            zIndex: isDragging ? 100 : 10,
            touchAction: 'none',
          }}
          onMouseDown={handleDragStart}
          onClick={(e) => {
            // Only trigger edit if not dragging
            if (!isDragging) {
              e.stopPropagation();
              setEditPopoverOpen(true);
            }
          }}
        >
          {content}
          
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-foreground text-background opacity-80 hover:opacity-100 p-0 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </PopoverTrigger>
      
      <PopoverContent className="w-72 p-4" side="top">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getTypeIcon()}</span>
              <h4 className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)} Bubble</h4>
            </div>
            <Button 
              size="icon" 
              variant="outline" 
              className="h-7 w-7" 
              onClick={() => setEditPopoverOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Content</label>
            <Textarea
              id={`bubble-edit-${id}`}
              value={tempContent}
              onChange={(e) => setTempContent(e.target.value)}
              className="min-h-[80px]"
              placeholder={`Enter ${type} text...`}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              size="sm"
              className="bg-vice-purple hover:bg-vice-dark-purple"
              onClick={handleSaveContent}
            >
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface BubbleCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  bubbleType: BubbleType;
}

export const BubbleCreationDialog: React.FC<BubbleCreationDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  bubbleType
}) => {
  const [content, setContent] = useState('');
  
  const getDefaultText = () => {
    switch (bubbleType) {
      case 'speech': return 'Speech text here';
      case 'thought': return 'Thought bubble text';
      case 'description': return 'Description text';
      default: return '';
    }
  };
  
  // Set default content when dialog opens
  useEffect(() => {
    if (isOpen) {
      setContent(getDefaultText());
    }
  }, [isOpen, bubbleType]);
  
  const handleSave = () => {
    onSave(content);
    onClose();
  };
  
  const getTypeIcon = () => {
    switch (bubbleType) {
      case 'speech': return '💬';
      case 'thought': return '💭';
      case 'description': return '📝';
      default: return '💬';
    }
  };
  
  const getTypeTitle = () => {
    return bubbleType.charAt(0).toUpperCase() + bubbleType.slice(1);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <div className="flex items-center gap-2">
              <span>{getTypeIcon()}</span>
              <span>Add {getTypeTitle()} Bubble</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <label className="text-sm font-medium mb-2 block">Bubble Text</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
            placeholder={`Enter ${bubbleType} text...`}
            autoFocus
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            className="bg-vice-purple hover:bg-vice-dark-purple"
            onClick={handleSave}
          >
            Add Bubble
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const BubbleToolbar: React.FC<{
  onAddBubble: (type: BubbleType, content: string) => void;
}> = ({ onAddBubble }) => {
  const [creatingBubbleType, setCreatingBubbleType] = useState<BubbleType | null>(null);
  
  const handleOpenCreationDialog = (type: BubbleType) => {
    setCreatingBubbleType(type);
  };
  
  const handleCloseDialog = () => {
    setCreatingBubbleType(null);
  };
  
  const handleSaveBubble = (content: string) => {
    if (creatingBubbleType) {
      onAddBubble(creatingBubbleType, content);
      setCreatingBubbleType(null);
    }
  };
  
  return (
    <>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={() => handleOpenCreationDialog('speech')}
        >
          <div className="h-4 w-4 flex items-center justify-center">💬</div>
          <span>Speech</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={() => handleOpenCreationDialog('thought')}
        >
          <div className="h-4 w-4 flex items-center justify-center">💭</div>
          <span>Thought</span>
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          onClick={() => handleOpenCreationDialog('description')}
        >
          <div className="h-4 w-4 flex items-center justify-center">📝</div>
          <span>Description</span>
        </Button>
      </div>
      
      {/* Creation Dialog */}
      <BubbleCreationDialog 
        isOpen={creatingBubbleType !== null}
        onClose={handleCloseDialog}
        onSave={handleSaveBubble}
        bubbleType={creatingBubbleType || 'speech'}
      />
    </>
  );
};
