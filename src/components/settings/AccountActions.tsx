
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut } from 'lucide-react';
import DeleteProfile from '@/components/profile/DeleteProfile';
import { toast } from 'sonner';

interface AccountActionsProps {
  onLogout: () => Promise<void>;
  openDeleteDialog?: boolean;
  onDeleteDialogChange?: (isOpen: boolean) => void;
}

const AccountActions = ({ onLogout, openDeleteDialog = false, onDeleteDialogChange }: AccountActionsProps) => {
  const handleLogout = async () => {
    try {
      await onLogout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to log out");
      console.error(error);
    }
  };

  useEffect(() => {
    // Scroll to delete section if dialog should be open
    if (openDeleteDialog) {
      const timer = setTimeout(() => {
        document.getElementById('delete-account-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [openDeleteDialog]);

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <LogOut className="h-5 w-5 text-vice-purple" />
          <CardTitle>Account Actions</CardTitle>
        </div>
        <CardDescription>
          Manage your account access and sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-base font-medium mb-2">Log out of your account</h3>
            <p className="text-sm text-muted-foreground mb-4">
              End your current session and return to the login page.
            </p>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
          
          <Separator className="my-2" />
          
          <div id="delete-account-section">
            <h3 className="text-base font-medium mb-2 text-destructive">Danger Zone</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data.
            </p>
            <DeleteProfile 
              isOpen={openDeleteDialog} 
              onOpenChange={onDeleteDialogChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountActions;
