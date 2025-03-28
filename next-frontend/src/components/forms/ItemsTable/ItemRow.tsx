
import React from "react";
import { DocumentItem } from "@/types/document";
import { cn } from "@/lib/utils";
import { IndexCell } from "./cells/IndexCell";
import { SelectCell } from "./cells/SelectCell";
import { TextCell } from "./cells/TextCell";
import { NumberCell } from "./cells/NumberCell";
import { TotalCell } from "./cells/TotalCell";
import { ActionCell } from "./cells/ActionCell";

interface ItemRowProps {
  item: DocumentItem;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<DocumentItem>) => void;
  onRemove: () => void;
}

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
}) => {
  const handleInputChange = (field: keyof DocumentItem, value: string | number) => {
    // For number fields, convert the string value to a number
    if (field === "quantity" || field === "rate" || field === "taxPercent" || field === "unitPrice") {
      onUpdate({ [field]: value === "" ? undefined : parseFloat(value as string) || 0 });
    } else {
      onUpdate({ [field]: value });
    }
  };

  // Category options
  const categoryOptions = [
    { value: "category1", label: "Category 1" },
    { value: "category2", label: "Category 2" },
    { value: "category3", label: "Category 3" },
  ];

  // Product options
  const productOptions = [
    { value: "product1", label: "Product 1" },
    { value: "product2", label: "Product 2" },
    { value: "service1", label: "Service 1" },
    { value: "Website Design", label: "Website Design" },
    { value: "SEO Setup", label: "SEO Setup" },
    { value: "Content Writing", label: "Content Writing" },
    { value: "Email Marketing", label: "Email Marketing" },
  ];

  // Unit options
  const unitOptions = [
    { value: "ea", label: "Each" },
    { value: "hr", label: "Hour" },
    { value: "kg", label: "Kilogram" },
  ];

  return (
    <tr 
      className={cn(
        "border-b hover:bg-gray-50 transition-colors",
        isSelected ? "bg-blue-50" : ""
      )}
      onClick={onSelect}
    >
      <IndexCell index={index} />
      
      <td className="py-1 px-0.5 border-r border-gray-300 text-black">
        <SelectCell 
          value={item.category || ""}
          onChange={(value) => handleInputChange("category", value)}
          options={categoryOptions}
          isEditing={isSelected}
          onFocus={onSelect}
        />
      </td>
      
      <td className="py-1 px-0.5 border-r border-gray-300 text-black">
        <SelectCell 
            value={item.product || ""}
            onChange={(value) => {
            onUpdate({ 
                product: value, 
                customerproduct: value 
            });
            }}
            options={productOptions}
            isEditing={isSelected}
            onFocus={onSelect}
        />
      </td>

      <td className="py-1 px-0.5 border-r border-gray-300 text-black">
        <TextCell 
            value={item.customerproduct || ""}
            onChange={(value) => handleInputChange("customerproduct", value)}
            isEditing={isSelected}
            onFocus={onSelect}
        />
      </td>
      
      <td className="py-1 px-0.5 border-r border-gray-300 text-black">
        <TextCell 
          value={item.description || ""}
          onChange={(value) => handleInputChange("description", value)}
          isEditing={isSelected}
          onFocus={onSelect}
        />
      </td>
      
      <td className="py-1 px-0.5 border-r border-gray-300 text-black">
        <NumberCell 
          value={item.quantity}
          onChange={(value) => handleInputChange("quantity", value)}
          isEditing={isSelected}
          onFocus={onSelect}
        />
      </td>
      
      <td className="py-1 px-0.5 border-r border-gray-300 text-right text-black">
        <SelectCell 
          value={item.unit || ""}
          onChange={(value) => handleInputChange("unit", value)}
          options={unitOptions}
          isEditing={isSelected}
          onFocus={onSelect}
        />
      </td>
      
      <td className="py-1 px-0.5 border-r border-gray-300 text-black">
        <NumberCell 
          value={item.unitPrice}
          onChange={(value) => handleInputChange("unitPrice", value)}
          isEditing={isSelected}
          onFocus={onSelect}
          isCurrency={true}
        />
      </td>
      
      <td className="py-1 px-0.5 border-r border-gray-300 text-black">
        <NumberCell 
          value={item.taxPercent}
          onChange={(value) => handleInputChange("taxPercent", value)}
          isEditing={isSelected}
          onFocus={onSelect}
          isPercentage={true}
        />
      </td>
      
      <TotalCell 
        quantity={item.quantity}
        unitPrice={item.unitPrice}
        taxPercent={item.taxPercent}
      />
      
      <ActionCell onRemove={onRemove} />
    </tr>
  );
};
