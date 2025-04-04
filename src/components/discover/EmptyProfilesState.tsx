
import React from 'react';
import { Button } from '@/components/ui/button';
import { QueryObserverResult } from '@tanstack/react-query';
import { DiscoverProfile } from '@/utils/match/types';
import { RefreshCw } from 'lucide-react';

interface EmptyProfilesStateProps {
  refetch: () => Promise<QueryObserverResult<DiscoverProfile[], Error>>;
}

const EmptyProfilesState: React.FC<EmptyProfilesStateProps> = ({ refetch }) => {
  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="p-8 text-center bg-card rounded-xl shadow max-w-md mx-auto">
      <div className="text-6xl mb-4">✨</div>
      <h3 className="text-xl font-semibold mb-2">You've seen all profiles</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Come back later for more matches or refresh to try again
      </p>
      <Button onClick={handleRefresh} variant="outline" className="mx-auto">
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  );
};

export default EmptyProfilesState;
