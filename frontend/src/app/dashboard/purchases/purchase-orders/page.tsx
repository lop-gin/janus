'use client';

import React, { useState } from 'react';
import FormLayout from '@/components/FormLayout';
import FormField from '@/components/FormField';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import LineItemsTable from '@/components/LineItemsTable';
import { useRouter } from 'next/navigation';

export default function PurchaseOrderForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    supplier_id: '',
    company_name: 'Your Company Name', // This would be fetched from user profile
    email: '',
    mailing_address: '',
    shipping_address: 'Your Company Address', // This would be fetched from user profile
    po_date: new Date().toISOString().split('T')[0],
    procurement_rep_id: '',
    notes: '',
    total_net: 0,
    total_tax: 0,
    total_gross: 0,
    grand_total: 0,
  });
  
  // Line items state
  const [lineItems, setLineItems] = useState<any[]>([]);
  
  // Mock data for dropdowns - in a real app, these would be fetched from the API
  const suppliers = [
    { value: '1', label: 'Raw Materials Inc.' },
    { value: '2', label: 'Packaging Supplies Co.' },
    { value: '3', label: 'Industrial Equipment Ltd.' },
  ];
  
  const procurementReps = [
    { value: '1', label: 'John Doe' },
    { value: '2', label: 'Jane Smith' },
    { value: '3', label: 'Bob Johnson' },
  ];
  
  const products = [
    { value: '1', label: 'Raw Material A' },
    { value: '2', label: 'Raw Material B' },
    { value: '3', label: 'Packaging Material' },
    { value: '4', label: 'Machine Part X' },
  ];
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If supplier changes, update related fields (in a real app, this would fetch data from API)
    if (name === 'supplier_id') {
      const selectedSupplier = suppliers.find(s => s.value === value);
      if (selectedSupplier) {
        if (selectedSupplier.value === '1') {
          setFormData(prev => ({
            ...prev,
            email: 'info@rawmaterials.com',
            mailing_address: '123 Supplier St, Industrial Zone, City',
          }));
        } else if (selectedSupplier.value === '2') {
          setFormData(prev => ({
            ...prev,
            email: 'orders@packagingsupplies.com',
            mailing_address: '456 Packaging Rd, Warehouse District, City',
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            email: 'sales@industrialequipment.com',
            mailing_address: '789 Equipment Ave, Manufacturing Park, City',
          }));
        }
      }
    }
  };
  
  // Handle line item changes
  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate amount if quantity or unit_price changes
    if (field === 'quantity' || field === 'unit_price' || field === 'tax_percent') {
      const quantity = parseFloat(updatedItems[index].quantity) || 0;
      const unitPrice = parseFloat(updatedItems[index].unit_price) || 0;
      const taxPercent = parseFloat(updatedItems[index].tax_percent) || 0;
      
      const amount = quantity * unitPrice;
      const taxAmount = amount * (taxPercent / 100);
      const totalAmount = amount + taxAmount;
      
      updatedItems[index].amount = amount.toFixed(2);
      updatedItems[index].tax_amount = taxAmount.toFixed(2);
      updatedItems[index].total_amount = totalAmount.toFixed(2);
    }
    
    setLineItems(updatedItems);
    updateTotals(updatedItems);
  };
  
  // Add new line item
  const handleAddItem = () => {
    setLineItems([
      ...lineItems,
      {
        product_id: '',
        description: '',
        quantity: '1',
        unit_of_measure: '',
        unit_price: '0.00',
        tax_percent: '0',
        amount: '0.00',
        tax_amount: '0.00',
        total_amount: '0.00',
      },
    ]);
  };
  
  // Remove line item
  const handleRemoveItem = (index: number) => {
    const updatedItems = lineItems.filter((_, i) => i !== index);
    setLineItems(updatedItems);
    updateTotals(updatedItems);
  };
  
  // Update totals based on line items
  const updateTotals = (items: any[]) => {
    const totalNet = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const totalTax = items.reduce((sum, item) => sum + (parseFloat(item.tax_amount) || 0), 0);
    const totalGross = items.reduce((sum, item) => sum + (parseFloat(item.total_amount) || 0), 0);
    
    setFormData(prev => ({
      ...prev,
      total_net: totalNet,
      total_tax: totalTax,
      total_gross: totalGross,
      grand_total: totalGross,
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form
      if (!formData.supplier_id) {
        throw new Error('Please select a supplier');
      }
      
      if (lineItems.length === 0) {
        throw new Error('Please add at least one item');
      }
      
      // In a real app, this would send data to the API
      console.log('Form data:', { ...formData, items: lineItems });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Purchase order created successfully!');
      
      // In a real app, we would redirect to the purchase order list or detail page
      // setTimeout(() => router.push('/dashboard/purchases/purchase-orders'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Line items table columns
  const lineItemColumns = [
    {
      field: 'product_id',
      header: 'Product',
      type: 'select' as const,
      options: products,
      width: '20%',
    },
    {
      field: 'description',
      header: 'Description',
      type: 'text' as const,
      width: '20%',
    },
    {
      field: 'quantity',
      header: 'Quantity',
      type: 'number' as const,
      width: '10%',
    },
    {
      field: 'unit_of_measure',
      header: 'Unit',
      type: 'text' as const,
      width: '10%',
    },
    {
      field: 'unit_price',
      header: 'Unit Price',
      type: 'number' as const,
      width: '10%',
    },
    {
      field: 'tax_percent',
      header: 'Tax %',
      type: 'number' as const,
      width: '10%',
    },
    {
      field: 'total_amount',
      header: 'Amount',
      type: 'calculated' as const,
      width: '15%',
      readOnly: true,
      formatter: (value: number) => `$${parseFloat(value).toFixed(2)}`,
    },
  ];
  
  // Totals for line items table
  const totals = [
    {
      field: 'amount',
      label: 'Total Net',
      formatter: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      field: 'tax_amount',
      label: 'Tax',
      formatter: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      field: 'total_amount',
      label: 'Grand Total',
      formatter: (value: number) => `$${value.toFixed(2)}`,
    },
  ];
  
  // Form actions
  const formActions = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push('/dashboard/purchases/purchase-orders')}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
      >
        Save Purchase Order
      </Button>
    </>
  );
  
  return (
    <FormLayout
      title="New Purchase Order"
      subtitle="Create a new purchase order for your suppliers"
      actions={formActions}
      isLoading={isLoading}
      error={error}
      success={success}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormField
              label="Supplier"
              htmlFor="supplier_id"
              required
            >
              <Select
                id="supplier_id"
                name="supplier_id"
                value={formData.supplier_id}
                onChange={handleChange}
                options={suppliers}
                placeholder="Select a supplier"
              />
            </FormField>
            
            <FormField
              label="Company Name"
              htmlFor="company_name"
            >
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                readOnly
              />
            </FormField>
            
            <FormField
              label="Email"
              htmlFor="email"
            >
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </FormField>
            
            <FormField
              label="Mailing Address"
              htmlFor="mailing_address"
            >
              <textarea
                id="mailing_address"
                name="mailing_address"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.mailing_address}
                onChange={handleChange}
              />
            </FormField>
          </div>
          
          <div>
            <FormField
              label="Shipping Address"
              htmlFor="shipping_address"
            >
              <textarea
                id="shipping_address"
                name="shipping_address"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.shipping_address}
                onChange={handleChange}
              />
            </FormField>
            
            <FormField
              label="Purchase Order Date"
              htmlFor="po_date"
              required
            >
              <Input
                id="po_date"
                name="po_date"
                type="date"
                value={formData.po_date}
                onChange={handleChange}
              />
            </FormField>
            
            <FormField
              label="Procurement Representative"
              htmlFor="procurement_rep_id"
            >
              <Select
                id="procurement_rep_id"
                name="procurement_rep_id"
                value={formData.procurement_rep_id}
                onChange={handleChange}
                options={procurementReps}
                placeholder="Select a representative"
              />
            </FormField>
          </div>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
          
          <LineItemsTable
            items={lineItems}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onItemChange={handleItemChange}
            columns={lineItemColumns}
            totals={totals}
            emptyMessage="No items added to this purchase order yet"
          />
        </div>
        
        <div className="mt-6">
          <FormField
            label="Notes / Message to Supplier"
            htmlFor="notes"
          >
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.notes}
              onChange={handleChange}
            />
          </FormField>
        </div>
        
        <div className="flex justify-end space-x-3 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/purchases/purchase-orders')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Save Purchase Order
          </Button>
        </div>
      </form>
    </FormLayout>
  );
}
