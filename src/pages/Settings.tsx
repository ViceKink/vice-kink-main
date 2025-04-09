
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/auth';
import AccountSettings from '@/components/settings/AccountSettings';
import AccountActions from '@/components/settings/AccountActions';
import NotificationSettings from '@/components/settings/NotificationSettings';
import PrivacySettings from '@/components/settings/PrivacySettings';
import { useLocation } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  
  // Check if we should open the delete dialog based on navigation state
  useEffect(() => {
    if (location.state?.openDeleteDialog) {
      setOpenDeleteDialog(true);
      setActiveTab('account'); // Ensure account tab is active
      
      // Clear the state after processing to prevent reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  return (
    <div className="container mx-auto px-4 max-w-4xl pt-20 pb-24 md:pb-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-6">
          <AccountSettings user={user} />
          <AccountActions 
            onLogout={logout} 
            openDeleteDialog={openDeleteDialog}
            onDeleteDialogChange={setOpenDeleteDialog}
          />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings />
        </TabsContent>
        
        <TabsContent value="privacy" className="space-y-6">
          <PrivacySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
