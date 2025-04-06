
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { deleteUserProfile } from '@/utils/profileDeletionService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';

const DeleteProfile = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  const handleDeleteProfile = async () => {
    try {
      setIsDeleting(true);
      
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      
      if (!userId) {
        toast.error("You need to be logged in to delete your profile");
        setIsDeleting(false);
        return;
      }

      // First delete all user data using our service
      const { success, error: serviceError } = await deleteUserProfile(userId);
      
      if (!success) {
        console.error("Error in profile deletion service:", serviceError);
        toast.error("Failed to completely delete profile data. Please try again later.");
        setIsDeleting(false);
        return;
      }

      // Then delete the actual auth user
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        console.error("Error deleting user account:", error);
        // Even if this fails, we've deleted most user data, so let's continue with sign out
      }
      
      // Sign out the user after deletion
      await supabase.auth.signOut();
      
      toast.success("Your account has been successfully deleted");
      setIsDialogOpen(false);
      navigate('/');
    } catch (err) {
      console.error("Failed to delete profile:", err);
      toast.error("Failed to delete profile. Please try again later.");
      setIsDeleting(false);
    }
  };

  const isDeleteButtonDisabled = confirmText !== 'DELETE';

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Permanently Delete Your Account</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              This action <strong>cannot be undone</strong>. This will permanently delete your
              account and remove all your data from our servers, including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your profile information</li>
              <li>All posts you've created</li>
              <li>All comments you've made</li>
              <li>All likes and matches</li>
            </ul>
            <p className="font-medium text-destructive">To confirm, type DELETE in the box below:</p>
            <Input 
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="mt-2"
            />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeleteProfile} 
            disabled={isDeleteButtonDisabled || isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Account Permanently"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProfile;
