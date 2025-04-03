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

/**
 * Props for the CustomerSection component.
 */
interface CustomerSectionProps {
  customer: {
    id?: number;
    name: string;
    company?: string;
    email?: string;
    billingAddress: string; // String in form state, converted from Address object
  };
  document: Document;
  updateCustomer: (customer: Customer) => void;
  updateDocument: (updates: Partial<Document>) => void;
  onCustomerSelect?: (customerName: string) => void;
}

/**
 * CustomerSection component manages customer selection and details input for the invoice form.
 * Fetches customers filtered by the current user's company ID and handles adding new customers.
 */
export const CustomerSection: React.FC<CustomerSectionProps> = ({
  customer,
  document,
  updateCustomer,
  updateDocument,
  onCustomerSelect,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Utility to format Address object into a string for display
  const formatBillingAddress = (address: { street: string; city: string; state: string; zipCode: string; country: string }): string => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  // Fetch customers on mount, ensuring token is present
  useEffect(() => {
    const fetchCustomers = async () => {
      const token = localStorage.getItem("supabase.auth.token");
      if (!token) {
        setError("Authentication token not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get("http://127.0.0.1:8000/customers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched customers:", response.data); // Debug log
        setCustomers(response.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
        setError("Unable to load customers. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Handle input changes for customer details
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateCustomer({ ...customer, [name]: value });
  };

  // Handle customer selection from dropdown
  const handleCustomerSelect = (value: string) => {
    if (value === "add-new") {
      setIsSheetOpen(true);
    } else {
      const selected = customers.find((c) => c.id?.toString() === value);
      if (selected) {
        const billingAddressString = formatBillingAddress(selected.billing_address);
        updateCustomer({
          id: selected.id,
          name: selected.name,
          company: selected.company || "",
          email: selected.email || "",
          billingAddress: billingAddressString,
          billing_address: selected.billing_address, // Preserve Address object for saving
        });
        if (onCustomerSelect) onCustomerSelect(selected.name);
      }
    }
  };

  // Handle new customer addition from sheet
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
    setIsSheetOpen(false);
  };

  return (
    <div className="pb-5">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center mb-1">
              <Label htmlFor="customer" className="text-xs font-medium text-gray-600 mr-1">
                Customer
              </Label>
              <HelpCircle className="h-3 w-3 text-gray-400" />
            </div>
            <Select onValueChange={handleCustomerSelect} disabled={loading}>
              <SelectTrigger className="w-full h-9 text-xs">
                <SelectValue placeholder={loading ? "Loading customers..." : "Select a customer"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add-new" className="font-semibold text-green-600">
                  Add New
                </SelectItem>
                {customers.map((cust) => (
                  <SelectItem key={cust.id} value={cust.id!.toString()}>
                    {cust.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div>
            <Label htmlFor="company" className="text-xs font-medium text-gray-600 mr-1">
              Company
            </Label>
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
          <Label htmlFor="email" className="text-xs font-medium text-gray-600 mr-1">
            Customer Email
          </Label>
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
          <Label htmlFor="billingAddress" className="text-xs font-medium text-gray-600 mr-1">
            Billing Address
          </Label>
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