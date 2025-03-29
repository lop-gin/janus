
import React from "react";
import { cn } from "@/lib/utils";

type UserRole =
  | "superadmin"
  | "admin"
  | "sales_supervisor"
  | "sales_rep"
  | "procurement_supervisor"
  | "procurement_rep"
  | "production_supervisor"
  | "machine_operator"
  | "packaging_supervisor"
  | "packaging_person"
  | "transport_supervisor"
  | "transport_person"
  | "store_supervisor"
  | "store_person"
  | "hr_supervisor";

const roleColors: Record<UserRole, { bg: string; text: string }> = {
  superadmin: { bg: "bg-black", text: "text-white" },
  admin: { bg: "bg-red-100", text: "text-red-800" },
  sales_supervisor: { bg: "bg-blue-100", text: "text-blue-800" },
  sales_rep: { bg: "bg-blue-50", text: "text-blue-600" },
  procurement_supervisor: { bg: "bg-purple-100", text: "text-purple-800" },
  procurement_rep: { bg: "bg-purple-50", text: "text-purple-600" },
  production_supervisor: { bg: "bg-yellow-100", text: "text-yellow-800" },
  machine_operator: { bg: "bg-yellow-50", text: "text-yellow-600" },
  packaging_supervisor: { bg: "bg-green-100", text: "text-green-800" },
  packaging_person: { bg: "bg-green-50", text: "text-green-600" },
  transport_supervisor: { bg: "bg-orange-100", text: "text-orange-800" },
  transport_person: { bg: "bg-orange-50", text: "text-orange-600" },
  store_supervisor: { bg: "bg-teal-100", text: "text-teal-800" },
  store_person: { bg: "bg-teal-50", text: "text-teal-600" },
  hr_supervisor: { bg: "bg-pink-100", text: "text-pink-800" },
};

const roleLabels: Record<UserRole, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  sales_supervisor: "Sales Supervisor",
  sales_rep: "Sales Rep",
  procurement_supervisor: "Procurement Supervisor",
  procurement_rep: "Procurement Rep",
  production_supervisor: "Production Supervisor",
  machine_operator: "Machine Operator",
  packaging_supervisor: "Packaging Supervisor",
  packaging_person: "Packaging Person",
  transport_supervisor: "Transport Supervisor",
  transport_person: "Transport Person",
  store_supervisor: "Store Supervisor",
  store_person: "Store Person",
  hr_supervisor: "HR Supervisor",
};

interface UserRoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const { bg, text } = roleColors[role] || { bg: "bg-gray-100", text: "text-gray-800" };
  const label = roleLabels[role] || role;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        bg,
        text,
        className
      )}
    >
      {label}
    </span>
  );
}
