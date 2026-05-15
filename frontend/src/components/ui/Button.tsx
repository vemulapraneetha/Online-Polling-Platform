/**
 * Reusable Button component with variants and loading state.
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
  danger:
    'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md shadow-red-500/20',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-800',
  outline:
    'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-200 ease-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        active:scale-[0.98]
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Spinner size="sm" /> : leftIcon}
      {children}
    </button>
  );
}
