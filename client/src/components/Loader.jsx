import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Loader = ({ size = 'medium', className }) => {
  const sizeClasses = {
    small: 'w-5 h-5 border-2',
    medium: 'w-8 h-8 border-3',
    large: 'w-12 h-12 border-4',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'border-primary-200 border-t-primary-600 rounded-full animate-spin',
          sizeClasses[size]
        )}
      />
    </div>
  );
};

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <Loader size="large" />
      <p className="mt-4 text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

export const CardLoader = () => (
  <div className="p-8 flex items-center justify-center">
    <Loader size="medium" />
  </div>
);

export const TableLoader = () => (
  <div className="py-12 flex items-center justify-center">
    <Loader size="medium" />
  </div>
);

export default Loader;
