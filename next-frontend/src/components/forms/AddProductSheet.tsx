// src/components/forms/AddProductSheet.tsx
"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { HelpCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface AddProductSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded: (product: any) => void;
}

export const AddProductSheet: React.FC<AddProductSheetProps> = ({
  isOpen,
  onOpenChange,
  onProductAdded,
}) => {
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category_id: null as number | null,
    description: "",
    primary_unit_of_measure: "",
    secondary_unit_of_measure: "",
    conversion_factor: 1,
    default_tax_percent: 0,
    initial_quantity: 0,
    as_of_date: "",
    reorder_point: "",
    sale_price: "",
    purchase_price: "",
  });
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [selectedUnit, setSelectedUnit] = useState("primary");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("http://127.0.0.1:8000/categories", {
          headers: { Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}` },
        });
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setNewProduct({ ...newProduct, [field]: value });
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
        alert("Category name cannot be empty");
        return;
    }
    try {
        const response = await api.post(
            "http://127.0.0.1:8000/categories",
            newCategory,
            { headers: { Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}` } }
        );
        const addedCategory = response.data;
        setCategories([...categories, addedCategory]);
        setNewProduct({ ...newProduct, category_id: addedCategory.id });
        setIsCategoryPopupOpen(false);
        setNewCategory({ name: "", description: "" });
    } catch (error) {
        console.error("Failed to add category", error);
    }
  };

  const handleAddNewProduct = async () => {
    let data = { ...newProduct };
    if (selectedUnit === "secondary" && newProduct.conversion_factor) {
      data.initial_quantity = newProduct.initial_quantity * newProduct.conversion_factor;
      data.reorder_point = newProduct.reorder_point ? parseFloat(newProduct.reorder_point) * newProduct.conversion_factor : "";
      data.sale_price = newProduct.sale_price ? parseFloat(newProduct.sale_price) / newProduct.conversion_factor : "";
      data.purchase_price = newProduct.purchase_price ? parseFloat(newProduct.purchase_price) / newProduct.conversion_factor : "";
    }
    try {
      const response = await api.post(
        "http://127.0.0.1:8000/products",
        data,
        { headers: { Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}` } }
      );
      onProductAdded(response.data);
      setNewProduct({
        name: "",
        sku: "",
        category_id: null,
        description: "",
        primary_unit_of_measure: "",
        secondary_unit_of_measure: "",
        conversion_factor: 1,
        default_tax_percent: 0,
        initial_quantity: 0,
        as_of_date: "",
        reorder_point: "",
        sale_price: "",
        purchase_price: "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add product", error);
    }
  };

  const unitOptions = [
    { value: "primary", label: newProduct.primary_unit_of_measure || "Primary" },
    newProduct.secondary_unit_of_measure && { value: "secondary", label: newProduct.secondary_unit_of_measure },
  ].filter(Boolean);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-1/3 p-6 bg-white">
        <SheetHeader>
          <SheetTitle>Add New Product</SheetTitle>
          <SheetDescription>Enter the product details below.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={newProduct.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              onValueChange={(value) => {
                if (value === "add-new") setIsCategoryPopupOpen(true);
                else handleInputChange("category_id", parseInt(value));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add-new">Add New</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isCategoryPopupOpen && (
              <div className="mt-2 p-3 border rounded">
                <Input
                  placeholder="Category Name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
                <Input
                  className="mt-2"
                  placeholder="Description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
                <div className="mt-2 flex gap-2">
                  <Button onClick={handleAddCategory}>Save</Button>
                  <Button variant="outline" onClick={() => setIsCategoryPopupOpen(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
          <Separator />
          <div>
            <div className="flex items-center gap-2">
              <Label htmlFor="primary_unit_of_measure">Primary Unit *</Label>
              <Popover>
                <PopoverTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></PopoverTrigger>
                <PopoverContent>
                  The primary unit is the main unit of measure for this product (e.g., "ea" for each).
                </PopoverContent>
              </Popover>
            </div>
            <Input
              id="primary_unit_of_measure"
              value={newProduct.primary_unit_of_measure}
              onChange={(e) => handleInputChange("primary_unit_of_measure", e.target.value)}
            />
            <div className="flex items-center gap-2 mt-2">
              <Label htmlFor="secondary_unit_of_measure">Secondary Unit</Label>
              <Popover>
                <PopoverTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></PopoverTrigger>
                <PopoverContent>
                  The secondary unit is an optional alternative unit (e.g., "box" if primary is "ea").
                </PopoverContent>
              </Popover>
            </div>
            <Input
              id="secondary_unit_of_measure"
              value={newProduct.secondary_unit_of_measure}
              onChange={(e) => handleInputChange("secondary_unit_of_measure", e.target.value)}
            />
            {newProduct.secondary_unit_of_measure && (
              <div className="flex items-center gap-2 mt-2">
                <Label htmlFor="conversion_factor">Conversion Factor *</Label>
                <Popover>
                  <PopoverTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></PopoverTrigger>
                  <PopoverContent>
                    The number of primary units that make up one secondary unit (e.g., 10 ea = 1 box, enter 10).
                  </PopoverContent>
                </Popover>
              </div>
            )}
            {newProduct.secondary_unit_of_measure && (
              <Input
                id="conversion_factor"
                type="number"
                value={newProduct.conversion_factor}
                onChange={(e) => handleInputChange("conversion_factor", parseFloat(e.target.value) || 1)}
              />
            )}
          </div>
          <Separator />
          <div>
            <Label>Quantity & Pricing</Label>
            <Select onValueChange={setSelectedUnit} defaultValue="primary">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2">
              <Label htmlFor="initial_quantity">Initial Quantity</Label>
              <Input
                id="initial_quantity"
                type="number"
                value={newProduct.initial_quantity}
                onChange={(e) => handleInputChange("initial_quantity", parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="mt-2">
              <Label htmlFor="as_of_date">As of Date</Label>
              <Input
                id="as_of_date"
                type="date"
                value={newProduct.as_of_date}
                onChange={(e) => handleInputChange("as_of_date", e.target.value)}
              />
            </div>
            <div className="mt-2">
              <Label htmlFor="reorder_point">Reorder Point</Label>
              <Input
                id="reorder_point"
                type="number"
                value={newProduct.reorder_point}
                onChange={(e) => handleInputChange("reorder_point", e.target.value)}
              />
            </div>
            <div className="mt-2">
              <Label htmlFor="sale_price">Sale Price</Label>
              <Input
                id="sale_price"
                type="number"
                value={newProduct.sale_price}
                onChange={(e) => handleInputChange("sale_price", e.target.value)}
              />
            </div>
            <div className="mt-2">
              <Label htmlFor="purchase_price">Purchase Price</Label>
              <Input
                id="purchase_price"
                type="number"
                value={newProduct.purchase_price}
                onChange={(e) => handleInputChange("purchase_price", e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleAddNewProduct}>Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};