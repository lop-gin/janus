import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  options: Array<{
    value: string;
    label: string;
  }>;
  placeholder?: string;
}

export default function Select({ 
  className = '', 
  error = false, 
  options,
  placeholder,
  ...props 
}: SelectProps) {
  return (
    <select
      className={`w-full px-3 py-2 border ${error ? 'border-red-300' : 'border-gray-300'} 
                 rounded-md shadow-sm focus:outline-none 
                 ${error ? 'focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500 focus:border-blue-500'} 
                 ${className}`}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
