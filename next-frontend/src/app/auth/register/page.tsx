'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from "zod";
import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";
import { LoadingAnimation } from "@/components/ui/loading-animation";

// Logo component with simplified styling
export const NexusForgeLogoLink = () => (
  <Link href="/" className="inline-block">
    <div className="flex items-center space-x-2">
      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
        <span className="text-white text-xl font-bold">NF</span>
      </div>
      <span className="text-2xl font-bold text-blue-600">
        NexusForge
      </span>
    </div>
  </Link>
);

// Define our schema using Zod
const registerSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  companyType: z.enum(["manufacturer", "distributor", "both"]),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().optional(),
  address: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    companyName: "",
    companyType: "manufacturer",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validation for each step
  const validateStep = (currentStep: number) => {
    const fieldsToValidate = 
      currentStep === 1 
        ? { 
            fullName: formData.fullName, 
            companyName: formData.companyName, 
            companyType: formData.companyType, 
            email: formData.email 
          }
        : { 
            password: formData.password, 
            confirmPassword: formData.confirmPassword 
          };
    
    try {
      if (currentStep === 1) {
        z.object({
          fullName: z.string().min(3, "Full name must be at least 3 characters"),
          companyName: z.string().min(2, "Company name must be at least 2 characters"),
          companyType: z.enum(["manufacturer", "distributor", "both"]),
          email: z.string().email("Please enter a valid email"),
        }).parse(fieldsToValidate);
      } else if (currentStep === 2) {
        z.object({
          password: z.string().min(6, "Password must be at least 6 characters"),
          confirmPassword: z.string().min(6, "Please confirm your password"),
        })
          .refine((data) => data.password === data.confirmPassword, {
            message: "Passwords do not match",
            path: ["confirmPassword"],
          })
          .parse(fieldsToValidate);
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Simplified Progress Indicator component
  const ProgressIndicator = () => (
    <div className="flex justify-center mb-8">
      {[1, 2].map(i => (
        <div 
          key={i}
          className="flex flex-col items-center mx-4"
        >
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
              i < step 
                ? 'bg-green-500 text-white' 
                : i === step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
            }`}
          >
            {i < step ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              i
            )}
          </div>
          <span className={`text-sm ${i === step ? 'font-medium text-blue-600' : 'text-gray-500'}`}>
            {i === 1 ? 'Company Info' : 'Account Setup'}
          </span>
        </div>
      ))}
    </div>
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    if (step < 2) {
      setStep(prev => prev + 1);
      return;
    }

    setIsLoading(true);
    try {
      await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        company_name: formData.companyName,
        company_type: formData.companyType,
        phone: formData.phone,
        address: formData.address,
        is_admin: true,
      });

      toast.success("Registration successful! Redirecting to dashboard...");
      
      // AuthProvider will handle redirection
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with logo */}
      <header className="w-full py-6 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto">
          <NexusForgeLogoLink />
        </div>
      </header>
      
      <div className="flex-grow flex items-center justify-center p-6">
        <div 
          className="bg-white rounded-lg shadow-md overflow-hidden max-w-md w-full p-8"
        >
          <div className="text-center mb-6">
            <h1 
              className="text-2xl font-bold text-gray-900"
            >
              Create Your Account
            </h1>
            <p 
              className="text-gray-600 mt-2"
            >
              Join NexusForge to streamline your manufacturing
            </p>
          </div>
          
          <ProgressIndicator />
          
          {isLoading ? (
            <div className="py-12">
              <LoadingAnimation size="medium" />
              <p className="text-center mt-4 text-gray-600">Setting up your account...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Step 1: Company Information */}
              {step === 1 && (
                <div
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.fullName 
                          ? 'border-red-500' 
                          : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="companyName">
                      Company Name
                    </label>
                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      value={formData.companyName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.companyName 
                          ? 'border-red-500' 
                          : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                      placeholder="Enter your company name"
                    />
                    {errors.companyName && (
                      <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="companyType">
                      Company Type
                    </label>
                    <select
                      id="companyType"
                      name="companyType"
                      value={formData.companyType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="manufacturer">Manufacturer</option>
                      <option value="distributor">Distributor</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.email 
                          ? 'border-red-500' 
                          : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                      placeholder="Enter your email address"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}
              
              {/* Step 2: Account Setup */}
              {step === 2 && (
                <div
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.password 
                          ? 'border-red-500' 
                          : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                      placeholder="Create a password"
                    />
                    {errors.password && (
                      <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border ${
                        errors.confirmPassword 
                          ? 'border-red-500' 
                          : 'border-gray-300'
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900`}
                      placeholder="Confirm your password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
                      Address (Optional)
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="Enter your address"
                    />
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              )}
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
