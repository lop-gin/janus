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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface CustomerSectionProps {
  customer: {
    id?: number;
    name: string;
    company?: string;
    email?: string;
    billingAddress: string; // Change to string
    initial_balance?: number;
  };
  document: Document;
  updateCustomer: (customer: Customer) => void; // Still expects Customer type
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
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    company: "",
    email: "",
    billing_address: { street: "", city: "", state: "", zipCode: "", country: "" },
    initial_balance: 0,
  });

  const formatBillingAddress = (address: Address): string => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };  

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        console.log("Token:", localStorage.getItem("supabase.auth.token"));
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
    if (name.startsWith("billing.")) {
      const billingField = name.replace("billing.", "");
      updateCustomer({
        ...customer,
        billingAddress: { ...customer.billingAddress, [billingField]: value },
      });
    } else {
      updateCustomer({ ...customer, [name]: value });
    }
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
          billingAddress: billingAddressString, // Set as string
        });
        if (onCustomerSelect) onCustomerSelect(selected.name);
      }
    }
  };

  const handleAddNewCustomer = async () => {
    try {
      const response = await api.post(
        "http://127.0.0.1:8000/customers",
        { ...newCustomer }, // company_id, created_by, updated_by set by backend
        { headers: { Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}` } }
      );
      const addedCustomer = response.data;
      setCustomers([...customers, addedCustomer]);
      setIsSheetOpen(false);
      handleCustomerSelect(addedCustomer.id.toString());
      setNewCustomer({
        name: "",
        company: "",
        email: "",
        billing_address: { street: "", city: "", state: "", zipCode: "", country: "" },
        initial_balance: 0,
      });
    } catch (error) {
      console.error("Failed to add customer", error);
    }
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
            value={customer.email}
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

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-1/2 p-6">
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
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Company"
                value={newCustomer.company}
                onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="Email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="street">Street</Label>
              <Input
                id="street"
                value={newCustomer.billing_address.street}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    billing_address: { ...newCustomer.billing_address, street: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={newCustomer.billing_address.city}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    billing_address: { ...newCustomer.billing_address, city: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={newCustomer.billing_address.state}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    billing_address: { ...newCustomer.billing_address, state: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="zipCode">Zip Code</Label>
              <Input
                id="zipCode"
                value={newCustomer.billing_address.zipCode}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    billing_address: { ...newCustomer.billing_address, zipCode: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={newCustomer.billing_address.country}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    billing_address: { ...newCustomer.billing_address, country: e.target.value },
                  })
                }
              />
            </div>

            <div>
              <Label htmlFor="initial_balance">Initial Balance</Label>
              <Input
                id="initial_balance"
                type="number"
                placeholder="Initial Balance"
                value={newCustomer.initial_balance}
                onChange={(e) => setNewCustomer({ ...newCustomer, initial_balance: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <Button onClick={handleAddNewCustomer}>Save</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};