
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/lovable-uploads/35bd231b-922e-4a54-b157-32a57ed7f169.png" 
        alt="Vice Kink Logo" 
        className="h-12 w-auto"
      />
    </div>
  );
};

export default Logo;
