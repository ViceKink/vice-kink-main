
import React from 'react';
import ProfileTag from '@/components/ui/ProfileTag';

interface ProfileVicesKinksProps {
  vices?: string[];
  kinks?: string[];
  hasSecondPhoto: boolean;
}

const ProfileVicesKinks = ({ vices, kinks, hasSecondPhoto }: ProfileVicesKinksProps) => {
  const hasVices = vices && vices.length > 0;
  const hasKinks = kinks && kinks.length > 0;
  
  return (
    <div className={`tags-container ${!hasSecondPhoto ? 'w-full' : ''}`}>
      {hasVices && (
        <div className="vices-card bento-card p-4 mb-4 bg-white dark:bg-card rounded-xl">
          <h3 className="text-base font-semibold mb-2 text-black dark:text-white">Vices</h3>
          <div className="flex flex-wrap gap-2 pb-6">
            {vices?.slice(0, 5).map((vice, index) => (
              <ProfileTag key={index} label={vice} type="vice" />
            ))}
          </div>
        </div>
      )}

      {hasKinks && (
        <div className="kinks-card bento-card p-4 mb-4 bg-white dark:bg-card rounded-xl">
          <h3 className="text-base font-semibold mb-2 text-black dark:text-white">Kinks</h3>
          <div className="flex flex-wrap gap-2 pb-6">
            {kinks?.slice(0, 5).map((kink, index) => (
              <ProfileTag key={index} label={kink} type="kink" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileVicesKinks;
