
import React from 'react';
import { Quote } from 'lucide-react';

interface ProfileQuoteProps {
  quote: string;
}

const ProfileQuote = ({ quote }: ProfileQuoteProps) => {
  if (!quote) return null;
  
  return (
    <div className="flex items-start space-x-2 py-3">
      <Quote className="text-vice-purple h-5 w-5 flex-shrink-0 mt-1" />
      <div>
        <div className="text-sm font-medium mb-1">Favorite Quote</div>
        <p className="text-foreground/80 italic text-sm">"{quote}"</p>
      </div>
    </div>
  );
};

export default ProfileQuote;
