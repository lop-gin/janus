// src/components/forms/AddProductSheet.tsx
"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateField } from "@/components/forms/DateFields";

// **Interfaces**
// Define props and state types for better type safety and clarity
interface AddProductSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProductAdded: (product: any) => void;
}

interface ProductFormData {
  name: string;
  sku: string;
  category_id: number | null;
  description: string;
  primary_unit_of_measure: string;
  secondary_unit_of_measure: string;
  conversion_factor: number;
  default_tax_percent: number;
  initial_quantity: number;
  as_of_date: string;
  reorder_point: string;
  sale_price: string;
  purchase_price: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface Category {
  id: number;
  name: string;
}

// **Component**
export const AddProductSheet: React.FC<AddProductSheetProps> = ({
  isOpen,
  onOpenChange,
  onProductAdded,
}) => {
  // **State Management**
  // Centralized state for form data with initial values
  const [formData, setFormData] = useState<ProductFormData>({
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

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<"primary" | "secondary">("primary");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  // **Effects**
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("http://127.0.0.1:8000/categories", {
          headers: { Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}` },
        });
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // **Handlers**
  // Generalized input change handler
  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validate required fields before submission
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.primary_unit_of_measure.trim())
      newErrors.primary_unit_of_measure = "Primary unit is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (formData.secondary_unit_of_measure && !formData.conversion_factor)
      newErrors.conversion_factor = "Conversion factor is required with secondary unit";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Prepare data for backend, converting empty strings to null for optional fields
  const prepareProductData = (data: ProductFormData) => {
    const prepared: any = { ...data };
    const optionalFloatFields = [
      "reorder_point",
      "sale_price",
      "purchase_price",
      "conversion_factor",
      "default_tax_percent",
      "initial_quantity",
    ];

    optionalFloatFields.forEach((field) => {
      if (prepared[field] === "") {
        prepared[field] = null;
      } else if (typeof prepared[field] === "string") {
        prepared[field] = parseFloat(prepared[field]);
      }
    });

    if (prepared.as_of_date === "") prepared.as_of_date = null;
    return prepared;
  };

  // Add new category and update form
  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }
    try {
      const response = await api.post(
        "http://127.0.0.1:8000/categories",
        newCategory,
        { headers: { Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}` } }
      );
      const addedCategory = response.data;
      setCategories((prev) => [...prev, addedCategory]);
      handleInputChange("category_id", addedCategory.id);
      setIsCategoryPopupOpen(false);
      setNewCategory({ name: "", description: "" });
    } catch (error) {
      console.error("Failed to add category", error);
      toast.error("Failed to add category");
    }
  };

  const handleUnitChange = (value: string) => {
    if (value === 'primary' || value === 'secondary') {
      setSelectedUnit(value);
    }
  };

  // Handle form submission
  const handleSubmit = async (closeAfterSave: boolean = true) => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    let data = prepareProductData(formData);

    // Adjust values based on selected unit
    if (selectedUnit === "secondary" && data.conversion_factor) {
      data.initial_quantity = (data.initial_quantity || 0) * data.conversion_factor;
      if (data.reorder_point !== null) {
        data.reorder_point *= data.conversion_factor;
      }
      if (data.sale_price !== null) {
        data.sale_price /= data.conversion_factor;
      }
      if (data.purchase_price !== null) {
        data.purchase_price /= data.conversion_factor;
      }
    }

    try {
      const response = await api.post("http://127.0.0.1:8000/products", data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}` },
      });
      onProductAdded(response.data);
      resetForm();
      if (closeAfterSave) onOpenChange(false);
      toast.success("Product added successfully");
    } catch (error) {
      console.error("Failed to add product", error);
      toast.error("Failed to add product. Please try again.");
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
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
    setErrors({});
  };

  // **Render**
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="!max-w-none flex flex-col h-full p-0"
        style={{ width: "40vw", backgroundColor: "white" }}
      >
        {/* Header */}
        <div className="flex-none border-b border-gray-200 p-2">
          <SheetHeader className="relative">
            <SheetTitle className="text-2xl font-bold text-gray-900">
              Add New Product
            </SheetTitle>
            <SheetClose className="absolute right-0 top-0">
              <X className="h-5 w-5 text-gray-700" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </SheetHeader>
        </div>

        {/* Form Content */}
        <div className="flex-grow overflow-y-auto p-9 bg-gray-50 space-y-5">
          {/* Basic Information */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 border-blue-200">
              Basic Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  className={cn("mt-1", errors.name && "border-red-500")}
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  className="mt-1"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category *</Label>
                <div className="flex items-center gap-2">
                    <Select
                    value={formData.category_id ? formData.category_id.toString() : ""}
                    onValueChange={(value) => {
                        if (value) {
                        handleInputChange("category_id", parseInt(value));
                        }
                    }}
                    >
                    <SelectTrigger className={cn("mt-1 flex-grow", errors.category_id && "border-red-500")}>
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCategoryPopupOpen(true)}
                    className="mt-1 bg-white text-gray-800 hover:bg-gray-300"
                    >
                    Add New
                    </Button>
                </div>
                {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id}</p>}
                
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
                        <Button onClick={handleAddCategory} size="sm" className="bg-green-600 hover:bg-green-700">Save</Button>
                        <Button
                        variant="outline"
                        size="sm"
                        className="text-gray-900 bg-gray-300 hover:bg-gray-900 hover:text-gray-100"
                        onClick={() => {
                            setIsCategoryPopupOpen(false);
                            setNewCategory({ name: "", description: "" });
                        }}
                        >
                        Cancel
                        </Button>
                    </div>
                    </div>
                )}
                </div>
            </div>
          </section>

          <Separator className="my-5 bg-gray-200" />

          {/* Units of Measure */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 border-blue-200">
              Units of Measure
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="primary_unit_of_measure">Primary Unit *</Label>
                  <Popover>
                    <PopoverTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-500" />
                    </PopoverTrigger>
                    <PopoverContent>
                      The primary unit is the smallest unit of measure (e.g., pieces).
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  id="primary_unit_of_measure"
                  className={cn("mt-1", errors.primary_unit_of_measure && "border-red-500")}
                  value={formData.primary_unit_of_measure}
                  onChange={(e) =>
                    handleInputChange("primary_unit_of_measure", e.target.value)
                  }
                />
                {errors.primary_unit_of_measure && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.primary_unit_of_measure}
                  </p>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="secondary_unit_of_measure">Secondary Unit</Label>
                  <Popover>
                    <PopoverTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-500" />
                    </PopoverTrigger>
                    <PopoverContent>
                      Optional alternative unit (e.g., dozens, box).
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  id="secondary_unit_of_measure"
                  className="mt-1"
                  value={formData.secondary_unit_of_measure}
                  onChange={(e) =>
                    handleInputChange("secondary_unit_of_measure", e.target.value)
                  }
                />
              </div>
            </div>
            {formData.secondary_unit_of_measure && (
              <div className="flex flex-col items-center mb-3">
                <div className="w-1/2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="conversion_factor">Conversion Factor *</Label>
                    <Popover>
                      <PopoverTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-500" />
                      </PopoverTrigger>
                      <PopoverContent>
                        Number of primary units per secondary unit (e.g., 10 pieces = 1 box).
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Input
                    id="conversion_factor"
                    type="number"
                    className={cn(
                      "mt-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                      errors.conversion_factor && "border-red-500"
                    )}
                    value={formData.conversion_factor}
                    onChange={(e) =>
                      handleInputChange(
                        "conversion_factor",
                        parseFloat(e.target.value) || 1
                      )
                    }
                  />
                  {errors.conversion_factor && (
                    <p className="text-red-500 text-xs mt-1">{errors.conversion_factor}</p>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600 italic">
                  {formData.conversion_factor} {formData.primary_unit_of_measure} = 1{" "}
                  {formData.secondary_unit_of_measure}
                </div>
              </div>
            )}
          </section>

          <Separator className="my-5 bg-gray-200" />

          {/* Quantity & Pricing */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 border-blue-200">
              Quantity & Pricing
            </h3>
            <div className="mb-4 p-3 bg-blue-100 rounded-md">
              <p className="text-sm text-gray-800">
                <strong>Note:</strong> Values are interpreted in{" "}
                {selectedUnit === "secondary" && formData.secondary_unit_of_measure
                  ? formData.secondary_unit_of_measure
                  : formData.primary_unit_of_measure || "primary"}{" "}
                units.
              </p>
            </div>
            <Label>Select Unit of Measure</Label>
            <Select onValueChange={handleUnitChange} defaultValue="primary">
              <SelectTrigger className="mt-1 mb-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">
                  {formData.primary_unit_of_measure || "Primary"}
                </SelectItem>
                {formData.secondary_unit_of_measure && (
                  <SelectItem value="secondary">
                    {formData.secondary_unit_of_measure}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="initial_quantity">
                  Initial Quantity (
                  {selectedUnit === "secondary" && formData.secondary_unit_of_measure
                    ? formData.secondary_unit_of_measure
                    : formData.primary_unit_of_measure || "primary units"}
                  )
                </Label>
                <Input
                  id="initial_quantity"
                  type="number"
                  className="mt-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.initial_quantity}
                  onChange={(e) =>
                    handleInputChange("initial_quantity", parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div>
                <DateField
                  label="As of Date"
                  date={formData.as_of_date ? new Date(formData.as_of_date) : new Date()}
                  onDateChange={(date) =>
                    handleInputChange("as_of_date", format(date, "yyyy-MM-dd"))
                  }
                />
              </div>
              <div>
                <Label htmlFor="reorder_point">
                  Reorder Point (
                  {selectedUnit === "secondary" && formData.secondary_unit_of_measure
                    ? formData.secondary_unit_of_measure
                    : formData.primary_unit_of_measure || "primary units"}
                  )
                </Label>
                <Input
                  id="reorder_point"
                  type="number"
                  className="mt-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.reorder_point}
                  onChange={(e) => handleInputChange("reorder_point", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sale_price">
                  Sale Price (
                  {selectedUnit === "secondary" && formData.secondary_unit_of_measure
                    ? `per ${formData.secondary_unit_of_measure}`
                    : `per ${formData.primary_unit_of_measure || "primary unit"}`}
                  )
                </Label>
                <Input
                  id="sale_price"
                  type="number"
                  className="mt-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.00"
                  value={formData.sale_price}
                  onChange={(e) => handleInputChange("sale_price", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="purchase_price">
                  Purchase Price (
                  {selectedUnit === "secondary" && formData.secondary_unit_of_measure
                    ? `per ${formData.secondary_unit_of_measure}`
                    : `per ${formData.primary_unit_of_measure || "primary unit"}`}
                  )
                </Label>
                <Input
                  id="purchase_price"
                  type="number"
                  className="mt-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0.00"
                  value={formData.purchase_price}
                  onChange={(e) => handleInputChange("purchase_price", e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex-none border-t border-gray-200 p-3 bg-white">
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => handleSubmit(false)}
              className="rounded-xl bg-white hover:bg-gray-100"
            >
              Save and New
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              className="bg-green-600 rounded-xl hover:bg-green-700"
            >
              Save and Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};