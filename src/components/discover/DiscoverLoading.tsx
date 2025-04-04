
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DiscoverLoading = () => {
  return (
    <div className="space-y-6 px-2">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow">
        <Skeleton className="w-full h-[320px]" />
        <div className="p-3">
          <div className="flex justify-between">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </div>
      </div>
      
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow">
        <Skeleton className="w-full h-[320px]" />
        <div className="p-3">
          <div className="flex justify-between">
            <Skeleton className="h-12 w-12 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverLoading;
