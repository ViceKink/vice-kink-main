
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MatchAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  matchedProfile?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

const MatchAnimation = ({ isOpen, onClose, matchedProfile }: MatchAnimationProps) => {
  const navigate = useNavigate();
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // After 500ms, set animation done to true to show the buttons
      const timer = setTimeout(() => {
        setAnimationDone(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (matchedProfile?.id) {
      onClose();
      navigate('/messages');
    }
  };

  const handleKeepSwiping = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none bg-gradient-to-b from-purple-600 to-fuchsia-500">
        <div className="relative flex flex-col items-center justify-center p-8 text-white text-center min-h-[400px]">
          {/* Fireworks animation */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
            <div className="animate-ping absolute h-20 w-20 rounded-full bg-white opacity-10 delay-75"></div>
            <div className="animate-ping absolute h-32 w-32 rounded-full bg-white opacity-10 delay-100"></div>
            <div className="animate-ping absolute h-48 w-48 rounded-full bg-white opacity-10 delay-200"></div>
          </div>
          
          <div className="relative z-10 animate-fade-in-scale">
            {/* Stars around the text */}
            <div className="absolute -top-6 -left-6 text-yellow-300 animate-pulse">✨</div>
            <div className="absolute -top-4 -right-8 text-yellow-300 animate-pulse delay-75">✨</div>
            <div className="absolute -bottom-6 -right-6 text-yellow-300 animate-pulse delay-150">✨</div>
            <div className="absolute -bottom-4 -left-8 text-yellow-300 animate-pulse delay-200">✨</div>
            
            <h2 className="text-4xl font-bold mb-2 tracking-tight">It's a Match!</h2>
            
            <div className="flex items-center justify-center gap-3 mt-4 mb-8">
              <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                {matchedProfile?.avatar ? (
                  <img 
                    src={matchedProfile.avatar} 
                    alt={matchedProfile.name}
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <User className="h-10 w-10 text-white/70" />
                )}
              </div>
              
              <div className="text-xl">+</div>
              
              <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden">
                <User className="h-10 w-10 text-white/70" />
              </div>
            </div>
            
            <p className="text-lg opacity-90 mb-2">
              You and {matchedProfile?.name || 'someone special'} liked each other!
            </p>
            
            {animationDone && (
              <div className="flex flex-col gap-3 mt-8 animate-fade-in">
                <Button 
                  onClick={handleSendMessage} 
                  className="bg-white text-purple-700 hover:bg-white/90 w-full"
                >
                  Send a Message
                </Button>
                <Button 
                  onClick={handleKeepSwiping} 
                  variant="outline" 
                  className="bg-transparent border-white text-white hover:bg-white/10 w-full"
                >
                  Keep Swiping
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MatchAnimation;
