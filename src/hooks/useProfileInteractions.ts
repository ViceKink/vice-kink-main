
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { interactionService } from '@/utils/match/interactionService';
import { toast } from '@/components/ui/use-toast';

export const useProfileInteractions = (userId: string) => {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: (targetProfileId: string) => {
      return interactionService.likeProfile(userId, targetProfileId);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['discover'] });
      
      if (result.isMatch) {
        toast({
          title: "It's a match!",
          description: "You've matched with this profile",
        });
        // Invalidate matches query to update the matches list
        queryClient.invalidateQueries({ queryKey: ['matches'] });
      } else {
        toast({
          title: "Profile liked",
          description: "We'll let them know you're interested",
        });
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error liking profile",
        description: error.message || "Something went wrong",
      });
    }
  });

  const superLikeMutation = useMutation({
    mutationFn: (targetProfileId: string) => {
      return interactionService.superlikeProfile(userId, targetProfileId);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['discover'] });
      
      if (result.isMatch) {
        toast({
          title: "It's a super match!",
          description: "You've super matched with this profile",
        });
        // Invalidate matches query to update the matches list
        queryClient.invalidateQueries({ queryKey: ['matches'] });
      } else {
        toast({
          title: "Profile super liked",
          description: "They'll see your super like",
        });
      }
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error super liking profile",
        description: error.message || "Something went wrong",
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (targetProfileId: string) => {
      return interactionService.rejectProfile(userId, targetProfileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discover'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error rejecting profile",
        description: error.message || "Something went wrong",
      });
    }
  });

  return {
    likeProfile: likeMutation.mutate,
    superLikeProfile: superLikeMutation.mutate,
    rejectProfile: rejectMutation.mutate,
    isLiking: likeMutation.isPending,
    isSuperLiking: superLikeMutation.isPending,
    isRejecting: rejectMutation.isPending,
  };
};
