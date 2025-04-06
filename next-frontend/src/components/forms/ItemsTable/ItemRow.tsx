// src/components/forms/ItemsTable/ItemRow.tsx
import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { DocumentItem } from "@/types/document";
import { cn } from "@/lib/utils";
import { IndexCell } from "./cells/IndexCell";
import { SelectCell } from "./cells/SelectCell";
import { TextCell } from "./cells/TextCell";
import { NumberCell } from "./cells/NumberCell";
import { TotalCell } from "./cells/TotalCell";
import { ActionCell } from "./cells/ActionCell";
import { AddProductSheet } from "../AddProductSheet";

interface ItemRowProps {
  item: DocumentItem;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<DocumentItem>) => void;
  onRemove: () => void;
}

interface Product {
  id: number;
  name: string;
  description: string;
  sale_price: number;
  primary_unit_of_measure: string;
  secondary_unit_of_measure: string | null;
  default_tax_percent: number;
  category_id: number | null;
}

interface Category {
  id: number;
  name: string;
  description: string | null;
}

export const ItemRow: React.FC<ItemRowProps> = ({
  item,
  index,
  isSelected,
  onSelect,
  onUpdate,
  onRemove,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get("http://127.0.0.1:8000/products", {
            headers: { Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}` },
          }),
          api.get("http://127.0.0.1:8000/categories", {
            headers: { Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}` },
          }),
        ]);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  // Calculate selected category and product for display
  const selectedCategory = categories.find((cat) => cat.id.toString() === item.category);
  const selectedProduct = products.find((p) => p.id.toString() === item.product);

  const handleProductChange = (value: string) => {
    if (value === "add-new") {
      setIsSheetOpen(true);
    } else {
      const product = products.find((p) => p.id.toString() === value);
      if (product) {
        const updates = {
          product: value,
          unit: product.primary_unit_of_measure,
          taxPercent: product.default_tax_percent || 0,
          customerproduct: product.name, // Autopopulate with product name
          // Do not set unitPrice or amount
        };
        onUpdate(updates);
      }
    }
  };

  const handleProductAdded = (addedProduct: Product) => {
    // Update products list with the new product
    setProducts([...products, addedProduct]);
    
    // Fetch the latest categories to ensure any new category is included
    const fetchLatestCategories = async () => {
      try {
        const categoriesResponse = await api.get("http://127.0.0.1:8000/categories", {
          headers: { Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}` },
        });
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error("Failed to fetch updated categories", error);
      }
    };
    
    // Fetch latest categories and then update the product selection
    fetchLatestCategories().then(() => {
      handleProductChange(addedProduct.id.toString());
    });
  };

  const unitOptions = selectedProduct
    ? [
        { value: selectedProduct.primary_unit_of_measure, label: selectedProduct.primary_unit_of_measure },
        selectedProduct.secondary_unit_of_measure && {
          value: selectedProduct.secondary_unit_of_measure,
          label: selectedProduct.secondary_unit_of_measure,
        },
      ].filter(Boolean)
    : [];

  const categoryOptions = categories.map((cat) => ({
    value: cat.id.toString(),
    label: cat.name,
  }));

  const filteredProducts = item.category
    ? products.filter((p) => p.category_id?.toString() === item.category)
    : products;

  console.log("Row", index, "isSelected:", isSelected); 

  return (
    <>
      <tr
        className={cn("border-b hover:bg-gray-50 transition-colors", isSelected ? "bg-blue-100" : "")}
        onClick={() => {
          console.log("Row", index, "clicked");
          onSelect();
        }}
      >
        <IndexCell index={index} />
        <td className="py-1 px-0.5 border-r border-gray-300 text-black">
          <SelectCell
            value={item.category || ""}
            onChange={(value) => onUpdate({ category: value })}
            options={categoryOptions}
            isEditing={isSelected}
            onFocus={onSelect}
            displayValue={selectedCategory?.name || ""} // Pass category name
          />
        </td>
        <td className="py-1 px-0.5 border-r border-gray-300 text-black">
          <SelectCell
            value={item.product || ""}
            onChange={handleProductChange}
            options={[
              { value: "add-new", label: "Add New" },
              ...filteredProducts.map((p) => ({ value: p.id.toString(), label: p.name })),
            ]}
            isEditing={isSelected}
            onFocus={() => onSelect}
            displayValue={selectedProduct?.name || ""} // Pass product name
          />
        </td>
        <td className="py-1 px-0.5 border-r border-gray-300 text-black">
          <TextCell
            value={item.customerproduct || ""}
            onChange={(value) => onUpdate({ customerproduct: value })}
            isEditing={isSelected}
            onFocus={onSelect}
          />
        </td>
        <td className="py-1 px-0.5 border-r border-gray-300 text-black">
          <TextCell
            value={item.description || ""}
            onChange={(value) => onUpdate({ description: value })}
            isEditing={isSelected}
            onFocus={onSelect}
          />
        </td>
        <td className="py-1 px-0.5 border-r border-gray-300 text-black">
          <NumberCell
            value={item.quantity}
            onChange={(value) =>
              onUpdate({ quantity: value, amount: value * (item.unitPrice || 0) })
            }
            isEditing={isSelected}
            onFocus={onSelect}
          />
        </td>
        <td className="py-1 px-0.5 border-r border-gray-300 text-right text-black">
          <SelectCell
            value={item.unit || ""}
            onChange={(value) => onUpdate({ unit: value })}
            options={unitOptions}
            isEditing={isSelected}
            onFocus={onSelect}
          />
        </td>
        <td className="py-1 px-0.5 border-r border-gray-300 text-black">
          <NumberCell
            value={item.unitPrice}
            onChange={(value) =>
              onUpdate({ unitPrice: value, amount: (item.quantity || 0) * value })
            }
            isEditing={isSelected}
            onFocus={onSelect}
            isCurrency={true}
          />
        </td>
        <td className="py-1 px-0.5 border-r border-gray-300 text-black">
          <NumberCell
            value={item.taxPercent}
            onChange={(value) => onUpdate({ taxPercent: value })}
            isEditing={isSelected}
            onFocus={onSelect}
            isPercentage={true}
          />
        </td>
        <TotalCell quantity={item.quantity} unitPrice={item.unitPrice} taxPercent={item.taxPercent} />
        <ActionCell onRemove={onRemove} />
      </tr>
      <AddProductSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onProductAdded={handleProductAdded}
      />
    </>
  );
};