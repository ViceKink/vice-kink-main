
import React from 'react';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SaveProfileButtonProps {
  isSubmitting: boolean;
  onClick: () => void;
}

const SaveProfileButton: React.FC<SaveProfileButtonProps> = ({ isSubmitting, onClick }) => {
  return (
    <Button 
      onClick={onClick}
      disabled={isSubmitting}
      className="bg-vice-purple hover:bg-vice-dark-purple flex items-center"
    >
      {isSubmitting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Save className="w-4 h-4 mr-2" />
      )}
      Save Changes
    </Button>
  );
};

export default SaveProfileButton;
