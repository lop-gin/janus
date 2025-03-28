
import React from "react";
import { Input } from "@/components/ui/input";

interface TextCellProps {
  value: string;
  onChange: (value: string) => void;
  isEditing: boolean;
  onFocus?: (e: React.MouseEvent) => void;
}

export const TextCell: React.FC<TextCellProps> = ({
  value,
  onChange,
  isEditing,
  onFocus
}) => {
  if (!isEditing) {
    return <div className="py-1 px-1 text-left">{value || ''}</div>;
  }

  return (
    <Input
      className="border-gray-200 h-8 focus:ring-0 focus:ring-offset-0 focus-visible:border-green-600"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => {
        e.stopPropagation();
        if (onFocus) onFocus(e);
      }}
    />
  );
};
