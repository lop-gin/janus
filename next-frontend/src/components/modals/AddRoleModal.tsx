"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface AddRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRole: (roleData: { name: string; description: string; color: string }) => void;
  existingRoles: string[];
}

const AddRoleModal = ({ isOpen, onClose, onAddRole, existingRoles }: AddRoleModalProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const availableColors = [
    { name: 'blue', bg: 'bg-blue-500', text: 'text-blue-800', lightBg: 'bg-blue-100' },
    { name: 'green', bg: 'bg-green-500', text: 'text-green-800', lightBg: 'bg-green-100' },
    { name: 'red', bg: 'bg-red-500', text: 'text-red-800', lightBg: 'bg-red-100' },
    { name: 'purple', bg: 'bg-purple-500', text: 'text-purple-800', lightBg: 'bg-purple-100' },
    { name: 'teal', bg: 'bg-teal-500', text: 'text-teal-800', lightBg: 'bg-teal-100' },
    { name: 'orange', bg: 'bg-orange-500', text: 'text-orange-800', lightBg: 'bg-orange-100' },
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Role name is required';
    else if (existingRoles.includes(name.trim())) newErrors.name = 'Role name must be unique';
    if (description.length > 200) newErrors.description = 'Description cannot exceed 200 characters';
    if (!color) newErrors.color = 'Please select a color';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAddRole({ name: name.trim(), description, color });
      setName('');
      setDescription('');
      setColor('');
      setErrors({});
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-full max-w-lg relative border border-gray-200 isolation isolate"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold mb-4">Add New Role</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              ref={inputRef}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
              placeholder="Enter role description"
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Color <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 grid grid-cols-6 gap-2">
              {availableColors.map((colorOption) => (
                <div
                  key={colorOption.name}
                  className={`w-8 h-8 rounded-full ${colorOption.bg} cursor-pointer flex items-center justify-center ${color === colorOption.name ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  onClick={() => setColor(colorOption.name)}
                >
                  {color === colorOption.name && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
            {errors.color && <p className="mt-1 text-sm text-red-600">{errors.color}</p>}
          </div>
          <div className="flex justify-between space-x-2">
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRoleModal;