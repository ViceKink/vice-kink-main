
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = '' }) => {
  return (
    <div className={`font-bold text-vice-purple ${className}`}>F</div>
  );
};

export default Logo;
