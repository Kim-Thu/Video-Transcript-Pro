'use client';

import type { CardProps } from '@/types';

/**
 * Reusable Card Component
 */
export const Card = ({
  children,
  hover = true,
  glow,
  padding = 'md',
  className = '',
}: CardProps) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };
  
  const glowClasses = glow ? (glow === 'primary' ? 'glow-primary' : 'glow-accent') : '';
  const hoverClass = hover ? 'hover:border-primary/35 hover:shadow-lg' : '';
  
  return (
    <div className={`card ${paddingClasses[padding]} ${hoverClass} ${glowClasses} ${className}`}>
      {children}
    </div>
  );
};
