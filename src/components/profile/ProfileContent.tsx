
import React, { useState } from 'react';
import BentoProfile from '@/components/ui/BentoProfile';
import ProfileTabs from './ProfileTabs';
import ProfilePosts from './ProfilePosts';
import { UserProfile } from '@/types/auth';

interface ProfileContentProps {
  profileUser: UserProfile;
  isCurrentUser: boolean;
  userPosts: any[];
  onCreatePost: () => void;
}

const ProfileContent = ({ 
  profileUser, 
  isCurrentUser, 
  userPosts, 
  onCreatePost 
}: ProfileContentProps) => {
  const [activeTab, setActiveTab] = useState<'persona' | 'erotica'>('persona');
  
  const handleTabChange = (tab: 'persona' | 'erotica') => {
    setActiveTab(tab);
  };
  
  return (
    <>
      <ProfileTabs 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
      
      {activeTab === 'persona' && profileUser ? (
        <BentoProfile 
          profile={profileUser}
          isCurrentUser={isCurrentUser}
        />
      ) : activeTab === 'erotica' ? (
        <ProfilePosts 
          userPosts={userPosts}
          isCurrentUser={isCurrentUser}
          onCreatePost={onCreatePost}
        />
      ) : null}
    </>
  );
};

export default ProfileContent;
