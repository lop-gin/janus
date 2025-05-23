import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectCellProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  isEditing: boolean;
  onFocus?: (e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  displayValue?: string; // New prop for displaying the label when not editing
}

export const SelectCell: React.FC<SelectCellProps> = ({
  value,
  onChange,
  options,
  isEditing,
  onFocus,
  displayValue,
}) => {
  if (!isEditing) {
    // Use displayValue if provided, otherwise find the label from options, fallback to value
    const displayText = displayValue || options.find((opt) => opt.value === value)?.label || value || '';
    return <div className="py-1 px-1 text-left">{displayText}</div>;
  }

  return (
    <Select
      onValueChange={onChange}
      value={value || ""}
    >
      <SelectTrigger
        className="w-full h-8 font-normal text-gray-700 focus:ring-0 focus:border-gray-300"
        onClick={(e) => {
          e.stopPropagation();
          if (onFocus) onFocus(e);
        }}
      >
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};