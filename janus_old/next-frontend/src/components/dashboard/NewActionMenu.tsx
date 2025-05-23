'use client';

import { useRef, useEffect } from "react";
import Link from "next/link";
import { X, Play } from "lucide-react";

interface NewActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  sidebarOpen: boolean;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

interface ActionItem {
  title: string;
  to: string;
}

const NewActionMenu: React.FC<NewActionMenuProps> = ({ isOpen, onClose, sidebarOpen, buttonRef }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Calculate position based on the button reference
  const getMenuPosition = () => {
    if (!buttonRef.current) return { top: '70px', left: '16px' };
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    return {
      top: `${buttonRect.bottom + window.scrollY}px`,
      left: `${buttonRect.left + window.scrollX}px`
    };
  };
  
  const position = getMenuPosition();

  const categories = [
    {
      title: "Customers",
      items: [
        { title: "Invoice", to: "/sales/invoice" },
        { title: "Receive payment", to: "/dashboard/sales/payment" },
        { title: "Statement", to: "#" },
        { title: "Estimate", to: "/dashboard/sales/estimate" },
        { title: "Credit note", to: "/dashboard/sales/credit-note" },
        { title: "Sales receipt", to: "/dashboard/sales/receipt" },
        { title: "Refund receipt", to: "/dashboard/sales/refund-receipt" },
        { title: "Delayed credit", to: "#" },
        { title: "Delayed charge", to: "#" },
        { title: "Add customer", to: "/dashboard/customers/add" },
      ],
    },
    {
      title: "Suppliers",
      items: [
        { title: "Expense", to: "#" },
        { title: "Cheque", to: "#" },
        { title: "Bill", to: "#" },
        { title: "Pay bills", to: "#" },
        { title: "Purchase order", to: "#" },
        { title: "Supplier credit", to: "#" },
        { title: "Credit card credit", to: "#" },
        { title: "Add supplier", to: "#" },
      ],
    },
    {
      title: "Team",
      items: [
        { title: "Single time activity", to: "#" },
        { title: "Weekly timesheet", to: "#" },
        { title: "Add employee", to: "/dashboard/employees/invite" },
        { title: "Add role", to: "/dashboard/roles/create" },
      ],
    },
    {
      title: "Other",
      items: [
        { title: "Bank deposit", to: "#" },
        { title: "Transfer", to: "#" },
        { title: "Journal entry", to: "#" },
        { title: "Inventory qty adjustment", to: "#" },
        { title: "Pay down credit card", to: "#" },
        { title: "Add product/service", to: "#" },
      ],
    },
  ];

  const ActionLink = ({ item }: { item: ActionItem }) => (
    <Link
      href={item.to}
      className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100"
      onClick={onClose}
    >
      {item.title}
    </Link>
  );

  return (
    <div
      ref={menuRef}
      className="fixed bg-white rounded-md shadow-lg z-[100] border border-gray-200 max-h-[calc(100vh-120px)] overflow-y-auto"
      style={{ 
        top: position.top,
        left: position.left,
        width: 'auto',
        minWidth: '650px'
      }}
    >
      <div className="flex justify-between items-center p-3 border-b border-gray-200">
        <div className="flex space-x-2">
          <button className="text-gray-500 hover:text-gray-700">
            <Play className="h-4 w-4 mr-1" />
            <span className="text-xs text-blue-600">Video tutorials</span>
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <span className="text-xs mr-1">Show less</span>
          <X className="h-4 w-4 inline" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-0">
        {categories.map((category) => (
          <div key={category.title} className="p-0">
            <h3 className="font-medium text-sm p-4 text-gray-700">
              {category.title}
            </h3>
            <div>
              {category.items.map((item) => (
                <ActionLink key={item.title} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewActionMenu;