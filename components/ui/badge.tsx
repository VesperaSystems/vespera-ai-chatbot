import React from 'react';
import clsx from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'outline';
}

const variantClasses = {
  default: 'bg-gray-100 text-gray-800',
  secondary: 'bg-gray-200 text-gray-700',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  outline: 'border border-gray-300 text-gray-800 bg-transparent',
};

export function Badge({
  className,
  variant = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-block rounded px-2 py-0.5 text-xs font-semibold',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export default Badge;
