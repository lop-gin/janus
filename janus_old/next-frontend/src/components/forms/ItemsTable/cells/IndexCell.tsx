
import React, { memo } from "react";

interface IndexCellProps {
  index: number;
}

export const IndexCell: React.FC<IndexCellProps> = memo(({ index }) => {
  return (
    <td className="text-center py-1 text-gray-500 w-8 border-r border-gray-300">
      {index + 1}
    </td>
  );
});

IndexCell.displayName = "IndexCell";
