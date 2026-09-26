import React from 'react';

interface BrutalistBadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'yellow' | 'red' | 'cyan' | 'dark';
  className?: string;
  icon?: React.ReactNode;
}

export const BrutalistBadge: React.FC<BrutalistBadgeProps> = ({
  children,
  variant = 'green',
  className = '',
  icon,
}) => {
  const variantClass = {
    green: 'neo-pill-green',
    yellow: 'neo-pill-yellow',
    red: 'neo-pill-red',
    cyan: 'neo-pill-cyan',
    dark: 'neo-pill-dark',
  }[variant];

  return (
    <span className={`neo-pill ${variantClass} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
