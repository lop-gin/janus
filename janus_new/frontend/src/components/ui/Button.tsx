"use client";

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled,
  ...rest
}) => {
  const baseStyles = "font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-md hover:shadow-lg";
  
  const variantStyles = {
    primary: "bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500 disabled:bg-orange-400",
    secondary: "bg-gray-600 hover:bg-gray-700 text-gray-100 focus:ring-gray-500 disabled:bg-gray-400",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 disabled:bg-red-400",
    ghost: "bg-transparent hover:bg-gray-700 text-orange-500 hover:text-orange-400 focus:ring-orange-500 disabled:text-gray-400"
  };

  const widthStyles = fullWidth ? "w-full" : "w-auto";

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${isLoading ? 'cursor-not-allowed opacity-75' : ''} ${className}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
