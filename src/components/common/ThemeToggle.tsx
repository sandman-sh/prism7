import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { audio } from '../../services/audioService';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    audio.playClick();
    toggleTheme();
  };

  const isLight = theme === 'light';

  return (
    <button
      onClick={handleToggle}
      type="button"
      title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
      className={`h-8 ${showLabel ? 'px-2.5' : 'w-8'} border-2 border-black font-mono text-xs font-extrabold shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
        isLight
          ? 'bg-[#000000] text-[#FFFFFF] hover:bg-[#222222]'
          : 'bg-[#FFE600] text-[#000000] hover:bg-[#FFF033]'
      } ${className}`}
    >
      {isLight ? (
        <Moon className="w-4 h-4 fill-current text-white shrink-0" />
      ) : (
        <Sun className="w-4 h-4 fill-current text-black shrink-0" />
      )}
      {showLabel && (
        <span className="hidden sm:inline tracking-wider">
          {isLight ? 'DARK' : 'LIGHT'}
        </span>
      )}
    </button>
  );
};
