
import React from 'react';
import { Button } from '@/components/ui/button';
import { Coins, Eye } from 'lucide-react';

interface RevealButtonProps {
  balance: number;
  onReveal: () => void;
  onWatchAd: () => void;
  isAdReady: boolean;
}

const RevealButton: React.FC<RevealButtonProps> = ({
  balance,
  onReveal,
  onWatchAd,
  isAdReady
}) => {
  if (balance > 0) {
    return (
      <Button 
        size="sm" 
        variant="default"
        className="w-full"
        onClick={onReveal}
      >
        <Eye className="mr-1 h-4 w-4" />
        Reveal for <Coins className="mx-1 h-4 w-4 text-yellow-500" />1
      </Button>
    );
  } else {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          You've run out of AdCoins... Watch an Ad instead?
        </p>
        <Button 
          size="sm" 
          variant="outline"
          className="w-full"
          onClick={onWatchAd}
          disabled={!isAdReady}
        >
          Watch Ad to Earn <Coins className="ml-1 h-4 w-4 text-yellow-500" />
        </Button>
      </div>
    );
  }
};

export default RevealButton;
