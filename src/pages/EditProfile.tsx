
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserProfile } from '@/context/AuthContext';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import EditProfileBasic from '@/components/profile/edit/EditProfileBasic';
import EditProfileAbout from '@/components/profile/edit/EditProfileAbout';
import EditProfileBio from '@/components/profile/edit/EditProfileBio';
import EditProfilePassions from '@/components/profile/edit/EditProfilePassions';
import VicesKinksManager from '@/components/profile/VicesKinksManager';
import EditProfileAudio from '@/components/profile/edit/EditProfileAudio';

const EditProfile = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>(user || {});
  
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading profile data...</p>
      </div>
    );
  }
  
  const handleUpdate = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile(profileData);
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const updateField = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // We'll remove this updateAboutField function and just use updateField directly
  
  return (
    <div className="min-h-screen pt-20 pb-28 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center text-foreground/70 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Profile
          </button>
          
          <Button 
            onClick={handleUpdate}
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
        </div>
        
        <h1 className="text-2xl font-bold mb-6">Edit Your Profile</h1>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="about">About Me</TabsTrigger>
            <TabsTrigger value="bio">Bio & Style</TabsTrigger>
            <TabsTrigger value="passions">Passions</TabsTrigger>
            <TabsTrigger value="vices">Vices</TabsTrigger>
            <TabsTrigger value="kinks">Kinks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="mt-4">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <EditProfileBasic 
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
            </div>
          </TabsContent>
          
          <TabsContent value="passions" className="mt-4">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <EditProfilePassions 
                userData={profileData} 
                updateField={updateField} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="vices" className="mt-4">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <VicesKinksManager mode="vices" />
            </div>
          </TabsContent>
          
          <TabsContent value="kinks" className="mt-4">
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <VicesKinksManager mode="kinks" />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 bg-card rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Voice Intro</h2>
          <EditProfileAudio 
            userData={profileData} 
            updateField={updateField} 
          />
        </div>
        
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleUpdate}
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
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
