
export const Skeleton = ({ className = '', variant = 'rectangular' }: {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}) => {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };
  
  return (
    <div 
      className={`animate-pulse bg-white/5 ${variantClasses[variant]} ${className}`}
      aria-hidden="true"
    />
  );
};
