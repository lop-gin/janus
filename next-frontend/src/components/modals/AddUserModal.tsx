'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (userData: { name: string; email: string; gender: string; roles: string[] }) => void;
  availableRoles: string[];
}

const AddUserModal = ({ isOpen, onClose, onAddUser, availableRoles }: AddUserModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const availableGenders = ['Male', 'Female', 'Other'];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (selectedRoles.length === 0) newErrors.roles = 'At least one role is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAddUser({
        name: name.trim(),
        email: email.trim(),
        gender: gender.toLowerCase() || 'other',
        roles: selectedRoles,
      });
      setName('');
      setEmail('');
      setGender('');
      setSelectedRoles([]);
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
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              ref={inputRef}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="gender">Gender (optional)</Label>
            <Select
              value={gender}
              onValueChange={setGender}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                {availableGenders.map((g) => (
                  <SelectItem key={g} value={g.toLowerCase()}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="roles">
              Roles <span className="text-red-500">*</span>
            </Label>
            <div className="mt-1 flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-md min-h-[2.5rem]">
              {selectedRoles.map((role) => (
                <span
                  key={role}
                  className="flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
                >
                  {role}
                  <button
                    onClick={() => handleRoleToggle(role)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              {availableRoles.length > 0 && (
                <Select
                  onValueChange={handleRoleToggle}
                  value=""
                >
                  <SelectTrigger className="w-32 border-none shadow-none">
                    <SelectValue placeholder="Add role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles
                      .filter((role) => !selectedRoles.includes(role))
                      .map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {errors.roles && <p className="mt-1 text-sm text-red-600">{errors.roles}</p>}
          </div>
          <div className="flex justify-between space-x-2">
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={onClose}
            >
              Cancel
            </Button>
            <div className="flex space-x-2">
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleSubmit}
              >
                Save
              </Button>
              <Button
                className={`bg-green-500 text-white hover:bg-green-600 ${!email && 'opacity-50 cursor-not-allowed'}`}
                onClick={handleSubmit}
                disabled={!email}
              >
                Save and Invite
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;