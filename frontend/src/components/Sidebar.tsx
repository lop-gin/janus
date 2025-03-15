'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-provider';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  activeModule: string;
}

export default function Sidebar({ activeModule }: SidebarProps) {
  const { user, signOut } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(activeModule);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close new menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (newMenuRef.current && !newMenuRef.current.contains(event.target as Node)) {
        setShowNewMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close new menu when navigating
  useEffect(() => {
    setShowNewMenu(false);
  }, [pathname]);

  const toggleExpand = (module: string) => {
    if (expanded === module) {
      setExpanded(null);
    } else {
      setExpanded(module);
    }
  };

  const modules = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
        </svg>
      ),
      link: '/dashboard',
      subModules: [],
    },
    {
      id: 'sales',
      name: 'Sales',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
        </svg>
      ),
      link: '#',
      subModules: [
        { id: 'invoices', name: 'Invoices', link: '/dashboard/sales/invoices' },
        { id: 'sales-receipts', name: 'Sales Receipts', link: '/dashboard/sales/sales-receipts' },
        { id: 'refund-receipts', name: 'Refund Receipts', link: '/dashboard/sales/refund-receipts' },
        { id: 'credit-notes', name: 'Credit Notes', link: '/dashboard/sales/credit-notes' },
        { id: 'estimates', name: 'Estimates', link: '/dashboard/sales/estimates' },
        { id: 'payments', name: 'Receive Payments', link: '/dashboard/sales/payments' },
        { id: 'customers', name: 'Customers', link: '/dashboard/sales/customers' },
      ],
    },
    {
      id: 'purchases',
      name: 'Purchases',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd"></path>
        </svg>
      ),
      link: '#',
      subModules: [
        { id: 'purchase-orders', name: 'Purchase Orders', link: '/dashboard/purchases/purchase-orders' },
        { id: 'purchases', name: 'Purchases', link: '/dashboard/purchases/purchases' },
        { id: 'supplier-credits', name: 'Supplier Credits', link: '/dashboard/purchases/supplier-credits' },
        { id: 'supplier-refunds', name: 'Supplier Refunds', link: '/dashboard/purchases/supplier-refunds' },
        { id: 'suppliers', name: 'Suppliers', link: '/dashboard/purchases/suppliers' },
      ],
    },
    {
      id: 'production',
      name: 'Production',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd"></path>
        </svg>
      ),
      link: '#',
      subModules: [
        { id: 'production-records', name: 'Production Records', link: '/dashboard/production/production-records' },
        { id: 'machines', name: 'Machines', link: '/dashboard/production/machines' },
      ],
    },
    {
      id: 'packaging',
      name: 'Packaging',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"></path>
          <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd"></path>
        </svg>
      ),
      link: '#',
      subModules: [
        { id: 'packaging-records', name: 'Packaging Records', link: '/dashboard/packaging/packaging-records' },
      ],
    },
    {
      id: 'transport',
      name: 'Transport',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"></path>
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7h-2a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"></path>
        </svg>
      ),
      link: '#',
      subModules: [
        { id: 'transport-records', name: 'Transport Records', link: '/dashboard/transport/transport-records' },
      ],
    },
    {
      id: 'inventory',
      name: 'Inventory',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd"></path>
        </svg>
      ),
      link: '#',
      subModules: [
        { id: 'products', name: 'Products', link: '/dashboard/inventory/products' },
        { id: 'storage-locations', name: 'Storage Locations', link: '/dashboard/inventory/storage-locations' },
        { id: 'inventory-status', name: 'Inventory Status', link: '/dashboard/inventory/status' },
      ],
    },
    {
      id: 'reports',
      name: 'Reports',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
      ),
      link: '/dashboard/reports',
      subModules: [],
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
        </svg>
      ),
      link: '#',
      subModules: [
        { id: 'company', name: 'Company Settings', link: '/dashboard/settings/company' },
        { id: 'users', name: 'Users & Permissions', link: '/dashboard/settings/users' },
        { id: 'invite-user', name: 'Invite User', link: '/dashboard/settings/invite-user' },
      ],
    },
  ];

  // New menu items organized by department
  const newMenuItems = [
    {
      department: 'Sales',
      items: [
        { name: 'Invoice', link: '/dashboard/sales/invoices/new' },
        { name: 'Sales Receipt', link: '/dashboard/sales/sales-receipts/new' },
        { name: 'Refund Receipt', link: '/dashboard/sales/refund-receipts/new' },
        { name: 'Credit Note', link: '/dashboard/sales/credit-notes/new' },
        { name: 'Estimate', link: '/dashboard/sales/estimates/new' },
        { name: 'Receive Payment', link: '/dashboard/sales/payments/new' },
        { name: 'Customer', link: '/dashboard/sales/customers/new' },
      ],
    },
    {
      department: 'Purchases',
      items: [
        { name: 'Purchase Order', link: '/dashboard/purchases/purchase-orders/new' },
        { name: 'Purchase', link: '/dashboard/purchases/purchases/new' },
        { name: 'Supplier Credit', link: '/dashboard/purchases/supplier-credits/new' },
        { name: 'Supplier Refund', link: '/dashboard/purchases/supplier-refunds/new' },
        { name: 'Supplier', link: '/dashboard/purchases/suppliers/new' },
      ],
    },
    {
      department: 'Production',
      items: [
        { name: 'Production Record', link: '/dashboard/production/production-records/new' },
        { name: 'Machine', link: '/dashboard/production/machines/new' },
      ],
    },
    {
      department: 'Packaging & Transport',
      items: [
        { name: 'Packaging Record', link: '/dashboard/packaging/packaging-records/new' },
        { name: 'Transport Record', link: '/dashboard/transport/transport-records/new' },
      ],
    },
    {
      department: 'Inventory',
      items: [
        { name: 'Product', link: '/dashboard/inventory/products/new' },
        { name: 'Storage Location', link: '/dashboard/inventory/storage-locations/new' },
      ],
    },
  ];

  return (
    <div className={`bg-white h-full border-r border-gray-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex items-center justify-between h-16 border-b border-gray-200 px-4">
        {!isCollapsed && (
          <h1 className="text-xl font-semibold text-gray-800">Manufacturing ERP</h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>
      
      <div className="relative px-4 py-3 border-b border-gray-200">
        <button
          onClick={() => setShowNewMenu(!showNewMenu)}
          className={`flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium ${
            isCollapsed ? 'w-8 h-8 p-0' : 'w-full py-2 px-4'
          }`}
        >
          {isCollapsed ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New
            </>
          )}
        </button>
        
        {/* New Menu Dropdown */}
        {showNewMenu && (
          <div 
            ref={newMenuRef}
            className="absolute left-4 top-14 z-10 mt-2 w-screen max-w-md bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 overflow-hidden"
            style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}
          >
            <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-1">
              {newMenuItems.map((section, idx) => (
                <div key={idx} className={idx % 2 === 0 ? 'col-span-1' : 'col-span-1'}>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{section.department}</h3>
                  <ul className="space-y-1">
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link
                          href={item.link}
                          className="block px-2 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          {item.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-2">
          {modules.map((module) => (
            <li key={module.id}>
              {module.subModules.length > 0 ? (
                <div>
                  <button
                    onClick={() => toggleExpand(module.id)}
                    className={`flex items-center w-full p-2 text-base font-normal rounded-lg hover:bg-gray-100 ${
                      expanded === module.id || activeModule.startsWith(module.id)
                        ? 'bg-gray-100 text-blue-600'
                        : 'text-gray-700'
                    }`}
                  >
                    <span className="min-w-[20px] mr-3">{module.icon}</span>
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left whitespace-nowrap">{module.name}</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${
                            expanded === module.id ? 'transform rotate-180' : ''
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                      </>
                    )}
                  </button>
                  {!isCollapsed && (expanded === module.id || activeModule.startsWith(module.id)) && (
                    <ul className="py-2 space-y-2 pl-7">
                      {module.subModules.map((subModule) => (
                        <li key={subModule.id}>
                          <Link
                            href={subModule.link}
                            className={`flex items-center p-2 text-sm font-normal rounded-lg hover:bg-gray-100 ${
                              activeModule === `${module.id}/${subModule.id}`
                                ? 'bg-gray-100 text-blue-600'
                                : 'text-gray-700'
                            }`}
                          >
                            {subModule.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={module.link}
                  className={`flex items-center p-2 text-base font-normal rounded-lg hover:bg-gray-100 ${
                    activeModule === module.id
                      ? 'bg-gray-100 text-blue-600'
                      : 'text-gray-700'
                  }`}
                >
                  <span className="min-w-[20px] mr-3">{module.icon}</span>
                  {!isCollapsed && (
                    <span className="flex-1 whitespace-nowrap">{module.name}</span>
                  )}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      <div className={`p-4 border-t border-gray-200 ${isCollapsed ? 'text-center' : ''}`}>
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {user?.profile?.first_name?.[0] || user?.email?.[0] || 'U'}
            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {user?.profile?.first_name?.[0] || user?.email?.[0] || 'U'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 truncate">
                {user?.profile?.first_name
                  ? `${user.profile.first_name} ${user.profile.last_name}`
                  : user?.email}
              </p>
              <button
                onClick={signOut}
                className="text-xs font-medium text-blue-600 hover:text-blue-500"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
