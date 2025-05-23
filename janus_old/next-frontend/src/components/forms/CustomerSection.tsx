"use client";

import React, { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { Customer, Document, Address } from "@/types/document";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HelpCircle, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import { AddCustomerSheet } from "./AddCustomerSheet";

/**
 * Props for the CustomerSection component.
 */
interface CustomerSectionProps {
  customer: Customer;
  document: Document;
  updateCustomer: (customer: Customer) => void;
  updateDocument: (updates: Partial<Document>) => void;
  onCustomerSelect?: (customerName: string) => void;
}

/**
 * CustomerSection component manages customer selection and details input for the invoice form.
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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    customer.id?.toString() || null
  );
  const [searchTerm, setSearchTerm] = useState<string>(
    customer.name || ""
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Format Address object into a string for display
  const formatBillingAddress = (address: Address): string => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
  };

  // Parse string into Address object
  const parseBillingAddress = (addressString: string): Address => {
    const parts = addressString.split(", ");
    return {
      street: parts[0] || "",
      city: parts[1] || "",
      state: parts[2] ? parts[2].split(" ")[0] : "",
      zipCode: parts[2] ? parts[2].split(" ")[1] : "",
      country: parts[3] || "",
    };
  };

  // Fetch customers on mount
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
        const response = await api.get("/customers", {
          headers: { Authorization: `Bearer ${token}` },
        });
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
    if (name === "billing_address") {
      const updatedAddress = parseBillingAddress(value);
      updateCustomer({ ...customer, billing_address: updatedAddress });
    } else {
      updateCustomer({ ...customer, [name]: value });
    }
  };

  // Handle customer selection from dropdown
  const handleCustomerSelect = (value: string) => {
    if (value === "add-new") {
      setIsSheetOpen(true);
    } else {
      const selectedCustomer = customers.find((c) => c.id!.toString() === value);
      if (selectedCustomer) {
        setSelectedCustomerId(value);
        setSearchTerm(selectedCustomer.name || "");
        updateCustomer({
          id: selectedCustomer.id,
          name: selectedCustomer.name || "",
          company: selectedCustomer.company || "",
          email: selectedCustomer.email || "",
          billing_address: selectedCustomer.billing_address || {
            street: "",
            city: "",
            state: "",
            zipCode: "",
            country: "",
          },
        });
        setIsDropdownOpen(false);
      }
    }
  };

  // Handle new customer addition from sheet
  const handleCustomerAdded = (addedCustomer: Customer) => {
    setCustomers([...customers, addedCustomer]);
    const newCustomerId = addedCustomer.id!.toString();
    setSelectedCustomerId(newCustomerId);
    setSearchTerm(addedCustomer.name || "");
    updateCustomer({
      id: addedCustomer.id,
      name: addedCustomer.name,
      company: addedCustomer.company || "",
      email: addedCustomer.email || "",
      billing_address: addedCustomer.billing_address,
    });
    setIsSheetOpen(false);
  };

  // Handle sheet closure without adding a customer
  const handleSheetClose = () => {
    setIsSheetOpen(false);
    if (!selectedCustomerId) {
      setSearchTerm("");
    } else {
      const selectedCustomer = customers.find((c) => c.id!.toString() === selectedCustomerId);
      if (selectedCustomer) {
        setSearchTerm(selectedCustomer.name || "");
      }
    }
  };

  // Filter customers based on search term
  const filteredCustomers = customers.filter((cust) =>
    cust.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle input change for search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };

  // Handle clear button
  const handleClear = () => {
    setSelectedCustomerId(null);
    setSearchTerm("");
    updateCustomer({
      id: undefined,
      name: "",
      company: "",
      email: "",
      billing_address: { street: "", city: "", state: "", zipCode: "", country: "" },
    });
  };

  // Handle input blur
  const handleBlur = () => {
    const matchingCustomer = customers.find(
      (cust) => cust.name.toLowerCase() === searchTerm.toLowerCase()
    );
    if (!matchingCustomer) {
      setSearchTerm("");
      setSelectedCustomerId(null);
      updateCustomer({
        id: undefined,
        name: "",
        company: "",
        email: "",
        billing_address: { street: "", city: "", state: "", zipCode: "", country: "" },
      });
    }
    setIsDropdownOpen(false);
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const matchingCustomer = customers.find(
        (cust) => cust.name.toLowerCase() === searchTerm.toLowerCase()
      );
      if (matchingCustomer) {
        handleCustomerSelect(matchingCustomer.id!.toString());
      } else {
        setSearchTerm("");
        setSelectedCustomerId(null);
        updateCustomer({
          id: undefined,
          name: "",
          company: "",
          email: "",
          billing_address: { street: "", city: "", state: "", zipCode: "", country: "" },
        });
      }
      setIsDropdownOpen(false);
    }
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
            <div className="relative" ref={dropdownRef}>
              <Input
                id="customer"
                className="w-full h-9 text-xs pr-8"
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsDropdownOpen(true)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder={loading ? "Loading customers..." : "Select or type a customer"}
                disabled={loading}
              />
              {selectedCustomerId && (
                <button
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              {isDropdownOpen && !loading && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg top-[100%]">
                  <div className="max-h-60 overflow-y-auto">
                    <div
                      className="p-2 hover:bg-gray-100 cursor-pointer font-semibold text-green-600"
                      onMouseDown={() => handleCustomerSelect("add-new")}
                    >
                      Add New
                    </div>
                    {filteredCustomers.map((cust) => (
                      <div
                        key={cust.id}
                        className="p-2 text-black hover:bg-gray-100 cursor-pointer"
                        onMouseDown={() => handleCustomerSelect(cust.id!.toString())}
                      >
                        {cust.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
          <Label htmlFor="billing_address" className="text-xs font-medium text-gray-600 mr-1">
            Billing Address
          </Label>
          <Textarea
            id="billing_address"
            name="billing_address"
            className="min-h-[80px] resize-none text-xs"
            value={formatBillingAddress(customer.billing_address)}
            onChange={handleCustomerChange}
          />
        </div>
      </div>
      <Separator className="mt-5 mb-0 w-full bg-gray-200" />
      <AddCustomerSheet
        isOpen={isSheetOpen}
        onOpenChange={handleSheetClose}
        onCustomerAdded={handleCustomerAdded}
      />
    </div>
  );
};