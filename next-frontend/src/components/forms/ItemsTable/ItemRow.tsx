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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  default_unit_price: number;
  primary_unit_of_measure: string;
  secondary_unit_of_measure: string | null;
  default_tax_percent: number;
  category_id: number | null;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    default_unit_price: 0,
    primary_unit_of_measure: "",
    secondary_unit_of_measure: "",
    conversion_factor: 1,
    default_tax_percent: 0,
    category_id: null,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("http://127.0.0.1:8000/products", {
          headers: { Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}` },
        });
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      }
    };
    fetchProducts();
  }, []);

  const selectedProduct = products.find((p) => p.id.toString() === item.product);

  const handleProductChange = (value: string) => {
    if (value === "add-new") {
      setIsDialogOpen(true);
    } else {
      const product = products.find((p) => p.id.toString() === value);
      if (product) {
        onUpdate({
          product: value,
          unit: product.primary_unit_of_measure,
          unitPrice: product.default_unit_price || 0,
          taxPercent: product.default_tax_percent || 0,
          amount: (item.quantity || 1) * (product.default_unit_price || 0),
        });
      }
    }
  };

  const handleAddNewProduct = async () => {
    try {
      const response = await api.post(
        "http://127.0.0.1:8000/products",
        newProduct,
        { headers: { Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}` } }
      );
      const addedProduct = response.data;
      setProducts([...products, addedProduct]);
      setIsDialogOpen(false);
      handleProductChange(addedProduct.id.toString());
      setNewProduct({
        name: "",
        description: "",
        default_unit_price: 0,
        primary_unit_of_measure: "",
        secondary_unit_of_measure: "",
        conversion_factor: 1,
        default_tax_percent: 0,
        category_id: null,
      });
    } catch (error) {
      console.error("Failed to add product", error);
    }
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

  // Placeholder for category options (fetch from backend if needed)
  const categoryOptions = []; // Replace with API call if categories exist

  return (
    <tr
      className={cn("border-b hover:bg-gray-50 transition-colors", isSelected ? "bg-blue-50" : "")}
      onClick={onSelect}
    >
      <IndexCell index={index} />
      <td className="py-1 px-0.5 border-r border-gray-300 text-black">
        <SelectCell
          value={item.category || ""}
          onChange={(value) => onUpdate({ category: value })}
          options={categoryOptions}
          isEditing={isSelected}
          onFocus={onSelect}
        />
      </td>
      <td className="py-1 px-0.5 border-r border-gray-300 text-black">
        <SelectCell
          value={item.product || ""}
          onChange={handleProductChange}
          options={[
            { value: "add-new", label: "Add New" },
            ...products.map((p) => ({ value: p.id.toString(), label: p.name })),
          ]}
          isEditing={isSelected}
          onFocus={onSelect}
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <Input
              placeholder="Description"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Unit Price"
              value={newProduct.default_unit_price || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, default_unit_price: parseFloat(e.target.value) || 0 })
              }
            />
            <Input
              placeholder="Primary Unit (e.g., ea)"
              value={newProduct.primary_unit_of_measure}
              onChange={(e) =>
                setNewProduct({ ...newProduct, primary_unit_of_measure: e.target.value })
              }
            />
            <Input
              placeholder="Secondary Unit (optional)"
              value={newProduct.secondary_unit_of_measure}
              onChange={(e) =>
                setNewProduct({ ...newProduct, secondary_unit_of_measure: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Tax Percent"
              value={newProduct.default_tax_percent || ""}
              onChange={(e) =>
                setNewProduct({ ...newProduct, default_tax_percent: parseFloat(e.target.value) || 0 })
              }
            />
            <Button onClick={handleAddNewProduct}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </tr>
  );
};