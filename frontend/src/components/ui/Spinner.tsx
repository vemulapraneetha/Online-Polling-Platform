/**
 * Loading spinner with size variants.
 */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          border-2 border-slate-200 border-t-blue-600
          rounded-full animate-spin
        `}
      />
    </div>
  );
}

/**
 * Full-page spinner for loading states.
 */
export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 animate-pulse-soft">Loading...</p>
      </div>
    </div>
  );
}
