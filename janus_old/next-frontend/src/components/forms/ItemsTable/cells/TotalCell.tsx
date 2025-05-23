
import React from "react";
import { formatCurrency } from "@/lib/document-utils";

interface TotalCellProps {
  quantity: number | undefined;
  unitPrice: number | undefined;
  taxPercent: number | undefined;
}

export const TotalCell: React.FC<TotalCellProps> = ({
  quantity,
  unitPrice,
  taxPercent,
}) => {
  const total = (quantity || 0) * (unitPrice || 0) * (1 + ((taxPercent || 0) / 100));
  
  return (
    <td className="py-1 text-right px-1 border-r border-gray-300 text-black">
      {formatCurrency(total)}
    </td>
  );
};
