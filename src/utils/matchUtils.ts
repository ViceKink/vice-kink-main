
import { interactionService } from '@/utils/match/interactionService';

// Re-export the functions from interactionService
export const likeProfile = interactionService.likeProfile;
export const superlikeProfile = interactionService.superlikeProfile;
export const rejectProfile = interactionService.rejectProfile;
export const revealProfile = interactionService.revealProfile;

// Import statement for Button was missing
import { Button } from '@/components/ui/button';
import { SlidersHorizontal } from 'lucide-react';
