
import React, { useState } from 'react';
import { UserProfile } from '@/context/AuthContext';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, AlertCircle } from 'lucide-react';
import ProfileTag from '@/components/ui/ProfileTag';

interface EditProfilePassionsProps {
  userData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

const EditProfilePassions = ({ userData, updateField }: EditProfilePassionsProps) => {
  const [newPassion, setNewPassion] = useState('');
  const [error, setError] = useState('');
  
  const passions = userData.passions || [];
  
  const handleAddPassion = () => {
    setError('');
    if (!newPassion.trim()) {
      setError('Please enter a passion');
      return;
    }
    
    if (passions.includes(newPassion.trim())) {
      setError('This passion already exists');
      return;
    }
    
    if (passions.length >= 10) {
      setError('You can add up to 10 passions');
      return;
    }
    
    const updatedPassions = [...passions, newPassion.trim()];
    updateField('passions', updatedPassions);
    setNewPassion('');
  };
  
  const handleRemovePassion = (index: number) => {
    const updatedPassions = passions.filter((_, i) => i !== index);
    updateField('passions', updatedPassions);
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Your Passions</h2>
      <p className="text-sm text-muted-foreground">
        Share what you're passionate about. You can add up to 10 passions.
      </p>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="newPassion" className="sr-only">
              Add New Passion
            </Label>
            <Input
              id="newPassion"
              value={newPassion}
              onChange={(e) => setNewPassion(e.target.value)}
              placeholder="Add a passion (e.g., Photography, Cooking)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPassion();
                }
              }}
            />
          </div>
          <Button
            onClick={handleAddPassion}
            variant="secondary"
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>
        
        {error && (
          <div className="flex items-center text-destructive text-sm gap-1">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mt-4">
          {passions.map((passion, index) => (
            <div key={index} className="group relative">
              <ProfileTag
                label={passion}
                type="primary"
                size="md"
                className="pr-7"
              />
              <button
                onClick={() => handleRemovePassion(index)}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-foreground/10 hover:bg-destructive/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {passions.length === 0 && (
            <div className="text-sm text-muted-foreground italic">
              No passions added yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfilePassions;
