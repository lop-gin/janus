
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface ActionCellProps {
  onRemove: () => void;
}

export const ActionCell: React.FC<ActionCellProps> = ({ onRemove }) => {
  return (
    <td className="py-1 text-center">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 p-0 text-gray-500"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </td>
  );
};
