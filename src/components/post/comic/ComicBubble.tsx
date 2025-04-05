
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, ThumbsUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type BubbleType = 'speech' | 'thought' | 'description';

export interface BubbleProps {
  id: string;
  type: BubbleType;
  content: string;
  position: { x: number; y: number };
  onUpdate: (id: string, content: string) => void;
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onDelete: (id: string) => void;
}

export const ComicBubble: React.FC<BubbleProps> = ({ 
  id, 
  type, 
  content, 
  position, 
  onUpdate, 
  onPositionChange,
  onDelete
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [localContent, setLocalContent] = React.useState(content);
  
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
      
      onPositionChange(id, {
        x: startPosX + dx,
        y: startPosY + dy
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
    onUpdate(id, localContent);
    setEditing(false);
  };
  
  // Different styles based on bubble type
  let bubbleClass = "absolute bg-white rounded-2xl p-3 shadow-md border border-gray-200 min-w-[120px] max-w-[200px]";
  
  if (type === 'speech') {
    bubbleClass += " speech-bubble";
  } else if (type === 'thought') {
    bubbleClass += " thought-bubble";
  } else {
    bubbleClass += " text-sm px-4";
  }
  
  return (
    <div 
      className={bubbleClass}
      style={{ 
        top: `${position.y}px`, 
        left: `${position.x}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: editing ? 10 : 5
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
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save
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
          <p 
            className="text-sm whitespace-pre-wrap" 
            onClick={() => setEditing(true)}
          >
            {content}
          </p>
        </>
      )}
    </div>
  );
};

// Component to add new bubbles to panels
export const BubbleToolbar: React.FC<{ 
  onAddBubble: (type: BubbleType) => void 
}> = ({ onAddBubble }) => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onAddBubble('speech')}
        className="flex items-center gap-1"
      >
        <MessageSquare className="h-4 w-4" />
        Speech
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onAddBubble('thought')}
        className="flex items-center gap-1"
      >
        <ThumbsUp className="h-4 w-4" />
        Thought
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onAddBubble('description')}
      >
        Description
      </Button>
    </div>
  );
};
