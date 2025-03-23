
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import ProfileTag from '@/components/ui/ProfileTag';
import { Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditProfilePassionsProps {
  userData: any;
  updateField: (field: string, value: any) => void;
}

const EditProfilePassions = ({ userData, updateField }: EditProfilePassionsProps) => {
  const [passions, setPassions] = useState<string[]>([]);
  const [newPassion, setNewPassion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (userData?.passions) {
      setPassions(userData.passions);
    }
  }, [userData]);

  const handleAddPassion = () => {
    if (!newPassion.trim()) return;
    
    // Check if passion already exists
    if (passions.includes(newPassion.trim())) {
      toast.error('This passion is already in your list');
      return;
    }
    
    const updatedPassions = [...passions, newPassion.trim()];
    setPassions(updatedPassions);
    updateField('passions', updatedPassions);
    setNewPassion('');
    setIsAdding(false);
  };

  const handleRemovePassion = (index: number) => {
    const updatedPassions = passions.filter((_, i) => i !== index);
    setPassions(updatedPassions);
    updateField('passions', updatedPassions);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPassion();
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Add things you're passionate about to help others get to know you better.
      </p>
      
      <div className="flex flex-wrap gap-2">
        {passions.map((passion, index) => (
          <div key={index} className="group relative">
            <ProfileTag 
              label={passion}
              type="passion"
              isActive
            />
            <button
              onClick={() => handleRemovePassion(index)}
              className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-foreground/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {isAdding ? (
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Add a passion..."
              value={newPassion}
              onChange={(e) => setNewPassion(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-40 h-8"
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={handleAddPassion}
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2"
              onClick={() => {
                setIsAdding(false);
                setNewPassion('');
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add passion
          </button>
        )}
      </div>
    </div>
  );
};

export default EditProfilePassions;
