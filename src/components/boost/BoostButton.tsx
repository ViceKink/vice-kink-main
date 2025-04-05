
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Rocket } from 'lucide-react';
import { useAuth } from '@/context/auth';
import { useAdCoins } from '@/hooks/useAdCoins';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface BoostButtonProps {
  entityId: string;
  entityType: 'profile' | 'post';
  className?: string;
}

export const BoostButton: React.FC<BoostButtonProps> = ({ 
  entityId, 
  entityType, 
  className = ''
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { balance, purchaseFeature } = useAdCoins();
  const queryClient = useQueryClient();

  const handleBoost = async () => {
    if (!user?.id) {
      toast.error('You must be logged in to boost');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Check if user can purchase the boost with their AdCoins
      const featureType = entityType === 'profile' ? 'profile_boost' : 'post_boost';
      const purchaseSuccess = await purchaseFeature(featureType as any);
      
      if (!purchaseSuccess) {
        setIsProcessing(false);
        return;
      }

      // Call the appropriate boost function based on entity type
      let data, error;
      
      if (entityType === 'profile') {
        ({ data, error } = await supabase.rpc('boost_profile', { p_user_id: entityId }));
      } else {
        ({ data, error } = await supabase.rpc('boost_post', { p_post_id: entityId }));
      }
      
      if (error) {
        console.error(`Error boosting ${entityType}:`, error);
        toast.error(`Failed to boost ${entityType}`);
        return;
      }
      
      toast.success(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} boosted successfully!`);
      
      // Invalidate queries based on entity type
      if (entityType === 'profile') {
        queryClient.invalidateQueries({ queryKey: ['userProfile', entityId] });
        queryClient.invalidateQueries({ queryKey: ['discoverProfiles'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['userPosts', entityId] });
        queryClient.invalidateQueries({ queryKey: ['allPosts'] });
        queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      }
    } catch (error) {
      console.error('Boost error:', error);
      toast.error(`Failed to boost ${entityType}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Button
      onClick={handleBoost}
      disabled={isProcessing || balance < 5}
      variant="ghost"
      size="sm"
      className={className}
    >
      <Rocket className="h-5 w-5 mr-1" />
      Boost
    </Button>
  );
};
