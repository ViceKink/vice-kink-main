
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from '@/components/ui/separator';
import { Search } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/auth';
import { getUserMatches, forceCheckForMatches } from '@/utils/match/matchingService';
import { getProfilesWhoLikedMe } from '@/utils/match/interactionService';
import MatchesList from '@/components/messages/MatchesList';
import LikesList from '@/components/messages/LikesList';
import ChatView from '@/components/messages/ChatView';
import { Profile } from '@/models/profileTypes';
import { toast } from 'sonner';

const Messages = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('matches');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Run a force check for matches when the component loads
  useEffect(() => {
    if (user?.id) {
      forceCheckForMatches(user.id).then((matchesCreated) => {
        if (matchesCreated > 0) {
          console.log(`Created ${matchesCreated} new matches that were previously missed`);
          // Refresh the matches data
          queryClient.invalidateQueries({ queryKey: ['userMatches'] });
          queryClient.invalidateQueries({ queryKey: ['likedByProfiles'] });
          toast.success(`Found ${matchesCreated} new matches!`);
        }
      });
    }
  }, [user?.id, queryClient]);

  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['userMatches'],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log('Fetching matches for user:', user.id);
      const result = await getUserMatches(user.id);
      console.log('Matches result:', result);
      return result;
    },
    enabled: !!user?.id
  });

  const { data: likedByProfiles = [], isLoading: likesLoading } = useQuery({
    queryKey: ['likedByProfiles'],
    queryFn: async () => {
      if (!user?.id) return [];
      console.log('Fetching profiles who liked user:', user.id);
      
      try {
        const result = await getProfilesWhoLikedMe(user.id);
        console.log('Likes result:', result?.length || 0, 'profiles found');
        return result || [];
      } catch (error) {
        console.error('Error in likes query:', error);
        toast.error('Failed to fetch likes: ' + (error instanceof Error ? error.message : String(error)));
        return [];
      }
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // Refetch every 5 seconds to check for new likes
    retry: 3, // Retry up to 3 times if there are errors
    retryDelay: 1000 // Wait 1 second between retries
  });

  // Add debug logging to verify data
  useEffect(() => {
    console.log('Likes data state:', likedByProfiles);
  }, [likedByProfiles]);

  // Filter matches and likes based on search query
  const filteredMatches = searchQuery 
    ? matches.filter((match) => match.other_user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : matches;

  const filteredLikes = searchQuery
    ? likedByProfiles.filter((profile) => profile.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : likedByProfiles;

  return (
    <div className="container py-10 mt-20">
      <Tabs defaultValue="matches" className="w-full">
        <div className="mb-6 mt-5">
          <TabsList className="w-full max-w-xs mx-0">
            <TabsTrigger value="matches" onClick={() => setActiveTab('matches')}>
              Matches
            </TabsTrigger>
            <TabsTrigger value="likes" onClick={() => setActiveTab('likes')}>
              Likes
            </TabsTrigger>
          </TabsList>
        </div>
        
        <Separator className="my-4" />
        
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="search"
            placeholder="Search"
            className="w-full pl-10 py-2 rounded-md bg-secondary border-none focus-visible:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <TabsContent value="matches" className="space-y-2">
              <MatchesList 
                matches={filteredMatches} 
                isLoading={matchesLoading}
                onSelectMatch={(matchId) => {
                  setSelectedMatchId(matchId);
                }}
              />
            </TabsContent>
            
            <TabsContent value="likes" className="space-y-2">
              <LikesList 
                profiles={filteredLikes} 
                isLoading={likesLoading}
                onSelectLike={(profileId) => {
                  // For likes, we don't have a match yet
                  setSelectedMatchId(null);
                }}
              />
            </TabsContent>
          </div>
          
          <div className="md:col-span-3">
            <ChatView matchId={selectedMatchId} />
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default Messages;
