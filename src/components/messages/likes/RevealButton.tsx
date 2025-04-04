
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Coins, PlayCircle } from 'lucide-react';

export interface RevealButtonProps {
  onReveal: () => void;
  onWatchAd: () => void;
  isProcessing: boolean;
  canUseCoins: boolean;
  isAdReady: boolean;
}

const RevealButton: React.FC<RevealButtonProps> = ({
  onReveal,
  onWatchAd,
  isProcessing,
  canUseCoins,
  isAdReady
}) => {
  return (
    <div className="p-4 space-y-2 bg-muted/20">
      <Button
        className="w-full"
        onClick={onReveal}
        disabled={!canUseCoins || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Revealing...
          </>
        ) : (
          <>
            <Coins className="w-4 h-4 mr-2" />
            Reveal with 1 Coin
          </>
        )}
      </Button>
      
      {isAdReady && (
        <Button
          variant="outline"
          className="w-full"
          onClick={onWatchAd}
          disabled={isProcessing}
        >
          <PlayCircle className="w-4 h-4 mr-2" />
          Watch Ad to Reveal
        </Button>
      )}
    </div>
  );
};

export default RevealButton;
