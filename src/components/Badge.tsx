'use client';

import React from 'react';

type BadgeProps = {
  children: React.ReactNode;
  variant?: 'default' | 'new' | 'beta' | 'warning';
  className?: string;
};

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const base = 'nav-badge';
  const variantClass = variant === 'new' ? 'new' : variant === 'beta' ? 'beta' : '';
  return (
    <span className={`${base} ${variantClass} ${className}`} role="status" aria-label={`${children}`}>{children}</span>
  );
}
