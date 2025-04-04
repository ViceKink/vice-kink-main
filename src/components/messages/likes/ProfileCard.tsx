
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { User2 } from 'lucide-react';

interface ProfileCardProps {
  profile: {
    id: string;
    name: string;
    age?: number;
    location?: string;
    avatar?: string;
    interactionType?: 'like' | 'superlike';
    isRevealed?: boolean;
  };
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  const isRevealed = profile.isRevealed || false;

  return (
    <Card className="hover:bg-accent/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start">
          <Avatar className="h-12 w-12 mr-3 flex-shrink-0">
            {isRevealed ? (
              <>
                <AvatarImage src={profile.avatar} />
                <AvatarFallback>{profile.name?.charAt(0) || '?'}</AvatarFallback>
              </>
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <User2 className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </Avatar>
          
          <div className="min-w-0 flex-1">
            <div className="flex justify-between items-baseline">
              <h3 className="text-sm font-medium truncate">
                {isRevealed ? profile.name : "Mystery Admirer"}
              </h3>
              <Badge variant={profile.interactionType === 'superlike' ? 'destructive' : 'outline'}>
                {profile.interactionType === 'superlike' ? 'Super Like' : 'Like'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {isRevealed ? (
                <>{profile.age && `${profile.age} • `}{profile.location}</>
              ) : (
                "Hidden Profile"
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
