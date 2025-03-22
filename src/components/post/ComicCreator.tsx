
import React, { useState } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Pencil, Trash2, Image, Move, X, Check } from 'lucide-react';

interface ComicPanel {
  id: string;
  content: string;
  image?: string;
  caption?: string;
}

interface ComicCreatorProps {
  onSave: (panels: ComicPanel[]) => void;
  onCancel: () => void;
}

const ComicCreator = ({ onSave, onCancel }: ComicCreatorProps) => {
  const [panels, setPanels] = useState<ComicPanel[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingPanelId, setEditingPanelId] = useState<string | null>(null);
  const [tempContent, setTempContent] = useState('');
  const [tempCaption, setTempCaption] = useState('');
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );
  
  const addPanel = () => {
    const newPanel: ComicPanel = {
      id: `panel-${Date.now()}`,
      content: '',
    };
    setPanels([...panels, newPanel]);
    setEditingPanelId(newPanel.id);
    setTempContent('');
    setTempCaption('');
  };
  
  const updatePanel = (id: string, updates: Partial<ComicPanel>) => {
    setPanels(panels.map(panel => 
      panel.id === id ? { ...panel, ...updates } : panel
    ));
  };
  
  const removePanel = (id: string) => {
    setPanels(panels.filter(panel => panel.id !== id));
  };
  
  const startEditing = (panel: ComicPanel) => {
    setEditingPanelId(panel.id);
    setTempContent(panel.content);
    setTempCaption(panel.caption || '');
  };
  
  const saveEditing = () => {
    if (editingPanelId) {
      updatePanel(editingPanelId, { 
        content: tempContent,
        caption: tempCaption || undefined
      });
      setEditingPanelId(null);
    }
  };
  
  const cancelEditing = () => {
    setEditingPanelId(null);
  };
  
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setPanels((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    
    setActiveId(null);
  };
  
  const handleSaveComic = () => {
    onSave(panels);
  };
  
  // Mock image upload (would be replaced with actual Supabase storage upload)
  const handleImageUpload = (panelId: string) => {
    // Mock upload by setting a sample image URL
    const sampleImages = [
      "/lovable-uploads/d35b405d-2dbf-4fcc-837b-1d48cb945bf4.png",
      "/lovable-uploads/ea8c69d9-6b5b-4bba-aceb-7d05f9a47ee5.png",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop"
    ];
    
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    updatePanel(panelId, { image: randomImage });
  };
  
  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <h3 className="text-xl font-bold mb-4">Create Comic</h3>
      
      <DndContext 
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToParentElement]}
      >
        <SortableContext items={panels.map(p => p.id)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {panels.map(panel => (
              <div key={panel.id} className="relative">
                {editingPanelId === panel.id ? (
                  <EditPanel 
                    content={tempContent}
                    caption={tempCaption}
                    setContent={setTempContent}
                    setCaption={setTempCaption}
                    onSave={saveEditing}
                    onCancel={cancelEditing}
                    onUploadImage={() => handleImageUpload(panel.id)}
                  />
                ) : (
                  <SortablePanel 
                    panel={panel} 
                    onEdit={() => startEditing(panel)} 
                    onRemove={() => removePanel(panel.id)}
                  />
                )}
              </div>
            ))}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {activeId ? (
            <div className="bg-muted p-4 rounded-lg border-2 border-dashed border-primary/50 shadow-md opacity-80">
              <div className="text-sm font-medium">Moving panel...</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
      
      <div className="flex flex-col gap-4">
        <Button 
          variant="outline" 
          className="flex items-center justify-center gap-2"
          onClick={addPanel}
        >
          <PlusCircle className="w-5 h-5" />
          Add Panel
        </Button>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button 
            className="bg-vice-purple hover:bg-vice-dark-purple"
            onClick={handleSaveComic}
            disabled={panels.length === 0}
          >
            Save Comic
          </Button>
        </div>
      </div>
    </div>
  );
};

interface SortablePanelProps {
  panel: ComicPanel;
  onEdit: () => void;
  onRemove: () => void;
}

const SortablePanel = ({ panel, onEdit, onRemove }: SortablePanelProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: panel.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="bg-background p-4 rounded-lg border border-border relative group"
    >
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          className="h-8 w-8 cursor-move" 
          {...attributes} 
          {...listeners}
        >
          <Move className="h-4 w-4" />
        </Button>
      </div>
      
      {panel.image ? (
        <div className="mb-3">
          <img 
            src={panel.image} 
            alt="Panel content"
            className="w-full h-40 object-cover rounded-md" 
          />
        </div>
      ) : (
        <div className="w-full h-40 bg-muted flex items-center justify-center rounded-md mb-3">
          <p className="text-muted-foreground">No image</p>
        </div>
      )}
      
      {panel.caption && (
        <div className="text-sm text-foreground/80 italic mb-2">
          "{panel.caption}"
        </div>
      )}
      
      <p className="whitespace-pre-line">{panel.content || "Empty panel"}</p>
    </div>
  );
};

interface EditPanelProps {
  content: string;
  caption: string;
  setContent: (content: string) => void;
  setCaption: (caption: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onUploadImage: () => void;
}

const EditPanel = ({ 
  content, 
  caption, 
  setContent, 
  setCaption, 
  onSave, 
  onCancel,
  onUploadImage
}: EditPanelProps) => {
  return (
    <div className="bg-background p-4 rounded-lg border-2 border-primary">
      <div className="mb-3 flex justify-between">
        <h4 className="font-medium">Edit Panel</h4>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onSave}>
            <Check className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="space-y-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full flex items-center justify-center gap-1"
          onClick={onUploadImage}
        >
          <Image className="h-4 w-4" />
          Add Image
        </Button>
        
        <div>
          <label className="text-sm font-medium">Caption</label>
          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Optional caption..."
            className="mt-1"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write panel content..."
            className="mt-1 min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
};

export default ComicCreator;
