'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

// Feature card component
const FeatureCard = ({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="text-blue-600 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <NexusForgeLogoLink />
          <div className="flex items-center space-x-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-blue-600 font-medium">
              Sign In
            </Link>
            <Link href="/auth/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <motion.div 
              className="md:w-1/2 mb-10 md:mb-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Streamline Your Manufacturing Process
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                NexusForge helps manufacturers optimize operations, reduce costs, and increase productivity.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/auth/register" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium text-center transition-colors">
                  Start Free Trial
                </Link>
                <Link href="#features" className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium text-center transition-colors">
                  Learn More
                </Link>
              </div>
            </motion.div>
            <motion.div 
              className="md:w-1/2 flex justify-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-blue-600 rounded-lg transform rotate-3"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-lg">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-md flex items-center justify-center mb-4">
                    <LoadingAnimation size="large" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded-full w-5/6"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your manufacturing business efficiently
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              title="Inventory Management" 
              description="Track raw materials and finished goods with real-time updates and low stock alerts."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
            />
            <FeatureCard 
              title="Production Planning" 
              description="Schedule and monitor production runs, track machine utilization and efficiency."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
            />
            <FeatureCard 
              title="Quality Control" 
              description="Implement quality checks at every stage of production to ensure consistent product quality."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
            <FeatureCard 
              title="Sales Management" 
              description="Track orders, manage customers, and generate invoices all in one place."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            />
            <FeatureCard 
              title="Procurement" 
              description="Manage suppliers, create purchase orders, and track deliveries efficiently."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
            />
            <FeatureCard 
              title="Analytics & Reporting" 
              description="Get insights into your business with customizable reports and dashboards."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto bg-blue-600 rounded-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Manufacturing Business?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join thousands of manufacturers who have streamlined their operations with NexusForge.
          </p>
          <Link href="/auth/register" className="inline-block bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-medium text-lg transition-colors">
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <NexusForgeLogoLink />
            <div className="mt-6 md:mt-0">
              <p className="text-gray-600">© 2025 NexusForge. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
