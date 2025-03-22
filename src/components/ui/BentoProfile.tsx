
import ProfileSection from '@/components/profile/ProfileSection';
import ProfileTag from '@/components/ui/ProfileTag';
import AudioPlayer from '@/components/ui/AudioPlayer';
import { Check, MapPin, Verified, Heart } from 'lucide-react';
import { UserProfile } from '@/context/AuthContext';

interface BentoProfileProps {
  profile: UserProfile;
  isCurrentUser?: boolean;
}

const BentoProfile = ({ profile, isCurrentUser = false }: BentoProfileProps) => {
  return (
    <div className="bento-grid">
      {/* Main Photo */}
      <ProfileSection 
        gridSpan={{
          cols: "col-span-7",
          rows: "row-span-4",
          colsStart: "col-start-1",
          rowsStart: "row-start-1"
        }}
        className="relative bg-black"
      >
        {profile.photos && profile.photos.length > 0 ? (
          <img
            src={profile.photos[0]}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
            <p className="text-gray-500">No photo available</p>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
          <div className="flex items-baseline">
            <h2 className="text-2xl font-bold">{profile.name}</h2>
            {profile.verified && (
              <Verified className="w-5 h-5 ml-1 text-vice-purple" />
            )}
          </div>
          <div className="flex items-center text-sm mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            <span>{profile.location || 'No location'}</span>
          </div>
        </div>
      </ProfileSection>

      {/* User Info */}
      <ProfileSection
        gridSpan={{
          cols: "col-span-5",
          rows: "row-span-2",
          colsStart: "col-start-8",
          rowsStart: "row-start-1"
        }}
        className="bg-white dark:bg-card p-4"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{profile.name} <span className="text-vice-purple">{profile.age}</span></h3>
            {!isCurrentUser && (
              <button className="rounded-full p-2 bg-vice-purple/10 hover:bg-vice-purple/20 text-vice-purple transition-all">
                <Heart className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="mt-2 flex items-center">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
              profile.about?.status === 'single' ? 'bg-vice-purple/10 text-vice-purple' : 
              profile.about?.status === 'married' ? 'bg-vice-red/10 text-vice-red' : 
              'bg-vice-orange/10 text-vice-orange'
            }`}>
              {profile.about?.status || 'Not specified'}
            </span>
          </div>
          
          <div className="mt-3 flex items-center">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
              {profile.about?.occupation || 'Not specified'}
            </span>
          </div>
          
          <div className="mt-auto">
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="flex items-center text-xs text-foreground/70">
                <span className="font-semibold">{profile.about?.height || 'Height not specified'}</span>
              </div>
              
              {profile.about?.zodiac && (
                <div className="flex items-center text-xs text-foreground/70">
                  <span>{profile.about.zodiac}</span>
                </div>
              )}
              
              {profile.about?.religion && (
                <div className="flex items-center text-xs text-foreground/70">
                  <span>{profile.about.religion}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </ProfileSection>

      {/* Bio */}
      <ProfileSection
        gridSpan={{
          cols: "col-span-5",
          rows: "row-span-2",
          colsStart: "col-start-8",
          rowsStart: "row-start-3"
        }}
        className="bg-vice-red p-4 text-white"
      >
        <h3 className="text-lg font-semibold mb-2">My story</h3>
        <p className="text-sm">{profile.bio || 'No bio available'}</p>
      </ProfileSection>

      {/* Audio */}
      {profile.audio && (
        <ProfileSection
          gridSpan={{
            cols: "col-span-4",
            rows: "row-span-1",
            colsStart: "col-start-1",
            rowsStart: "row-start-5"
          }}
          className="bg-vice-purple/10 p-0 overflow-hidden"
        >
          <AudioPlayer 
            audioUrl={profile.audio.url}
            title={profile.audio.title}
          />
        </ProfileSection>
      )}

      {/* Vices */}
      <ProfileSection
        gridSpan={{
          cols: "col-span-3",
          rows: "row-span-2",
          colsStart: "col-start-1",
          rowsStart: "row-start-6"
        }}
        className="bg-white dark:bg-card p-4"
      >
        <h3 className="text-base font-semibold mb-2">Vices</h3>
        <div className="flex flex-wrap gap-2">
          {profile.vices && profile.vices.length > 0 ? (
            profile.vices.map((vice, index) => (
              <ProfileTag key={index} label={vice} type="vice" />
            ))
          ) : (
            <p className="text-sm text-foreground/50">No vices listed</p>
          )}
        </div>
      </ProfileSection>

      {/* Kinks */}
      <ProfileSection
        gridSpan={{
          cols: "col-span-3",
          rows: "row-span-2",
          colsStart: "col-start-4",
          rowsStart: "row-start-6"
        }}
        className="bg-white dark:bg-card p-4"
      >
        <h3 className="text-base font-semibold mb-2">Kinks</h3>
        <div className="flex flex-wrap gap-2">
          {profile.kinks && profile.kinks.length > 0 ? (
            profile.kinks.map((kink, index) => (
              <ProfileTag key={index} label={kink} type="kink" />
            ))
          ) : (
            <p className="text-sm text-foreground/50">No kinks listed</p>
          )}
        </div>
      </ProfileSection>

      {/* Secondary Photos */}
      <ProfileSection
        gridSpan={{
          cols: "col-span-6",
          rows: "row-span-3",
          colsStart: "col-start-7",
          rowsStart: "row-start-5"
        }}
        className="bg-black p-0 overflow-hidden"
      >
        <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
          {profile.photos && profile.photos.slice(1, 5).map((photo, index) => (
            <div key={index} className="relative overflow-hidden">
              <img
                src={photo}
                alt={`${profile.name} photo ${index + 2}`}
                className="w-full h-full object-cover"
              />
              {index === 2 && profile.photos.length > 5 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
                  <span className="text-lg font-semibold">+{profile.photos.length - 4} photos</span>
                </div>
              )}
            </div>
          ))}
          {(!profile.photos || profile.photos.length <= 1) && (
            <div className="col-span-2 row-span-2 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
              <p className="text-gray-500">No additional photos</p>
            </div>
          )}
        </div>
      </ProfileSection>

      {/* Flirting Style */}
      {profile.flirtingStyle && (
        <ProfileSection
          gridSpan={{
            cols: "col-span-6",
            rows: "row-span-1",
            colsStart: "col-start-1",
            rowsStart: "row-start-8"
          }}
          className="bg-white dark:bg-card p-4"
        >
          <div className="flex items-center h-full">
            <p className="text-sm italic">
              <span className="font-medium mr-2">My idea of flirting is:</span>
              {profile.flirtingStyle}
            </p>
          </div>
        </ProfileSection>
      )}

      {/* Passion */}
      {profile.passions && profile.passions.length > 0 && (
        <ProfileSection
          gridSpan={{
            cols: "col-span-3",
            rows: "row-span-1",
            colsStart: "col-start-7",
            rowsStart: "row-start-8"
          }}
          className="bg-vice-dark-purple p-4 text-white"
        >
          <div className="flex flex-col h-full justify-center">
            <p className="text-sm">
              I am passionate about: <span className="font-medium">{profile.passions[0]}</span>
            </p>
          </div>
        </ProfileSection>
      )}

      {/* Quote */}
      <ProfileSection
        gridSpan={{
          cols: "col-span-3",
          rows: "row-span-1",
          colsStart: "col-start-10",
          rowsStart: "row-start-8"
        }}
        className="bg-vice-orange p-4 text-white"
      >
        <div className="flex flex-col h-full justify-center">
          <p className="text-sm italic">
            "I'm such a Virgo, even my horoscope tells me to stop worrying about being a Virgo"
          </p>
        </div>
      </ProfileSection>
    </div>
  );
};

export default BentoProfile;
