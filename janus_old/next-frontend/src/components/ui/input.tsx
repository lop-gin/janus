import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-black ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground placeholder:text-muted-foreground placeholder:text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-600 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-xs",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };