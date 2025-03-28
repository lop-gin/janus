
import React from "react";
import { Customer, Document } from "@/types/document";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HelpCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CustomerSectionProps {
  customer: Customer;
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
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith("billing.")) {
      const billingField = name.replace("billing.", "");
      updateCustomer({
        ...customer,
        billingAddress: {
          ...customer.billingAddress,
          [billingField]: value,
        },
      });
    } else {
      updateCustomer({
        ...customer,
        [name]: value,
      });
    }
  };

  const handleCustomerSelect = (value: string) => {
    // For demo purposes, we'll set predefined values based on selection
    const customerData: Record<string, { name: string, email: string, company: string }> = {
      "customer1": { name: "John Smith", email: "john@example.com", company: "Smith Inc." },
      "customer2": { name: "Jane Doe", email: "jane@example.com", company: "Doe Enterprises" },
      "customer3": { name: "Robert Johnson", email: "robert@example.com", company: "Johnson Ltd." },
    };

    const selectedCustomer = customerData[value] || { name: "", email: "", company: "" };
    
    updateCustomer({
      ...customer,
      name: selectedCustomer.name,
      email: selectedCustomer.email,
      company: selectedCustomer.company
    });
    
    // If onCustomerSelect callback is provided, call it with the customer name
    if (onCustomerSelect) {
      onCustomerSelect(selectedCustomer.name);
    }
  };

  const handleCompanySelect = (value: string) => {
    updateCustomer({
      ...customer,
      company: value
    });
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
                <SelectItem value="customer1">John Smith</SelectItem>
                <SelectItem value="customer2">Jane Doe</SelectItem>
                <SelectItem value="customer3">Robert Johnson</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <div className="flex items-center mb-1">
              <Label htmlFor="company" className="text-xs font-medium text-gray-600 mr-1">Company</Label>
              <HelpCircle className="h-3 w-3 text-gray-400" />
            </div>
            <Select onValueChange={handleCompanySelect} value={customer.company || ""}>
              <SelectTrigger className="w-full h-9 text-xs">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Smith Inc.">Smith Inc.</SelectItem>
                <SelectItem value="Doe Enterprises">Doe Enterprises</SelectItem>
                <SelectItem value="Johnson Ltd.">Johnson Ltd.</SelectItem>
                <SelectItem value="ABC Corp">ABC Corp</SelectItem>
                <SelectItem value="XYZ Industries">XYZ Industries</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="flex items-center mb-1">
            <Label htmlFor="email" className="text-xs font-medium text-gray-600 mr-1">Customer email</Label>
            <HelpCircle className="h-3 w-3 text-gray-400" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            className="w-full text-xs h-9"
            value={customer.email}
            onChange={handleCustomerChange}
            placeholder="Separate emails with a comma"
          />
        </div>

        <div>
          <div className="flex items-center mb-1">
            <Label htmlFor="billingAddress" className="text-xs font-medium text-gray-600 mr-1">Billing address</Label>
          </div>
          <Textarea 
            id="billingAddress"
            name="billing.street"
            className="min-h-[80px] resize-none text-xs"
            value={customer.billingAddress.street}
            onChange={handleCustomerChange}
          />
        </div>
      </div>
      <Separator className="mt-5 mb-0 w-full bg-gray-200" />
    </div>
  );
};
