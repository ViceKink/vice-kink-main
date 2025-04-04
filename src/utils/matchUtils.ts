
import { interactionService } from '@/utils/match/interactionService';
import { getCompatibleProfiles } from '@/utils/match/matchingService';
import { DiscoverProfile } from '@/utils/match/types';

// Re-export the functions from interactionService
export const likeProfile = interactionService.likeProfile;
export const superlikeProfile = interactionService.superlikeProfile;
export const rejectProfile = interactionService.rejectProfile;
export const revealProfile = interactionService.revealProfile;

// Create a unified createInteraction function that returns a standard format
export const createInteraction = async (
  userId: string, 
  targetProfileId: string, 
  type: 'like' | 'dislike' | 'superlike'
) => {
  try {
    if (type === 'like') {
      const result = await interactionService.likeProfile(userId, targetProfileId);
      return { 
        success: true, 
        matched: result.isMatch,
        interaction: result.interaction
      };
    } else if (type === 'superlike') {
      const result = await interactionService.superlikeProfile(userId, targetProfileId);
      return { 
        success: true, 
        matched: result.isMatch,
        interaction: result.interaction
      };
    } else {
      const result = await interactionService.rejectProfile(userId, targetProfileId);
      return { 
        success: true, 
        matched: false,
        interaction: result
      };
    }
  } catch (error) {
    console.error('Error in createInteraction:', error);
    return { success: false, matched: false };
  }
};

// Export matchingService
export const matchingService = {
  getCompatibleProfiles: async (userId: string, maxDistance: number, sortOption: string): Promise<DiscoverProfile[]> => {
    const profiles = await getCompatibleProfiles(userId, maxDistance, sortOption);
    return profiles;
  }
};
