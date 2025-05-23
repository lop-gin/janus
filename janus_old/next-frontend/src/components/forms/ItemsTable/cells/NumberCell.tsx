
import React from "react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/document-utils";

interface NumberCellProps {
  value: number | undefined;
  onChange: (value: string) => void;
  isEditing: boolean;
  onFocus?: (e: React.MouseEvent) => void;
  isCurrency?: boolean;
  isPercentage?: boolean;
}

export const NumberCell: React.FC<NumberCellProps> = ({
  value,
  onChange,
  isEditing,
  onFocus,
  isCurrency = false,
  isPercentage = false
}) => {
  // Custom input handler to restrict input to numbers and decimals only
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty values, numbers, and only one decimal point
    if (inputValue === "" || /^[0-9]*\.?[0-9]*$/.test(inputValue)) {
      onChange(inputValue);
    }
  };

  if (!isEditing) {
    if (value === undefined) return <div className="text-right py-1 px-1"></div>;
    
    if (isCurrency) {
      return <div className="text-right py-1 px-1">{formatCurrency(value)}</div>;
    }
    
    if (isPercentage) {
      return <div className="text-right py-1 px-1">{value}%</div>;
    }
    
    return <div className="text-right py-1 px-1">{value}</div>;
  }

  return (
    <Input
      className="border-gray-200 text-right h-8 focus:ring-0 focus:ring-offset-0 focus-visible:border-green-600"
      value={value === undefined ? "" : value}
      onChange={handleNumberInput}
      onClick={(e) => {
        e.stopPropagation();
        if (onFocus) onFocus(e);
      }}
      type="text"
      inputMode="decimal"
    />
  );
};
