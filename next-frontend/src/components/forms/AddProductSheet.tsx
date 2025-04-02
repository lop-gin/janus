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
      <SheetContent className="w-[600px] max-w-[50%] p-6 overflow-y-auto bg-white">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold text-gray-900">Add New Product</SheetTitle>
          <SheetDescription className="text-gray-700">Enter the product details below.</SheetDescription>
        </SheetHeader>
        
        {/* Basic Information Section */}
        <div className="space-y-5">
          <div>
            <h3 className="text-md font-medium mb-3 text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Product Name *</Label>
                <Input
                  id="name"
                  className="mt-1"
                  value={newProduct.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sku" className="text-sm font-medium text-gray-700">SKU</Label>
                <Input
                  id="sku"
                  className="mt-1"
                  value={newProduct.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                />
              </div>
            </div>
            
            <div className="mt-3">
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
              <Select
                onValueChange={(value) => {
                  if (value === "add-new") setIsCategoryPopupOpen(true);
                  else handleInputChange("category_id", parseInt(value));
                }}
              >
                <SelectTrigger className="mt-1">
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
                <div className="mt-3 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <h4 className="text-sm font-medium mb-2 text-gray-800">New Category</h4>
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
                  <div className="mt-3 flex gap-2">
                    <Button onClick={handleAddCategory} size="sm">Save</Button>
                    <Button variant="outline" size="sm" onClick={() => setIsCategoryPopupOpen(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Separator className="my-5 bg-gray-200" />
          
          {/* Units of Measure Section */}
          <div>
            <h3 className="text-md font-medium mb-3 text-gray-900">Units of Measure</h3>
            
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="primary_unit_of_measure" className="text-sm font-medium text-gray-700">Primary Unit *</Label>
                <Popover>
                  <PopoverTrigger><HelpCircle className="h-4 w-4 text-gray-500" /></PopoverTrigger>
                  <PopoverContent>
                    The primary unit is the main unit of measure for this product (e.g., "ea" for each).
                  </PopoverContent>
                </Popover>
              </div>
              <Input
                id="primary_unit_of_measure"
                className="mt-1"
                value={newProduct.primary_unit_of_measure}
                onChange={(e) => handleInputChange("primary_unit_of_measure", e.target.value)}
              />
            </div>
            
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="secondary_unit_of_measure" className="text-sm font-medium text-gray-700">Secondary Unit</Label>
                <Popover>
                  <PopoverTrigger><HelpCircle className="h-4 w-4 text-gray-500" /></PopoverTrigger>
                  <PopoverContent>
                    The secondary unit is an optional alternative unit (e.g., "box" if primary is "ea").
                  </PopoverContent>
                </Popover>
              </div>
              <Input
                id="secondary_unit_of_measure"
                className="mt-1"
                value={newProduct.secondary_unit_of_measure}
                onChange={(e) => handleInputChange("secondary_unit_of_measure", e.target.value)}
              />
            </div>
            
            {newProduct.secondary_unit_of_measure && (
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="conversion_factor" className="text-sm font-medium text-gray-700">Conversion Factor *</Label>
                  <Popover>
                    <PopoverTrigger><HelpCircle className="h-4 w-4 text-gray-500" /></PopoverTrigger>
                    <PopoverContent>
                      The number of primary units that make up one secondary unit (e.g., 10 ea = 1 box, enter 10).
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  id="conversion_factor"
                  type="number"
                  className="mt-1"
                  value={newProduct.conversion_factor}
                  onChange={(e) => handleInputChange("conversion_factor", parseFloat(e.target.value) || 1)}
                />
              </div>
            )}
          </div>
          
          <Separator className="my-5 bg-gray-200" />
          
          {/* Quantity & Pricing Section */}
          <div>
            <h3 className="text-md font-medium mb-3 text-gray-900">Quantity & Pricing</h3>
            
            <Label className="text-sm font-medium text-gray-700">Select Unit</Label>
            <Select onValueChange={setSelectedUnit} defaultValue="primary">
              <SelectTrigger className="mt-1 mb-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="initial_quantity" className="text-sm font-medium text-gray-700">Initial Quantity</Label>
                <Input
                  id="initial_quantity"
                  type="number"
                  className="mt-1"
                  value={newProduct.initial_quantity}
                  onChange={(e) => handleInputChange("initial_quantity", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="as_of_date" className="text-sm font-medium text-gray-700">As of Date</Label>
                <Input
                  id="as_of_date"
                  type="date"
                  className="mt-1"
                  value={newProduct.as_of_date}
                  onChange={(e) => handleInputChange("as_of_date", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="reorder_point" className="text-sm font-medium text-gray-700">Reorder Point</Label>
                <Input
                  id="reorder_point"
                  type="number"
                  className="mt-1"
                  value={newProduct.reorder_point}
                  onChange={(e) => handleInputChange("reorder_point", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sale_price" className="text-sm font-medium text-gray-700">Sale Price</Label>
                <Input
                  id="sale_price"
                  type="number"
                  className="mt-1"
                  value={newProduct.sale_price}
                  onChange={(e) => handleInputChange("sale_price", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="purchase_price" className="text-sm font-medium text-gray-700">Purchase Price</Label>
                <Input
                  id="purchase_price"
                  type="number"
                  className="mt-1"
                  value={newProduct.purchase_price}
                  onChange={(e) => handleInputChange("purchase_price", e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Button onClick={handleAddNewProduct} className="w-full">Save Product</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};