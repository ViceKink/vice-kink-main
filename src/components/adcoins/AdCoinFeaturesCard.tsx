
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Rewind, Rocket, Zap, Eye, Star, Music, Coins } from 'lucide-react';
import { AdCoinFeature, FEATURE_COSTS } from '@/models/adCoinsTypes';

interface FeatureItemProps {
  title: string;
  description: string;
  cost: number;
  icon: React.ReactNode;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ 
  title, 
  description, 
  cost, 
  icon
}) => {
  return (
    <div className="flex justify-between items-center p-3 bg-secondary rounded-md">
      <div className="flex items-center gap-2">
        <div className="bg-background p-2 rounded-full">
          {icon}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-sm font-medium">
        <Coins className="h-4 w-4 text-yellow-500" />
        <span>{cost}</span>
      </div>
    </div>
  );
};

interface AdCoinFeaturesCardProps {
  onFeaturePurchased?: (feature: AdCoinFeature, success: boolean) => void;
}

const AdCoinFeaturesCard: React.FC<AdCoinFeaturesCardProps> = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Premium Features</CardTitle>
        <CardDescription>
          Spend your AdCoins to unlock premium features
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <FeatureItem
          title="See Likes"
          description="See who liked your profile"
          cost={FEATURE_COSTS.SEE_LIKES}
          icon={<Eye className="h-4 w-4 text-blue-500" />}
        />
        
        <FeatureItem
          title="Swipe Right"
          description="Swipe right on more profiles"
          cost={FEATURE_COSTS.SWIPE_RIGHT}
          icon={<Heart className="h-4 w-4 text-red-500" />}
        />
        
        <FeatureItem
          title="Reveal Profile"
          description="Reveal a profile of someone who liked you"
          cost={FEATURE_COSTS.REVEAL_PROFILE}
          icon={<Eye className="h-4 w-4 text-green-500" />}
        />
        
        <FeatureItem
          title="Reveal Image"
          description="Reveal an image in a message"
          cost={FEATURE_COSTS.REVEAL_IMAGE}
          icon={<Eye className="h-4 w-4 text-purple-500" />}
        />
        
        <FeatureItem
          title="Boost Profile"
          description="Boost your profile visibility"
          cost={FEATURE_COSTS.BOOST_PROFILE}
          icon={<Rocket className="h-4 w-4 text-yellow-500" />}
        />
      </CardContent>
    </Card>
  );
};

export default AdCoinFeaturesCard;
