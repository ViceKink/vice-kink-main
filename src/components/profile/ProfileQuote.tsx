
import React from 'react';
import { Quote } from 'lucide-react';

interface ProfileQuoteProps {
  quote: string;
}

const ProfileQuote = ({ quote }: ProfileQuoteProps) => {
  if (!quote) return null;
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-start space-x-2">
        <Quote className="text-white h-5 w-5 flex-shrink-0" />
        <div className="flex-1 overflow-hidden">
          <div className="text-sm font-medium mb-1">Favorite Quote</div>
          <p className="text-white/90 italic text-sm break-words overflow-auto">{quote}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileQuote;
