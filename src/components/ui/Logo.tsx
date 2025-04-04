
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/lovable-uploads/6ab3f12a-449d-42ca-95c5-9f310e2d3e3e.png" 
        alt="Vice Kink Logo" 
        className="h-9 w-auto"
      />
    </div>
  );
};

export default Logo;
