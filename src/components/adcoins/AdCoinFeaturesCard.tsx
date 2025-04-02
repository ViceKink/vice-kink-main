
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Rewind, Rocket, Zap, Eye, Star, Music } from 'lucide-react';
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
      <div className="bg-slate-900 text-white px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1">
        {cost} <span className="text-xs">Coins</span>
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
          title="View Who Liked You"
          description="See one person who liked your profile"
          cost={FEATURE_COSTS.view_like}
          icon={<Eye className="h-4 w-4 text-blue-500" />}
        />
        
        <FeatureItem
          title="Extra Likes"
          description="Get 5 extra likes when you run out"
          cost={FEATURE_COSTS.extra_likes}
          icon={<Heart className="h-4 w-4 text-red-500" />}
        />
        
        <FeatureItem
          title="Rewind Action"
          description="Undo your last swipe or action"
          cost={FEATURE_COSTS.rewind}
          icon={<Rewind className="h-4 w-4 text-green-500" />}
        />
        
        <FeatureItem
          title="Profile Boost"
          description="1-hour boost for your profile"
          cost={FEATURE_COSTS.profile_boost}
          icon={<Rocket className="h-4 w-4 text-purple-500" />}
        />
        
        <FeatureItem
          title="Post Boost"
          description="1-hour boost for your post"
          cost={FEATURE_COSTS.post_boost}
          icon={<Zap className="h-4 w-4 text-yellow-500" />}
        />
        
        <FeatureItem
          title="Super Like"
          description="Send a super like to stand out"
          cost={FEATURE_COSTS.super_like}
          icon={<Star className="h-4 w-4 text-blue-500" />}
        />
        
        <FeatureItem
          title="Match with Artist"
          description="Match with an erotica artist"
          cost={FEATURE_COSTS.match_with_artist}
          icon={<Music className="h-4 w-4 text-pink-500" />}
        />
      </CardContent>
    </Card>
  );
};

export default AdCoinFeaturesCard;
