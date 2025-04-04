import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import LikesList from '@/components/messages/likes';
import ChatView from '@/components/messages/ChatView';
import { MatchWithProfile } from '@/utils/match/types';
import { matchingService } from '@/utils/matchUtils';

const Messages = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'likes' | 'chat'>('chat');
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Fetch matches
  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['userMatches', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      try {
        const userMatches = await matchingService.getUserMatches(user.id);
        return userMatches as MatchWithProfile[];
      } catch (error) {
        console.error('Error fetching matches:', error);
        return [];
      }
    },
    enabled: !!user?.id
  });

  const handleTabChange = (tab: 'likes' | 'chat') => {
    setActiveTab(tab);
  };

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
  };

  return (
    <div className="min-h-screen pt-16 pb-20 px-2">
      <div className="w-full mx-auto">
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-2 bg-secondary/30 p-1 rounded-xl">
            <button 
              className={`px-4 py-3 rounded-lg flex justify-center items-center transition-all ${
                activeTab === 'chat' 
                  ? 'bg-white dark:bg-black text-foreground shadow-sm font-semibold' 
                  : 'bg-transparent text-foreground/60 hover:text-foreground/80'
              }`}
              onClick={() => handleTabChange('chat')}
            >
              <span className="font-medium">Chat</span>
            </button>
            <button 
              className={`px-4 py-3 rounded-lg flex justify-center items-center transition-all ${
                activeTab === 'likes' 
                  ? 'bg-white dark:bg-black text-foreground shadow-sm font-semibold' 
                  : 'bg-transparent text-foreground/60 hover:text-foreground/80'
              }`}
              onClick={() => handleTabChange('likes')}
            >
              <span className="font-medium">Likes</span>
            </button>
          </div>
        </div>

        {activeTab === 'chat' && !selectedMatchId && (
          <div>
            {matchesLoading ? (
              <div className="flex items-center justify-center h-screen">Loading matches...</div>
            ) : matches.length === 0 ? (
              <div className="flex items-center justify-center h-screen">No matches yet</div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <Button
                    key={match.match_id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleSelectMatch(match.match_id)}
                  >
                    {match.other_user.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Render match chat */}
        {activeTab === 'chat' && selectedMatchId && (
          <div className="h-full">
            {matchesLoading ? (
              <div className="flex items-center justify-center h-screen">Loading chat...</div>
            ) : (
              (() => {
                const selectedMatch = matches.find(match => match.match_id === selectedMatchId);

                if (!selectedMatch) {
                  return <div className="flex items-center justify-center h-screen">Match not found</div>;
                }

                return (
                  <ChatView 
                    matchId={selectedMatch.match_id}
                    userId={user?.id || ''}
                    partnerId={selectedMatch.other_user.id}
                    partnerName={selectedMatch.other_user.name}
                    partnerAvatar={selectedMatch.other_user.avatar}
                    onBack={() => setSelectedMatchId(null)}
                  />
                );
              })()
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <LikesList />
        )}
      </div>
    </div>
  );
};

export default Messages;
