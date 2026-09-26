import React from 'react';
import { motion } from 'framer-motion';
import { audio } from '../../services/audioService';

interface BrutalistButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'green' | 'dark' | 'white' | 'red' | 'yellow' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const BrutalistButton: React.FC<BrutalistButtonProps> = ({
  children,
  onClick,
  variant = 'green',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  icon,
  fullWidth = false,
}) => {
  const handleClick = () => {
    if (disabled) return;
    audio.playClick();
    if (onClick) onClick();
  };

  const variantClass = {
    green: 'neo-btn-green',
    dark: 'neo-btn-dark',
    white: 'neo-btn-white',
    red: 'neo-btn-red',
    yellow: 'bg-[#FFE600] text-black hover:bg-[#ffea33]',
    cyan: 'bg-[#00E5FF] text-black hover:bg-[#33ebff]',
  }[variant];

  const sizeClass = {
    sm: 'text-xs py-1 px-2.5 h-8',
    md: 'text-xs py-1.5 px-3.5 h-9 font-bold',
    lg: 'text-sm py-2 px-5 h-11 font-extrabold',
  }[size];

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      whileHover={disabled ? {} : { x: -2, y: -2 }}
      whileTap={disabled ? {} : { x: 2, y: 2 }}
      className={`neo-btn ${variantClass} ${sizeClass} ${fullWidth ? 'w-full flex items-center justify-center' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};
