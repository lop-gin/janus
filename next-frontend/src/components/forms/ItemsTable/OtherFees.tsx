
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { OtherFees as OtherFeesType } from "@/types/document";

interface OtherFeesProps {
  otherFees: OtherFeesType;
  updateOtherFees: (updates: Partial<OtherFeesType>) => void;
}

export const OtherFees: React.FC<OtherFeesProps> = ({
  otherFees,
  updateOtherFees,
}) => {
  // Custom input handler to restrict input to numbers and decimals only
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty values, numbers, and only one decimal point
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      updateOtherFees({ amount: value === "" ? undefined : parseFloat(value) || 0 });
    }
  };

  return (
    <div className="w-1/2 flex items-start space-x-3">
      <div className="w-2/3">
        <Label className="text-xs font-medium text-gray-600 mb-1">Other Fees Description</Label>
        <Input
          className="text-xs"
          value={otherFees.description}
          onChange={(e) => updateOtherFees({ description: e.target.value })}
          placeholder="Describe additional fees"
        />
      </div>
      <div className="w-1/3">
        <Label className="text-xs font-medium text-gray-600 mb-1">Fee Amount</Label>
        <Input
          className="text-xs text-right"
          type="text"
          inputMode="decimal"
          value={otherFees.amount === undefined ? "" : otherFees.amount}
          onChange={handleNumberInput}
          placeholder=""
        />
      </div>
    </div>
  );
};
