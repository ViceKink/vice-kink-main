
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Play, Award } from 'lucide-react';
import { useAdCoins } from '@/hooks/useAdCoins';
import { toast } from 'sonner';

const EarnAdCoinsCard: React.FC = () => {
  const { 
    adCoins, 
    isAdCoinsLoading, 
    isAdReady, 
    isAdLoading, 
    showRewardedAd 
  } = useAdCoins();
  
  const handleWatchAd = async () => {
    if (!isAdReady) {
      toast.error('Ads are not ready yet. Please try again later.');
      return;
    }
    
    await showRewardedAd();
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          Earn AdCoins
        </CardTitle>
        <CardDescription>
          Watch ads to earn AdCoins for premium features
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-secondary rounded-md">
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Watch 1 Ad</p>
              <p className="text-xs text-muted-foreground">Earn 1 AdCoin</p>
            </div>
          </div>
          <Button 
            onClick={handleWatchAd} 
            disabled={isAdLoading || !isAdReady || isAdCoinsLoading}
            variant="default"
            size="sm"
          >
            {isAdLoading ? 'Loading...' : 'Watch'}
          </Button>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-secondary rounded-md">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Watch 4 Consecutive Ads</p>
              <p className="text-xs text-muted-foreground">Earn 5 AdCoins (+1 bonus)</p>
            </div>
          </div>
          <div className="text-sm">
            {!isAdCoinsLoading && adCoins ? (
              <span>{adCoins.consecutive_ads_watched}/4</span>
            ) : (
              <span>-/4</span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-secondary rounded-md">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Watch 8 Consecutive Ads</p>
              <p className="text-xs text-muted-foreground">Earn 10 AdCoins (+2 bonus)</p>
            </div>
          </div>
          <div className="text-sm">
            {!isAdCoinsLoading && adCoins ? (
              <span>{adCoins.consecutive_ads_watched}/8</span>
            ) : (
              <span>-/8</span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground">
        Consecutive ads must be watched within 5 minutes of each other.
      </CardFooter>
    </Card>
  );
};

export default EarnAdCoinsCard;
