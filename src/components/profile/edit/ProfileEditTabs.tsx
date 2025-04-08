
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserProfile } from '@/types/auth';
import { Separator } from '@/components/ui/separator';
import EditProfileBasic from './EditProfileBasic';
import EditProfileAbout from './EditProfileAbout';
import EditProfileBio from './EditProfileBio';
import EditProfilePassions from './EditProfilePassions';
import EditProfileFlirtingStyle from './EditProfileFlirtingStyle';
import VicesKinksManager from '@/components/profile/VicesKinksManager';
import EditProfileAudio from './EditProfileAudio';
import EditProfilePhotos from './EditProfilePhotos';

interface ProfileEditTabsProps {
  profileData: Partial<UserProfile>;
  updateField: (field: string, value: any) => void;
}

const ProfileEditTabs: React.FC<ProfileEditTabsProps> = ({ profileData, updateField }) => {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="mb-6 flex flex-wrap">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="photos">Photos</TabsTrigger>
        <TabsTrigger value="about">About Me</TabsTrigger>
        <TabsTrigger value="bio">Bio</TabsTrigger>
        <TabsTrigger value="interests">Interests</TabsTrigger>
        <TabsTrigger value="flirting">Flirting Style</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="mt-4">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <EditProfileBasic 
            userData={profileData} 
            updateField={updateField} 
          />
        </div>
      </TabsContent>
      
      <TabsContent value="photos" className="mt-4">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <EditProfilePhotos
            userData={profileData}
            updateField={updateField}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="about" className="mt-4">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <EditProfileAbout 
            userData={profileData} 
            updateField={updateField} 
          />
        </div>
      </TabsContent>
      
      <TabsContent value="bio" className="mt-4">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <EditProfileBio 
            userData={profileData} 
            updateField={updateField} 
          />
          
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Voice Intro</h2>
            <EditProfileAudio 
              userData={profileData} 
              updateField={updateField} 
            />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="interests" className="mt-4">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Your Passions</h2>
          <EditProfilePassions 
            userData={profileData} 
            updateField={updateField} 
          />
          
          <Separator className="my-6" />
          
          <h2 className="text-lg font-semibold mb-4">Your Vices</h2>
          <VicesKinksManager 
            mode="vices" 
            userData={profileData}
            updateField={updateField}
          />
          
          <Separator className="my-6" />
          
          <h2 className="text-lg font-semibold mb-4">Your Kinks</h2>
          <VicesKinksManager 
            mode="kinks" 
            userData={profileData}
            updateField={updateField}
          />
        </div>
      </TabsContent>
      
      <TabsContent value="flirting" className="mt-4">
        <div className="bg-card rounded-lg p-6 shadow-sm">
          <EditProfileFlirtingStyle 
            userData={profileData} 
            updateField={updateField} 
          />
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileEditTabs;
