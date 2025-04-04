import React from 'react';
import { Button } from '@/components/ui/button';
import { QueryObserverResult } from '@tanstack/react-query';
import { DiscoverProfile } from '@/utils/match/types';

interface EmptyProfilesStateProps {
  refetch: () => Promise<QueryObserverResult<DiscoverProfile[], Error>>;
}

const EmptyProfilesState: React.FC<EmptyProfilesStateProps> = ({ refetch }) => {
  return (
    <div className="p-8 text-center bg-card rounded-xl shadow">
      <div className="text-6xl mb-4">✨</div>
      <h3 className="text-xl font-semibold mb-2">You've seen all profiles</h3>
      <p className="text-sm text-foreground/70 mb-6">
        Come back later for more matches
      </p>
    </div>
  );
};

export default EmptyProfilesState;
