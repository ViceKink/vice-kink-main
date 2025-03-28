import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { UserProfile } from '@/types/auth';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import EditProfileBasic from '@/components/profile/edit/EditProfileBasic';
import EditProfileAbout from '@/components/profile/edit/EditProfileAbout';
import EditProfileBio from '@/components/profile/edit/EditProfileBio';
import EditProfilePassions from '@/components/profile/edit/EditProfilePassions';
import EditProfileFlirtingStyle from '@/components/profile/edit/EditProfileFlirtingStyle';
import VicesKinksManager from '@/components/profile/VicesKinksManager';
import EditProfileAudio from '@/components/profile/edit/EditProfileAudio';
import EditProfilePhotos from '@/components/profile/edit/EditProfilePhotos';
import { Separator } from '@/components/ui/separator';

const EditProfile = () => {
  const { user, updateProfile, updateUserVices, updateUserKinks } = useAuth();
  const navigate = useNavigate();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    
    try {
      await updateProfile(profileData);
      
      if (profileData.vices) {
        await updateUserVices(profileData.vices);
      }
      
      if (profileData.kinks) {
        await updateUserKinks(profileData.kinks);
      }
      
      toast.success('Profile updated successfully');
      navigate('/profile');
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      setError(error.message || 'Failed to update profile');
      toast.error(error.message || 'Failed to update profile');
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
        
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
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
