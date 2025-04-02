
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IconButton } from '@/components/ui/icon-button';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, User2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { createInteraction } from '@/utils/match';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

interface Profile {
  id: string;
  name: string;
  age?: number;
  location?: string;
  avatar?: string;
  interactionType?: 'like' | 'superlike';
}

interface LikesListProps {
  profiles: Profile[];
  isLoading: boolean;
  onSelectLike: (profileId: string) => void;
}

const LikesList: React.FC<LikesListProps> = ({ profiles, isLoading, onSelectLike }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  
  const interactionMutation = useMutation({
    mutationFn: async ({ 
      profileId, 
      interactionType 
    }: { 
      profileId: string, 
      interactionType: 'like' | 'dislike' | 'superlike' 
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      console.log('Creating interaction with profile', profileId, 'as', interactionType);
      const result = await createInteraction(user.id, profileId, interactionType);
      console.log('Interaction result:', result);
      return result;
    },
    onSuccess: (result, variables) => {
      if (variables.interactionType === 'dislike') {
        toast.success("Profile rejected");
      } else if (result.matched) {
        toast.success("It's a match! 🎉");
      } else {
        toast.success("Like sent!");
      }
      
      // Refresh queries to update UI
      queryClient.invalidateQueries({ queryKey: ['likedByProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['userMatches'] });
    },
    onError: (error) => {
      console.error('Error with profile interaction:', error);
      toast.error('Failed to process interaction');
    }
  });

  const handleLikeProfile = (profileId: string, interactionType: 'like' | 'superlike') => {
    interactionMutation.mutate({ profileId, interactionType });
  };
  
  const handleRejectProfile = (profileId: string) => {
    interactionMutation.mutate({ profileId, interactionType: 'dislike' });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-200" />
                <div className="ml-3 space-y-2 flex-1">
                  <div className="h-4 w-1/2 bg-gray-200 rounded" />
                  <div className="h-3 w-4/5 bg-gray-200 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <Card className="h-full flex flex-col items-center justify-center text-center p-6">
        <Heart className="w-12 h-12 mb-2 text-gray-400" />
        <h3 className="text-lg font-medium">No likes yet</h3>
        <p className="text-sm text-muted-foreground mt-1">
          When someone likes you, they'll appear here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto max-h-[70vh]">
      {profiles.map((profile) => (
        <Card key={profile.id} className="hover:bg-accent/50 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start">
              <Avatar className="h-12 w-12 mr-3 flex-shrink-0">
                <AvatarImage src={profile.avatar} />
                <AvatarFallback>{profile.name?.charAt(0) || '?'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-medium truncate">
                    {profile.name}
                  </h3>
                  <Badge variant={profile.interactionType === 'superlike' ? 'destructive' : 'outline'}>
                    {profile.interactionType === 'superlike' ? 'Super Like' : 'Like'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {profile.age && `${profile.age} • `}{profile.location}
                </p>
                <div className="flex gap-2">
                  <IconButton
                    size="sm"
                    variant="default"
                    className="h-8 w-8"
                    icon={<Heart className="h-4 w-4" />}
                    label="Like Back"
                    onClick={() => handleLikeProfile(profile.id, 'like')}
                  />
                  <IconButton
                    size="sm"
                    variant="outline"
                    className="h-8 w-8"
                    icon={<User2 className="h-4 w-4" />}
                    label="View Profile"
                    onClick={() => navigate(`/profile/${profile.id}`)}
                  />
                  <IconButton
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    icon={<X className="h-4 w-4" />}
                    label="Reject"
                    onClick={() => handleRejectProfile(profile.id)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LikesList;
