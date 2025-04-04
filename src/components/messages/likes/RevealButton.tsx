
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Eye, PlayCircle, Coins } from 'lucide-react';

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
    <div className="p-4 space-y-2">
      <Button
        className="w-full bg-slate-800 hover:bg-slate-900"
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
            <Eye className="w-4 h-4 mr-2" />
            Reveal for <Coins className="h-4 w-4 mx-1 text-yellow-400" /> 1
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
