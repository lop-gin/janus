// src/components/ui/user-role-badge.tsx
import React from "react";
import { cn } from "@/lib/utils";

// Update UserRole to match database format (title case with spaces)
type UserRole =
  | "Super Admin"
  | "Admin"
  | "Sales Supervisor"
  | "Sales Rep"
  | "Procurement Supervisor"
  | "Procurement Rep"
  | "Production Supervisor"
  | "Machine Operator"
  | "Packaging Supervisor"
  | "Packaging Person"
  | "Transport Supervisor"
  | "Transport Person"
  | "Store Supervisor"
  | "Store Person"
  | "HR Supervisor";

// Update roleColors keys to match
const roleColors: Record<UserRole, { bg: string; text: string }> = {
  "Super Admin": { bg: "bg-black", text: "text-white" },
  "Admin": { bg: "bg-red-100", text: "text-red-800" },
  "Sales Supervisor": { bg: "bg-blue-100", text: "text-blue-800" },
  "Sales Rep": { bg: "bg-blue-50", text: "text-blue-600" },
  "Procurement Supervisor": { bg: "bg-purple-100", text: "text-purple-800" },
  "Procurement Rep": { bg: "bg-purple-50", text: "text-purple-600" },
  "Production Supervisor": { bg: "bg-yellow-100", text: "text-yellow-800" },
  "Machine Operator": { bg: "bg-yellow-50", text: "text-yellow-600" },
  "Packaging Supervisor": { bg: "bg-green-100", text: "text-green-800" },
  "Packaging Person": { bg: "bg-green-50", text: "text-green-600" },
  "Transport Supervisor": { bg: "bg-orange-100", text: "text-orange-800" },
  "Transport Person": { bg: "bg-orange-50", text: "text-orange-600" },
  "Store Supervisor": { bg: "bg-teal-100", text: "text-teal-800" },
  "Store Person": { bg: "bg-teal-50", text: "text-teal-600" },
  "HR Supervisor": { bg: "bg-pink-100", text: "text-pink-800" },
};

// Since role matches the display text, roleLabels might not be needed, but keep it for flexibility
const roleLabels: Record<UserRole, string> = {
  "Super Admin": "Super Admin",
  "Admin": "Admin",
  "Sales Supervisor": "Sales Supervisor",
  "Sales Rep": "Sales Rep",
  "Procurement Supervisor": "Procurement Supervisor",
  "Procurement Rep": "Procurement Rep",
  "Production Supervisor": "Production Supervisor",
  "Machine Operator": "Machine Operator",
  "Packaging Supervisor": "Packaging Supervisor",
  "Packaging Person": "Packaging Person",
  "Transport Supervisor": "Transport Supervisor",
  "Transport Person": "Transport Person",
  "Store Supervisor": "Store Supervisor",
  "Store Person": "Store Person",
  "HR Supervisor": "HR Supervisor",
};

// Relax the prop type to string since userData.roles is string[]
interface UserRoleBadgeProps {
  role: string; // Will cast to UserRole safely
  className?: string;
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const { bg, text } = roleColors[role as UserRole] || { bg: "bg-gray-100", text: "text-gray-800" };
  const label = roleLabels[role as UserRole] || role;

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