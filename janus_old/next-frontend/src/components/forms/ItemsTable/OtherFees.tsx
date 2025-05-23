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
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      updateOtherFees({ amount: undefined });
    } else {
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        updateOtherFees({ amount: parsedValue });
      }
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
          value={otherFees.amount !== undefined ? otherFees.amount.toString() : ""}
          onChange={handleNumberInput}
          placeholder=""
        />
      </div>
    </div>
  );
};