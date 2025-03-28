import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FormHeaderProps {
  title: string;
  backUrl?: string;
  onClose?: () => void;
}

export const FormHeader: React.FC<FormHeaderProps> = ({
  title,
  backUrl = "/dashboard",
  onClose,
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-2 flex justify-between items-center sticky top-0 z-10">
      <h1 className="text-xl font-semibold text-black">{title}</h1>
      <Link href={backUrl}>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8" // Increased size
          onClick={onClose}
        >
          <X className="h-6 w-6" /> {/* Increased icon size */}
        </Button>
      </Link>
    </div>
  );
};