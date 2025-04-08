
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/context/theme';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'icon-only';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  variant = 'default' 
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {variant === 'default' && (
        <Sun className={`h-4 w-4 ${isDark ? 'text-muted-foreground' : 'text-foreground'}`} />
      )}
      
      <Switch
        checked={isDark}
        onCheckedChange={toggleTheme}
        className="data-[state=checked]:bg-sidebar-primary"
        aria-label="Toggle dark mode"
      />
      
      {variant === 'default' && (
        <Moon className={`h-4 w-4 ${isDark ? 'text-foreground' : 'text-muted-foreground'}`} />
      )}
    </div>
  );
};

export default ThemeToggle;
