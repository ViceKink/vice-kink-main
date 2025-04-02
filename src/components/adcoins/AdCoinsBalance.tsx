
import React from 'react';
import { Coins } from 'lucide-react';
import { useAdCoins } from '@/hooks/useAdCoins';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface AdCoinsBalanceProps {
  showEarnButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AdCoinsBalance: React.FC<AdCoinsBalanceProps> = ({ 
  showEarnButton = false,
  size = 'md',
  className = ''
}) => {
  const { 
    balance, 
    isAdCoinsLoading, 
    isAdReady, 
    isAdLoading, 
    showRewardedAd 
  } = useAdCoins();
  
  const handleEarnAdCoins = async () => {
    if (!isAdReady) {
      toast.error('Ads are not ready yet. Please try again later.');
      return;
    }
    
    await showRewardedAd();
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs gap-1';
      case 'lg':
        return 'text-lg gap-2';
      default:
        return 'text-sm gap-1.5';
    }
  };
  
  const getCoinSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className={`flex items-center ${getSizeClasses()}`}>
        <Coins className={`${getCoinSize()} text-yellow-500`} />
        {isAdCoinsLoading ? (
          <Skeleton className="h-4 w-10" />
        ) : (
          <span>{balance}</span>
        )}
      </div>
      
      {showEarnButton && (
        <Button
          variant="outline"
          size="sm"
          className="ml-2 text-xs h-7"
          onClick={handleEarnAdCoins}
          disabled={isAdLoading || !isAdReady}
        >
          {isAdLoading ? 'Loading...' : 'Earn'}
        </Button>
      )}
    </div>
  );
};

export default AdCoinsBalance;
