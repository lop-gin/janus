import React from "react";
import { DocumentItem, OtherFees } from "@/types/document";
import { formatCurrency } from "@/lib/document-utils";

interface DocumentSummaryProps {
  items: DocumentItem[];
  otherFees: OtherFees;
}

export const DocumentSummary: React.FC<DocumentSummaryProps> = ({
  items,
  otherFees,
}) => {
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  };

  const calculateTax = () => {
    return items.reduce((sum, item) => {
      const itemAmount = (item.quantity || 0) * (item.unitPrice || 0);
      const taxAmount = itemAmount * ((item.taxPercent || 0) / 100);
      return sum + taxAmount;
    }, 0);
  };

  const calculateTotal = () => {
    const otherFeesAmount = otherFees?.amount || 0;
    return calculateSubtotal() + calculateTax() + otherFeesAmount;
  };

  return (
    <div className="w-64 space-y-2">
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium text-gray-800">
          {formatCurrency(calculateSubtotal())}
        </span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">Tax</span>
        <span className="font-medium text-gray-800">
          {formatCurrency(calculateTax())}
        </span>
      </div>
      {otherFees?.amount !== undefined && otherFees.amount > 0 && (
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-600">Other Fees</span>
          <span className="font-medium text-gray-800">{formatCurrency(otherFees.amount || 0)}</span>
        </div>
      )}
      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
        <span className="text-gray-700 font-bold text-xs">Total</span>
        <span className="font-semibold text-gray-600">
          {formatCurrency(calculateTotal())}
        </span>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
        <span className="text-gray-700 font-bold text-xs">Balance due</span>
        <span className="font-bold text-black">
          {formatCurrency(calculateTotal())}
        </span>
      </div>
    </div>
  );
};