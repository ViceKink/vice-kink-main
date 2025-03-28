
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, XCircle, ArrowUp } from 'lucide-react';

interface SortablePhotoItemProps {
  id: string;
  url: string;
  index: number;
  isMain: boolean;
  onDelete: (url: string) => void;
  onMakeMain: (url: string) => void;
}

const SortablePhotoItem = ({ 
  id, 
  url, 
  index, 
  isMain, 
  onDelete, 
  onMakeMain 
}: SortablePhotoItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative group border rounded-lg overflow-hidden"
    >
      <div 
        className="absolute top-2 left-2 bg-black/70 text-white p-1.5 rounded-full 
                cursor-grab opacity-0 group-hover:opacity-100 transition-opacity z-10"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </div>
      
      <img 
        src={url} 
        alt={`Profile photo ${index + 1}`} 
        className="w-full h-48 object-cover"
      />
      
      <button
        type="button"
        onClick={() => onDelete(url)}
        className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full 
                  opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Delete photo"
      >
        <XCircle size={18} />
      </button>
      
      {isMain ? (
        <span className="absolute bottom-2 left-2 bg-vice-purple text-white text-xs px-2 py-1 rounded-full">
          Main Photo
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onMakeMain(url)}
          className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full 
                    opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ArrowUp size={12} className="inline mr-1" />
          Make Main
        </button>
      )}
    </div>
  );
};

export default SortablePhotoItem;
