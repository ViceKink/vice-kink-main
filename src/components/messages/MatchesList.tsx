
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { User2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MatchesList = ({ matches, isLoading, onSelectMatch }) => {
  const navigate = useNavigate();

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

  if (matches.length === 0) {
    return (
      <Card className="h-full flex flex-col items-center justify-center text-center p-6">
        <User2 className="w-12 h-12 mb-2 text-gray-400" />
        <h3 className="text-lg font-medium">No matches yet</h3>
        <p className="text-sm text-muted-foreground mt-1">Start liking profiles to get matches</p>
        <Button className="mt-4" onClick={() => navigate('/discover')}>Discover</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-2 overflow-y-auto max-h-[70vh]">
      {matches.map((match) => (
        <Card 
          key={match.match_id}
          className="cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => onSelectMatch(match.match_id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start">
              <Avatar className="h-12 w-12 mr-3 flex-shrink-0">
                <AvatarImage src={match.other_user.avatar} />
                <AvatarFallback>{match.other_user.name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-medium truncate">{match.other_user.name || 'User'}</h3>
                  <span className="text-xs text-muted-foreground">{format(new Date(match.matched_at), 'P')}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{match.last_message || "No messages yet"}</p>
                {match.unread_count > 0 && <Badge variant="default" className="mt-1">{match.unread_count}</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MatchesList;
