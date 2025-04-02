
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';
import { getUserAdCoins, addAdCoins, spendAdCoins } from '@/utils/adCoins/adCoinsService';
import { AdCoinFeature, FEATURE_COSTS } from '@/models/adCoinsTypes';
import { toast } from 'sonner';

export const useAdCoins = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdReady, setIsAdReady] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);
  
  // Initialize AdMob
  useEffect(() => {
    const initializeAdMob = async () => {
      if (window.AdMob) {
        try {
          setIsAdLoading(true);
          
          // Initialize AdMob
          await window.AdMob.initialize({
            testingDevices: [],
            initializeForTesting: false,
          });
          
          // Prepare rewarded ad
          await prepareRewardedAd();
          
          setIsAdReady(true);
          setIsAdLoading(false);
        } catch (error) {
          console.error('Error initializing AdMob:', error);
          setIsAdLoading(false);
        }
      } else {
        console.log('AdMob not available (probably in development)');
        // In development, we'll simulate ads
        setIsAdReady(true);
      }
    };
    
    initializeAdMob();
  }, []);
  
  // Prepare rewarded ad
  const prepareRewardedAd = async () => {
    if (!window.AdMob) return;
    
    try {
      setIsAdLoading(true);
      await window.AdMob.prepareRewardedAd({
        adId: 'ca-app-pub-6125071944733880/4779619151',
      });
      setIsAdReady(true);
      setIsAdLoading(false);
    } catch (error) {
      console.error('Error preparing rewarded ad:', error);
      setIsAdLoading(false);
      setIsAdReady(false);
    }
  };
  
  // Get user's AdCoins
  const {
    data: adCoins,
    isLoading: isAdCoinsLoading,
    error: adCoinsError,
    refetch: refetchAdCoins
  } = useQuery({
    queryKey: ['adCoins', user?.id],
    queryFn: () => user?.id ? getUserAdCoins(user.id) : null,
    enabled: !!user?.id,
  });
  
  // Mutation to add AdCoins
  const addAdCoinsMutation = useMutation({
    mutationFn: async ({ amount, reason }: { amount: number, reason: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      return addAdCoins(user.id, amount, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adCoins'] });
    }
  });
  
  // Mutation to spend AdCoins
  const spendAdCoinsMutation = useMutation({
    mutationFn: async ({ amount, feature }: { amount: number, feature: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      return spendAdCoins(user.id, amount, feature);
    },
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ['adCoins'] });
      }
    }
  });
  
  // Show rewarded ad
  const showRewardedAd = useCallback(async () => {
    if (!user?.id) {
      toast.error('You need to be logged in to earn AdCoins');
      return false;
    }
    
    try {
      setIsAdLoading(true);
      
      if (window.AdMob) {
        // Show actual ad in production
        const result = await window.AdMob.showRewardedAd();
        console.log('Ad result:', result);
        
        if (result.clicked) {
          // User watched and interacted with the ad
          await addAdCoinsMutation.mutateAsync({ amount: 1, reason: 'ad_watch' });
          await prepareRewardedAd(); // Prepare next ad
          return true;
        } else {
          toast.error('You need to watch the full ad to earn AdCoins');
          await prepareRewardedAd(); // Prepare next ad
          return false;
        }
      } else {
        // Simulate ad in development
        console.log('Simulating rewarded ad in development');
        setTimeout(async () => {
          await addAdCoinsMutation.mutateAsync({ amount: 1, reason: 'ad_watch' });
          setIsAdLoading(false);
          setIsAdReady(true);
        }, 1500);
        return true;
      }
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      toast.error('Failed to show ad. Please try again later.');
      setIsAdLoading(false);
      return false;
    }
  }, [user?.id, addAdCoinsMutation]);
  
  // Purchase a feature with AdCoins
  const purchaseFeature = useCallback(async (feature: AdCoinFeature) => {
    if (!user?.id) {
      toast.error('You need to be logged in to use AdCoins');
      return false;
    }
    
    if (!adCoins) {
      await refetchAdCoins();
      return false;
    }
    
    const cost = FEATURE_COSTS[feature];
    
    if (adCoins.balance < cost) {
      toast.error(`Insufficient AdCoins. You need ${cost} AdCoins.`);
      return false;
    }
    
    const result = await spendAdCoinsMutation.mutateAsync({ 
      amount: cost, 
      feature 
    });
    
    return result?.success || false;
  }, [user?.id, adCoins, spendAdCoinsMutation, refetchAdCoins]);
  
  return {
    adCoins,
    balance: adCoins?.balance || 0,
    isAdCoinsLoading,
    adCoinsError,
    refetchAdCoins,
    isAdReady,
    isAdLoading,
    showRewardedAd,
    purchaseFeature,
  };
};
