import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export default function Input({ 
  className = '', 
  error = false, 
  ...props 
}: InputProps) {
  return (
    <input
      className={`w-full px-3 py-2 border ${error ? 'border-red-300' : 'border-gray-300'} 
                 rounded-md shadow-sm focus:outline-none 
                 ${error ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'} 
                 ${className}`}
      {...props}
    />
  );
}
