
import React, { useState, useEffect } from "react";
import { DocumentItem, OtherFees } from "@/types/document";
import { Separator } from "@/components/ui/separator";
import { TableHeader } from "./TableHeader";
import { ItemRow } from "./ItemRow";
import { TableActions } from "./TableActions";
import { OtherFees as OtherFeesComponent } from "./OtherFees";
import { DocumentSummary } from "./DocumentSummary";

interface ItemsTableProps {
  items: DocumentItem[];
  addItem: () => void;
  updateItem: (itemId: string, updates: Partial<DocumentItem>) => void;
  removeItem: (itemId: string) => void;
  clearAllItems: () => void;
  otherFees: OtherFees;
  updateOtherFees: (updates: Partial<OtherFees>) => void;
}

export const ItemsTable: React.FC<ItemsTableProps> = ({
  items,
  addItem,
  updateItem,
  removeItem,
  clearAllItems,
  otherFees,
  updateOtherFees
}) => {
  // Track the currently selected row
  const [selectedRow, setSelectedRow] = useState<string | null>(
    items.length > 0 ? items[0].id : null
  );

  // Update selectedRow when items change (e.g., when items are auto-populated)
  useEffect(() => {
    if (items.length > 0 && !items.some(item => item.id === selectedRow)) {
      setSelectedRow(items[0].id);
    }
  }, [items, selectedRow]);

  return (
    <div className="mt-4 pb-4">
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 bg-white">
          <thead>
            <TableHeader />
          </thead>
          <tbody>
            {items.map((item, index) => (
              <ItemRow
                key={item.id}
                item={item}
                index={index}
                isSelected={selectedRow === item.id}
                onSelect={() => setSelectedRow(item.id)}
                onUpdate={(updates) => updateItem(item.id, updates)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      <TableActions 
        onAddItem={addItem}
        onClearItems={clearAllItems}
      />
      
      <Separator className="mt-4 mb-4 w-full bg-gray-300" />
      
      <div className="flex justify-between mb-8">
        <OtherFeesComponent 
          otherFees={otherFees}
          updateOtherFees={updateOtherFees}
        />
        
        <DocumentSummary 
          items={items}
          otherFees={otherFees}
        />
      </div>
    </div>
  );
};
