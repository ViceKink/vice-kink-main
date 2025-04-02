
import React from 'react';
import { useAuth } from '@/context/auth';
import { Coins } from 'lucide-react';
import AdCoinsBalance from '@/components/adcoins/AdCoinsBalance';
import EarnAdCoinsCard from '@/components/adcoins/EarnAdCoinsCard';
import AdCoinFeaturesCard from '@/components/adcoins/AdCoinFeaturesCard';
import { useNavigate } from 'react-router-dom';
import { AdCoinFeature } from '@/models/adCoinsTypes';

const AdCoinsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleFeaturePurchased = (feature: AdCoinFeature, success: boolean) => {
    if (success) {
      // Handle different features
      switch (feature) {
        case 'view_like':
          navigate('/messages?tab=likes');
          break;
        case 'extra_likes':
          navigate('/discover');
          break;
        case 'profile_boost':
          navigate('/profile');
          break;
        case 'super_like':
          navigate('/discover');
          break;
        case 'match_with_artist':
          navigate('/');
          break;
        default:
          // Stay on page for other features
          break;
      }
    }
  };
  
  return (
    <div className="container py-10 mt-20">
      <div className="flex items-center gap-2 mb-6">
        <Coins className="h-6 w-6 text-yellow-500" />
        <h1 className="text-2xl font-bold">AdCoins</h1>
      </div>
      
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium">Your Balance</h2>
          <p className="text-muted-foreground text-sm">Use AdCoins to unlock premium features</p>
        </div>
        <AdCoinsBalance size="lg" showEarnButton={true} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EarnAdCoinsCard />
        <AdCoinFeaturesCard onFeaturePurchased={handleFeaturePurchased} />
      </div>
      
      <div className="mt-8 p-6 bg-secondary rounded-lg">
        <h3 className="text-lg font-medium mb-4">How AdCoins Work</h3>
        <ul className="space-y-2 list-disc list-inside text-sm text-muted-foreground">
          <li>Watch ads to earn AdCoins</li>
          <li>Watch 1 ad to earn 1 AdCoin</li>
          <li>Watch 4 consecutive ads to earn 5 AdCoins (including 1 bonus)</li>
          <li>Watch 8 consecutive ads to earn 10 AdCoins (including 2 bonus)</li>
          <li>Consecutive ads must be watched within 5 minutes of each other</li>
          <li>Use AdCoins to unlock premium features</li>
        </ul>
      </div>
    </div>
  );
};

export default AdCoinsPage;
