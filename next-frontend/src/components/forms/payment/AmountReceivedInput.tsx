
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AmountReceivedInputProps {
  amount: number;
  onChange: (amount: number) => void;
}

export const AmountReceivedInput: React.FC<AmountReceivedInputProps> = ({
  amount,
  onChange,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value);
    if (!isNaN(value)) {
      onChange(value);
    }
  };

  return (
    <div>
      <Label htmlFor="amountReceived" className="text-xs font-medium text-gray-600">
        Amount Received
      </Label>
      <Input
        id="amountReceived"
        type="text"
        inputMode="decimal"
        value={amount || ""}
        onChange={handleChange}
        className="mt-1 text-right"
        placeholder="0.00"
      />
    </div>
  );
};

export default AmountReceivedInput;
