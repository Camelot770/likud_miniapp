import type { ReactNode, HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  clickable?: boolean;
}

export default function Card({
  children,
  padding = 'md',
  clickable = false,
  className = '',
  ...props
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
  };

  const clickableStyle = clickable
    ? 'cursor-pointer active:scale-[0.98] transition-transform'
    : '';

  return (
    <div
      className={`bg-tg-secondary-bg rounded-2xl ${paddingStyles[padding]} ${clickableStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
