// src/components/forms/AddCustomerSheet.tsx
"use client";

import React, { useState } from "react";
import api from "@/lib/api";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface AddCustomerSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerAdded: (customer: {
    id: number;
    name: string;
    company?: string;
    email?: string;
    billing_address: Address;
    initial_balance: number;
  }) => void;
}

interface ValidationErrors {
  [key: string]: string;
}

export const AddCustomerSheet: React.FC<AddCustomerSheetProps> = ({
  isOpen,
  onOpenChange,
  onCustomerAdded,
}) => {
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    company: "",
    email: "",
    billing_address: { street: "", city: "", state: "", zipCode: "", country: "" },
    initial_balance: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleInputChange = (field: string, value: string | number) => {
    if (field.startsWith("billing_address.")) {
      const addressField = field.split(".")[1];
      setNewCustomer({
        ...newCustomer,
        billing_address: { ...newCustomer.billing_address, [addressField]: value },
      });
    } else {
      setNewCustomer({ ...newCustomer, [field]: value });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    if (!newCustomer.name.trim()) newErrors.name = "Name is required";
    if (!newCustomer.email.trim()) newErrors.email = "Email is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddNewCustomer = async (closeAfterSave: boolean = true) => {
    if (!validateForm()) {
      return;
    }
    try {
      const response = await api.post(
        "http://127.0.0.1:8000/customers",
        { ...newCustomer },
        { headers: { Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}` } }
      );
      const addedCustomer = response.data;
      onCustomerAdded(addedCustomer);
      setNewCustomer({
        name: "",
        company: "",
        email: "",
        billing_address: { street: "", city: "", state: "", zipCode: "", country: "" },
        initial_balance: "",
      });
      setErrors({});
      if (closeAfterSave) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Failed to add customer", error);
    }
  };

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
            <SheetTitle className="text-2xl font-bold text-gray-900">Add New Customer</SheetTitle>
            <SheetClose className="absolute right-0 top-0">
              <X className="h-5 w-5 text-gray-700" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </SheetHeader>
        </div>

        {/* Form Content */}
        <div className="flex-grow overflow-y-auto p-9 bg-gray-50 space-y-5">
          {/* Customer Details Section */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 border-blue-200">
              Customer Details
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="Name"
                  value={newCustomer.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={cn(errors.name && "border-red-500")}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Company"
                  value={newCustomer.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  placeholder="Email"
                  value={newCustomer.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={cn(errors.email && "border-red-500")}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="initial_balance">Initial Balance</Label>
                  <Popover>
                    <PopoverTrigger>
                      <HelpCircle className="h-4 w-4 text-gray-500" />
                    </PopoverTrigger>
                    <PopoverContent className="text-gray-500 bg-white">
                      The initial balance is the starting amount owed by or to the customer.
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  id="initial_balance"
                  type="number"
                  placeholder="0.00"
                  value={newCustomer.initial_balance}
                  onChange={(e) => handleInputChange("initial_balance", parseFloat(e.target.value) || 0)}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </section>

          <Separator className="my-5 bg-gray-200" />

          {/* Billing Address Section */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 border-blue-200">
              Billing Address
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  value={newCustomer.billing_address.street}
                  onChange={(e) => handleInputChange("billing_address.street", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={newCustomer.billing_address.city}
                  onChange={(e) => handleInputChange("billing_address.city", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={newCustomer.billing_address.state}
                  onChange={(e) => handleInputChange("billing_address.state", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={newCustomer.billing_address.zipCode}
                  onChange={(e) => handleInputChange("billing_address.zipCode", e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={newCustomer.billing_address.country}
                  onChange={(e) => handleInputChange("billing_address.country", e.target.value)}
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
              onClick={() => handleAddNewCustomer(false)}
              className="border-black rounded-xl bg-white text-black hover:bg-gray-300"
            >
              Save and New
            </Button>
            <Button
              onClick={() => handleAddNewCustomer(true)}
              className="bg-green-600 rounded-xl hover:bg-green-700 text-white"
            >
              Save and Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};