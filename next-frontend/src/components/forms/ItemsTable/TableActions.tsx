
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TableActionsProps {
  onAddItem: () => void;
  onClearItems: () => void;
}

export const TableActions: React.FC<TableActionsProps> = ({
  onAddItem,
  onClearItems,
}) => {
  const handleAddItem = () => {
    onAddItem();
    toast.success("New line added");
  };

  const handleClearItems = () => {
    if (window.confirm("Are you sure you want to clear all lines?")) {
      onClearItems();
      toast.success("All lines cleared");
    }
  };

  return (
    <div className="mt-4 flex space-x-2">
      <Button
        variant="outline"
        className="text-gray-700 border-gray-300 h-7 text-xs bg-white"
        onClick={handleAddItem}
      >
        <Plus className="mr-1 h-3 w-3" />
        Add lines
      </Button>
      <Button
        variant="outline"
        className="text-gray-700 border-gray-300 h-7 text-xs bg-white"
        onClick={handleClearItems}
      >
        <Trash2 className="mr-1 h-3 w-3" />
        Clear all lines
      </Button>
    </div>
  );
};
