
import { cn } from "@/lib/utils";

interface ProfileTagProps {
  label: string;
  type?: 'default' | 'kink' | 'vice' | 'primary' | 'lifestyle';
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

const ProfileTag = ({
  label,
  type = 'default',
  size = 'md',
  isActive = false,
  onClick,
  className,
}: ProfileTagProps) => {
  const baseClasses = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-200";
  
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };
  
  const typeClasses = {
    default: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    kink: "bg-vice-purple/10 text-vice-purple hover:bg-vice-purple/20",
    vice: "bg-vice-red/10 text-vice-red hover:bg-vice-red/20",
    primary: "bg-primary/10 text-primary hover:bg-primary/20",
    lifestyle: "bg-vice-orange/10 text-vice-orange hover:bg-vice-orange/20",
  };
  
  const activeClasses = {
    default: "bg-secondary/90 ring-1 ring-border",
    kink: "bg-vice-purple/20 ring-1 ring-vice-purple/30",
    vice: "bg-vice-red/20 ring-1 ring-vice-red/30",
    primary: "bg-primary/20 ring-1 ring-primary/30",
    lifestyle: "bg-vice-orange/20 ring-1 ring-vice-orange/30",
  };
  
  return (
    <span
      className={cn(
        baseClasses,
        sizeClasses[size],
        isActive ? activeClasses[type] : typeClasses[type],
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {label}
    </span>
  );
};

export default ProfileTag;
