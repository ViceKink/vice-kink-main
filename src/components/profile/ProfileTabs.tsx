
import React from 'react';

interface ProfileTabsProps {
  activeTab: 'persona' | 'erotica';
  onTabChange: (tab: 'persona' | 'erotica') => void;
}

const ProfileTabs = ({ activeTab, onTabChange }: ProfileTabsProps) => {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 gap-2 bg-secondary/30 p-1 rounded-xl">
        <button 
          className={`px-4 py-3 rounded-lg flex justify-center items-center transition-all ${
            activeTab === 'persona' 
              ? 'bg-white dark:bg-black text-foreground shadow-sm font-semibold' 
              : 'bg-transparent text-foreground/60 hover:text-foreground/80'
          }`}
          onClick={() => onTabChange('persona')}
        >
          <span className="font-medium">Persona</span>
        </button>
        <button 
          className={`px-4 py-3 rounded-lg flex justify-center items-center transition-all ${
            activeTab === 'erotica' 
              ? 'bg-black text-white shadow-sm' 
              : 'bg-transparent text-foreground/60 hover:text-foreground/80'
          }`}
          onClick={() => onTabChange('erotica')}
        >
          <span className="font-medium">Erotica</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileTabs;
