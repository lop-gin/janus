"use client";

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (userData: { name: string; email: string; gender: string; roles: string[] }) => void;
}

const AddUserModal = ({ isOpen, onClose, onAddUser }: AddUserModalProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [rolesInput, setRolesInput] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const genderInputRef = useRef<HTMLInputElement>(null);

  const availableRoles = ['Admin', 'Editor', 'Viewer'];
  const availableGenders = ['Male', 'Female'];

  const filteredRoles = availableRoles.filter(
    (role) => !selectedRoles.includes(role) && role.toLowerCase().includes(rolesInput.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (selectedRoles.length === 0) newErrors.roles = 'At least one role is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format';
    if (phone && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone)) newErrors.phone = 'Invalid phone number format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRoles([...selectedRoles, role]);
    setRolesInput('');
    setIsDropdownOpen(false);
    inputRef.current?.focus();
  };

  const handleRoleRemove = (role: string) => {
    setSelectedRoles(selectedRoles.filter((r) => r !== role));
    inputRef.current?.focus();
  };

  const handleGenderSelect = (genderValue: string) => {
    setGender(genderValue.toLowerCase());
    setIsGenderDropdownOpen(false);
    genderInputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAddUser({ name, email, gender, roles: selectedRoles });
      setName('');
      setEmail('');
      setPhone('');
      setGender('');
      setSelectedRoles([]);
      setErrors({});
      onClose();
    }
  };

  const handleBlur = () => {
    setTimeout(() => setIsDropdownOpen(false), 200); // Delay to allow click on dropdown items
  };

  const handleGenderBlur = () => {
    setTimeout(() => setIsGenderDropdownOpen(false), 200); // Delay to allow click on dropdown items
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
        ref={modalRef}
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
            <label className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              ref={inputRef}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email (optional)</label>
            <input
              type="email"
              name="user-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number (optional)</label>
            <input
              type="tel"
              name="user-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., (123) 456-7890"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Gender (optional)</label>
            <div className="relative mt-1">
              <div
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md min-h-[2.5rem] cursor-pointer"
                onClick={() => setIsGenderDropdownOpen(true)}
                onBlur={handleGenderBlur}
                tabIndex={0}
              >
                <span className={gender ? 'text-gray-900' : 'text-gray-400'}>
                  {gender ? gender.charAt(0).toUpperCase() + gender.slice(1) : 'Select gender'}
                </span>
                <input
                  type="hidden"
                  name="user-gender"
                  value={gender}
                  ref={genderInputRef}
                />
              </div>
              {isGenderDropdownOpen && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                  {availableGenders.map((genderOption) => (
                    <li
                      key={genderOption}
                      onMouseDown={() => handleGenderSelect(genderOption)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {genderOption}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Roles <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <div className="flex flex-wrap items-center gap-2 px-3 py-2 border border-gray-300 rounded-md min-h-[2.5rem]">
                {selectedRoles.map((role) => (
                  <span
                    key={role}
                    className="flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
                  >
                    {role}
                    <button
                      onClick={() => handleRoleRemove(role)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  name="user-roles"
                  value={rolesInput}
                  onChange={(e) => {
                    setRolesInput(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onClick={() => setIsDropdownOpen(true)}
                  onBlur={handleBlur}
                  className="flex-1 outline-none border-none p-0 min-w-[100px]"
                  placeholder={selectedRoles.length === 0 ? 'Select role or roles' : ''}
                />
              </div>
              {isDropdownOpen && filteredRoles.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                  {filteredRoles.map((role) => (
                    <li
                      key={role}
                      onMouseDown={() => handleRoleSelect(role)}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {role}
                    </li>
                  ))}
                </ul>
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