"use client";

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, id, name, type = "text", value, onChange, error, ...rest }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id || name} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <input
        id={id || name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 bg-gray-700 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-lg text-gray-100 placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 transition duration-200 ease-in-out shadow-sm focus:outline-none focus:ring-2`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default Input;

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, id, name, value, onChange, error, options, ...rest }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id || name} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <select
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-2.5 bg-gray-700 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-lg text-gray-100 focus:ring-orange-500 focus:border-orange-500 transition duration-200 ease-in-out shadow-sm focus:outline-none focus:ring-2`}
        {...rest}
      >
        <option value="" disabled>Select {label.toLowerCase()}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, id, name, value, onChange, error, ...rest }) => {
  return (
    <div className="mb-4">
      <label htmlFor={id || name} className="block text-sm font-medium text-gray-300 mb-1">
        {label}
      </label>
      <textarea
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        rows={3}
        className={`w-full px-4 py-2.5 bg-gray-700 border ${error ? 'border-red-500' : 'border-gray-600'} rounded-lg text-gray-100 placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 transition duration-200 ease-in-out shadow-sm focus:outline-none focus:ring-2`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};
