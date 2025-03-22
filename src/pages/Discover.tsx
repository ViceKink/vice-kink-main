
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmailSwiper from '@/components/ui/EmailSwiper';
import { toast } from 'sonner';

// Mock profiles data
const mockProfiles = [
  {
    id: "profile-1",
    name: "Samuel John",
    age: 29,
    location: "Mumbai",
    distance: "4 kms away",
    photos: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop"
    ],
    occupation: "Interior Designer",
    religion: "Christian",
    height: "5'10\"",
    rating: 5,
    verified: true
  },
  {
    id: "profile-2",
    name: "Dhruv Solanki",
    age: 31,
    location: "Mumbai",
    distance: "1.8 kms away",
    photos: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop"
    ],
    occupation: "Entrepreneur",
    religion: "Hindu",
    height: "6'1\"",
    rating: 4,
    verified: true
  },
  {
    id: "profile-3",
    name: "Shubh Dubey",
    age: 27,
    location: "Mumbai",
    distance: "2 kms away",
    photos: [
      "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?q=80&w=1000&auto=format&fit=crop"
    ],
    occupation: "Data Analyst",
    religion: "Hindu",
    height: "5'9\"",
    rating: 4,
    verified: true
  },
  {
    id: "profile-4",
    name: "Kunal Pandey",
    age: 27,
    location: "Mumbai",
    distance: "2 kms away",
    photos: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=1000&auto=format&fit=crop"
    ],
    occupation: "Web Developer",
    religion: "Hindu",
    height: "5'8\"",
    rating: 5,
    verified: false
  },
  {
    id: "profile-5",
    name: "Rohit Bansal",
    age: 28,
    location: "Mumbai",
    distance: "2 kms away",
    photos: [
      "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop"
    ],
    occupation: "Photographer",
    religion: "Hindu",
    height: "5'9\"",
    rating: 4,
    verified: true
  }
];

const Discover = () => {
  const [profiles] = useState(mockProfiles);
  const navigate = useNavigate();
  
  const handleLike = (profileId: string) => {
    console.log('Liked profile:', profileId);
    toast.success('Profile liked!');
  };
  
  const handleDislike = (profileId: string) => {
    console.log('Disliked profile:', profileId);
  };
  
  const handleSuperLike = (profileId: string) => {
    console.log('Super liked profile:', profileId);
    toast.success('Super like sent!');
  };
  
  const handleViewProfile = (profileId: string) => {
    console.log('Viewing profile:', profileId);
    // Navigate to profile detail with a smooth transition
    navigate(`/profile/${profileId}`);
  };
  
  const handleOpenFilters = () => {
    console.log('Opening filters');
    toast.info('Filters coming soon!');
  };
  
  return (
    <div className="min-h-screen py-24 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Discover</h1>
        
        <EmailSwiper
          profiles={profiles}
          onLike={handleLike}
          onDislike={handleDislike}
          onSuperLike={handleSuperLike}
          onViewProfile={handleViewProfile}
          onOpenFilters={handleOpenFilters}
        />
        
        <div className="mt-8 text-center">
          <p className="text-sm text-foreground/60">
            You have 20 likes remaining today
          </p>
        </div>
      </div>
    </div>
  );
};

export default Discover;
