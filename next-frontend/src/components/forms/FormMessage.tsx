
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FormMessageProps {
  message: string;
  label?: string;
  onChange: (message: string) => void;
  placeholder?: string;
}

export const FormMessage: React.FC<FormMessageProps> = ({
  message,
  label = "MESSAGE ON DOCUMENT",
  onChange,
  placeholder = "Enter a message to be displayed on the document",
}) => {
  return (
    <div>
      <Label className="text-xs font-medium text-gray-700">{label}</Label>
      <div className="mt-1">
        <Textarea 
          className="min-h-[120px] resize-none text-xs"
          value={message}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};
