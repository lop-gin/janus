// src/components/forms/CustomerSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Customer, Document } from "@/types/document";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HelpCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddCustomerSheet } from "./AddCustomerSheet";

interface CustomerSectionProps {
  customer: {
    id?: number;
    name: string;
    company?: string;
    email?: string;
    billingAddress: string;
    initial_balance?: number;
  };
  document: Document;
  updateCustomer: (customer: Customer) => void;
  updateDocument: (updates: Partial<Document>) => void;
  onCustomerSelect?: (customerName: string) => void;
}

export const CustomerSection: React.FC<CustomerSectionProps> = ({
  customer,
  document,
  updateCustomer,
  updateDocument,
  onCustomerSelect,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const formatBillingAddress = (address: { street: string; city: string; state: string; zipCode: string; country: string }): string => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get("http://127.0.0.1:8000/customers", {
          headers: { Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}` },
        });
        setCustomers(response.data);
      } catch (error) {
        console.error("Failed to fetch customers", error);
      }
    };
    fetchCustomers();
  }, []);

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateCustomer({ ...customer, [name]: value });
  };

  const handleCustomerSelect = (value: string) => {
    if (value === "add-new") {
      setIsSheetOpen(true);
    } else {
      const selected = customers.find((c) => c.id?.toString() === value);
      if (selected) {
        const billingAddressString = formatBillingAddress(selected.billing_address);
        updateCustomer({
          ...customer,
          id: selected.id,
          name: selected.name,
          company: selected.company || "",
          email: selected.email || "",
          billingAddress: billingAddressString,
        });
        if (onCustomerSelect) onCustomerSelect(selected.name);
      }
    }
  };

  const handleCustomerAdded = (addedCustomer: {
    id: number;
    name: string;
    company?: string;
    email?: string;
    billing_address: { street: string; city: string; state: string; zipCode: string; country: string };
    initial_balance: number;
  }) => {
    setCustomers([...customers, addedCustomer]);
    handleCustomerSelect(addedCustomer.id.toString());
  };

  return (
    <div className="pb-5">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center mb-1">
              <Label htmlFor="customer" className="text-xs font-medium text-gray-600 mr-1">Customer</Label>
              <HelpCircle className="h-3 w-3 text-gray-400" />
            </div>
            <Select onValueChange={handleCustomerSelect}>
              <SelectTrigger className="w-full h-9 text-xs">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add-new" className="font-semibold text-green-600">Add New</SelectItem>
                {customers.map((cust) => (
                  <SelectItem key={cust.id} value={cust.id!.toString()}>
                    {cust.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="company" className="text-xs font-medium text-gray-600 mr-1">Company</Label>
            <Input
              id="company"
              name="company"
              className="w-full h-9 text-xs"
              value={customer.company || ""}
              onChange={handleCustomerChange}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email" className="text-xs font-medium text-gray-600 mr-1">Customer email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            className="w-full h-9 text-xs"
            value={customer.email || ""}
            onChange={handleCustomerChange}
            placeholder="Separate emails with a comma"
          />
        </div>
        <div>
          <Label htmlFor="billingAddress" className="text-xs font-medium text-gray-600 mr-1">Billing address</Label>
          <Textarea
            id="billingAddress"
            name="billingAddress"
            className="min-h-[80px] resize-none text-xs"
            value={customer.billingAddress}
            onChange={(e) => updateCustomer({ ...customer, billingAddress: e.target.value })}
          />
        </div>
      </div>
      <Separator className="mt-5 mb-0 w-full bg-gray-200" />
      <AddCustomerSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onCustomerAdded={handleCustomerAdded}
      />
    </div>
  );
};