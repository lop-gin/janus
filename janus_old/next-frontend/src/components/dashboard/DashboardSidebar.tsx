'use client';

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChevronRight, 
  Home, 
  FileText, 
  CreditCard, 
  Users, 
  BarChart3,
  UserCircle,
  Briefcase,
  Receipt,
  Calculator,
  User,
  Settings,
  ShieldCheck,
  PlusIcon,
  X,
  ChevronLeft,
  ChevronDown,
  Menu
} from "lucide-react";

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
        active ? "bg-[#393939]" : ""
      }`}
    >
      <div className="w-6 mr-3 text-gray-400 group-hover:text-white">
        {icon}
      </div>
      <span className="text-gray-300 group-hover:text-white flex-1">{label}</span>
      {hasChildren && <ChevronRight className="h-4 w-4 text-gray-500" />}
    </Link>
  );
};

interface DashboardSidebarProps {
  isOpen: boolean;
  toggle: () => void;
  toggleNewMenu: () => void;
}

export default function DashboardSidebar({ isOpen, toggle, toggleNewMenu }: DashboardSidebarProps) {
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

      <div className="flex items-center justify-between px-4 py-2">
        <div className="uppercase text-xs font-semibold text-gray-500">Bookmarks</div>
        <button className="text-gray-500 hover:text-white">
          <ChevronDown className="h-4 w-4" />
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
            active={pathname === "/dashboard"} 
          />
          
          <SidebarItem 
            icon={<FileText className="h-5 w-5" />} 
            label="Transactions" 
            path="/dashboard/transactions" 
            hasChildren={true}
          />
          
          <SidebarItem 
            icon={<Receipt className="h-5 w-5" />} 
            label="Sales" 
            path="/dashboard/sales" 
            hasChildren={true}
            active={isActive("/dashboard/sales")}
          />
          
          <SidebarItem 
            icon={<CreditCard className="h-5 w-5" />} 
            label="Expenses" 
            path="/dashboard/expenses" 
            hasChildren={true}
          />
          
          <SidebarItem 
            icon={<Users className="h-5 w-5" />} 
            label="Customers" 
            path="/dashboard/customers" 
            active={isActive("/dashboard/customers")}
          />
          
          <SidebarItem 
            icon={<BarChart3 className="h-5 w-5" />} 
            label="Reports" 
            path="/dashboard/reports" 
            hasChildren={true}
          />
          
          <SidebarItem 
            icon={<User className="h-5 w-5" />} 
            label="Employees" 
            path="/dashboard/employees" 
            active={isActive("/dashboard/employees")}
          />
          
          <SidebarItem 
            icon={<ShieldCheck className="h-5 w-5" />} 
            label="Roles" 
            path="/dashboard/roles" 
            active={isActive("/dashboard/roles")}
          />
          
          <SidebarItem 
            icon={<Calculator className="h-5 w-5" />} 
            label="Budgets" 
            path="/dashboard/budgets" 
          />
          
          <SidebarItem 
            icon={<UserCircle className="h-5 w-5" />} 
            label="My Accountant" 
            path="/dashboard/accountant" 
          />
          
          <SidebarItem 
            icon={<Briefcase className="h-5 w-5" />} 
            label="Apps" 
            path="/dashboard/apps" 
            hasChildren={true}
          />
        </nav>
      </div>
      
      <div className="mt-auto p-2 border-t border-[#3a3a3a]">
        <button className="w-full flex items-center pl-4 pr-2 py-2 text-sm text-gray-400 hover:text-white hover:bg-[#393939] rounded-md">
          <Settings className="h-5 w-5 mr-3" />
          <span>Menu settings</span>
        </button>
      </div>
    </div>
  );
}