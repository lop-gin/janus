// src/components/forms/AddCustomerSheet.tsx
"use client";

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

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
    initial_balance: 0,
  });

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

  const handleAddNewCustomer = async () => {
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
        initial_balance: 0,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add customer", error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-1/2 p-6 bg-white">
        <SheetHeader>
          <SheetTitle>Add New Customer</SheetTitle>
          <SheetDescription>Enter the customer details below.</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Name"
              value={newCustomer.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Email"
              value={newCustomer.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>
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
          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={newCustomer.billing_address.country}
              onChange={(e) => handleInputChange("billing_address.country", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="initial_balance">Initial Balance</Label>
            <Input
              id="initial_balance"
              type="number"
              placeholder="Initial Balance"
              value={newCustomer.initial_balance}
              onChange={(e) => handleInputChange("initial_balance", parseFloat(e.target.value) || 0)}
            />
          </div>
          <Button onClick={handleAddNewCustomer}>Save</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};