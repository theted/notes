import React from 'react';

type SpinnerProps = {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  center?: boolean;
  className?: string;
};

const Spinner: React.FC<SpinnerProps> = ({
  label = 'Loading…',
  size = 'sm',
  center = true,
  className = '',
}) => {
  const sizeClasses =
    size === 'lg' ? 'h-12 w-12' : size === 'md' ? 'h-8 w-8' : 'h-6 w-6';

  return (
    <div
      className={
        `${center ? 'fixed inset-0 grid place-items-center z-50 pointer-events-none' : ''} ${className}`.trim()
      }
      aria-live="polite"
      aria-busy="true"
      role="status"
    >
      <div className="flex items-center gap-3">
        <span
          className={`inline-block ${sizeClasses} rounded-full border-2 border-white/30 border-t-transparent animate-spin`}
        />
        {label ? <span className="sr-only">{label}</span> : null}
      </div>
    </div>
  );
};

export default Spinner;

