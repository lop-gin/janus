'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, Users, ShieldCheck, PlusIcon, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

// QB Logo component
const QBLogo = () => (
  <div className="flex items-center p-4 bg-[#2c2c2c] text-white">
    <div className="h-7 w-7 rounded-md bg-[#21a366] flex items-center justify-center mr-2">
      <span className="font-bold text-lg">qb</span>
    </div>
    <div className="text-sm font-semibold lowercase">
      inventorypro
    </div>
  </div>
);

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active?: boolean;
  hasChildren?: boolean;
}

const SidebarItem = ({ icon, label, path, active = false, hasChildren = false }: SidebarItemProps) => {
  return (
    <Link
      href={path}
      className={`flex items-center pl-4 pr-2 py-2.5 text-sm group hover:bg-[#393939] ${
        active ? 'bg-[#393939]' : ''
      }`}
    >
      <div className="w-6 mr-3 text-gray-400 group-hover:text-white">{icon}</div>
      <span className="text-gray-300 group-hover:text-white flex-1">{label}</span>
      {hasChildren && <ChevronRight className="h-4 w-4 text-gray-500" />}
    </Link>
  );
};

interface DashboardSidebarProps {
  isOpen: boolean;
  toggle: () => void;
  toggleNewMenu: () => void;
  hasPermission: (module: string, action: string, subAction?: string) => boolean;
}

export default function DashboardSidebar({ isOpen, toggle, toggleNewMenu, hasPermission }: DashboardSidebarProps) {
  const pathname = usePathname();
  const newButtonRef = useRef<HTMLButtonElement>(null);

  // Determine active route
  const isActive = (path: string) => {
    return pathname.includes(path);
  };

  if (!isOpen) {
    return null; // Return null instead of a small bar
  }

  return (
    <div className="bg-[#2c2c2c] h-screen w-56 fixed left-0 top-0 flex flex-col z-50 border-r border-[#3a3a3a]">
      <div className="flex items-center justify-between">
        <QBLogo />
        <button
          onClick={toggle}
          className="p-2 text-gray-400 hover:text-white mr-2"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-2">
        <button
          ref={newButtonRef}
          onClick={toggleNewMenu}
          className="py-1.0 px-2 text-white border-2 border-white hover:bg-[#3a3a3a] rounded-full w-full flex items-center justify-center mb-2 bg-[#2c2c2c]"
        >
          <PlusIcon className="h-4 w-4 mr-1" /> New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="uppercase text-xs font-semibold text-gray-500">Menu</div>
          <button className="text-gray-500 hover:text-white">
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <nav className="mb-4">
          <SidebarItem
            icon={<Home className="h-5 w-5" />}
            label="Dashboard"
            path="/dashboard"
            active={pathname === '/dashboard'}
          />
          <div className="flex items-center justify-between px-4 py-2">
            <div className="uppercase text-xs font-semibold text-gray-500">Employees</div>
            <button className="text-gray-500 hover:text-white">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
          {hasPermission('Employee', 'user_management', 'view') && (
            <SidebarItem
              icon={<Users className="h-5 w-5" />}
              label="User Management"
              path="/dashboard/users"
              active={isActive('/dashboard/users')}
            />
          )}
          {hasPermission('Employee', 'role_management', 'view') && (
            <SidebarItem
              icon={<ShieldCheck className="h-5 w-5" />}
              label="Role Management"
              path="/dashboard/roles"
              active={isActive('/dashboard/roles')}
            />
          )}
        </nav>
      </div>
    </div>
  );
}