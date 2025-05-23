
import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className
}) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };
  
  return (
    <div className="flex justify-center items-center">
      <div className={cn(
        "border-t-transparent border-solid animate-spin rounded-full border-blue-400 border-4",
        sizeClasses[size],
        className
      )}/>
    </div>
  );
};
