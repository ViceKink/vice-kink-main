
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface ProfileEditHeaderProps {
  onBack: () => void;
}

const ProfileEditHeader: React.FC<ProfileEditHeaderProps> = ({ onBack }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={onBack}
        className="flex items-center text-foreground/70 hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back to Profile
      </button>
    </div>
  );
};

export default ProfileEditHeader;
