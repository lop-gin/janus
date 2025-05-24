"use client";

import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSignUpContext } from '@/context/SignUpContext';
import Input, { Select, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface FormErrors {
  name?: string;
  type?: string;
  email?: string;
}

export default function CompanyDetailsPage() {
  const router = useRouter();
  const { companyDetails, updateCompanyDetails, error: contextError } = useSignUpContext();
  const [localError, setLocalError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const companyTypes = [
    { value: 'manufacturer', label: 'Manufacturer' },
    { value: 'distributor', label: 'Distributor' },
    { value: 'both', label: 'Both (Manufacturer & Distributor)' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateCompanyDetails({ [name]: value });
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!companyDetails.name.trim()) {
      newErrors.name = "Company name is required.";
    }
    if (!companyDetails.type) {
      newErrors.type = "Company type is required.";
    }
    if (companyDetails.email && !/\S+@\S+\.\S+/.test(companyDetails.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (validateForm()) {
      router.push('/signup/user-details');
    } else {
      setLocalError("Please correct the errors in the form.");
    }
  };

  return (
    <div className="bg-gray-800 p-8 md:p-10 rounded-xl shadow-2xl w-full animate-fadeIn">
      <h2 className="text-3xl font-bold text-center text-orange-500 mb-8">
        Step 1: Tell Us About Your Company
      </h2>
      
      {contextError && <p className="mb-4 text-sm text-red-400 bg-red-900/30 p-3 rounded-md">{contextError}</p>}
      {localError && <p className="mb-4 text-sm text-red-400 bg-red-900/30 p-3 rounded-md">{localError}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Company Name"
          id="name"
          name="name"
          value={companyDetails.name}
          onChange={handleChange}
          error={formErrors.name}
          placeholder="Your Company Inc."
          required
        />
        <Select
          label="Company Type"
          id="type"
          name="type"
          value={companyDetails.type}
          onChange={handleChange}
          options={companyTypes}
          error={formErrors.type}
          required
        />
        <Input
          label="Company Email (Optional)"
          id="email"
          name="email"
          type="email"
          value={companyDetails.email || ''}
          onChange={handleChange}
          error={formErrors.email}
          placeholder="contact@company.com"
        />
        <Textarea
          label="Company Address (Optional)"
          id="address"
          name="address"
          value={companyDetails.address || ''}
          onChange={handleChange}
          placeholder="123 Main St, Anytown, USA"
        />
        <Input
          label="Company Tax ID (Optional)"
          id="tax_id"
          name="tax_id"
          value={companyDetails.tax_id || ''}
          onChange={handleChange}
          placeholder="Your Tax Identification Number"
        />
        
        <Button type="submit" fullWidth variant="primary">
          Continue to User Details
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link href="/signin" className="font-medium text-orange-500 hover:text-orange-400">
          Sign In
        </Link>
      </p>
    </div>
  );
}
