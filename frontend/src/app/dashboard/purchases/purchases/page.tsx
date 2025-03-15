'use client';

import React, { useState, useEffect } from 'react';
import FormLayout from '@/components/FormLayout';
import FormField from '@/components/FormField';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import LineItemsTable from '@/components/LineItemsTable';
import Table from '@/components/Table';
import Card from '@/components/Card';
import { useRouter } from 'next/navigation';

export default function PurchaseForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    supplier_id: '',
    company_name: 'Your Company Name', // This would be fetched from user profile
    email: '',
    purchase_date: new Date().toISOString().split('T')[0],
    procurement_rep_id: '',
    notes: '',
    total_net: 0,
    total_tax: 0,
    total_gross: 0,
    grand_total: 0,
    amount_paid: 0,
    balance_due: 0,
  });
  
  // Line items state
  const [lineItems, setLineItems] = useState<any[]>([]);
  
  // Purchase order state
  const [showPurchaseOrders, setShowPurchaseOrders] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<string | null>(null);
  
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
  
  // Mock purchase orders - in a real app, these would be fetched from the API
  const mockPurchaseOrders = {
    '1': [
      { id: '101', number: 'PO-2025-001', date: '2025-03-01', amount: 1250.00, status: 'Open', items: [
        { product_id: '1', description: 'Raw Material A', quantity: 50, unit_of_measure: 'kg', unit_price: 10, tax_percent: 5, amount: 500, tax_amount: 25, total_amount: 525 },
        { product_id: '2', description: 'Raw Material B', quantity: 25, unit_of_measure: 'kg', unit_price: 20, tax_percent: 5, amount: 500, tax_amount: 25, total_amount: 525 },
      ]},
      { id: '102', number: 'PO-2025-005', date: '2025-03-05', amount: 750.00, status: 'Open', items: [
        { product_id: '3', description: 'Packaging Material', quantity: 100, unit_of_measure: 'pcs', unit_price: 7, tax_percent: 5, amount: 700, tax_amount: 35, total_amount: 735 },
      ]},
    ],
    '2': [
      { id: '201', number: 'PO-2025-010', date: '2025-03-08', amount: 2000.00, status: 'Open', items: [
        { product_id: '3', description: 'Packaging Material', quantity: 200, unit_of_measure: 'pcs', unit_price: 7, tax_percent: 5, amount: 1400, tax_amount: 70, total_amount: 1470 },
        { product_id: '4', description: 'Machine Part X', quantity: 5, unit_of_measure: 'pcs', unit_price: 100, tax_percent: 5, amount: 500, tax_amount: 25, total_amount: 525 },
      ]},
    ],
    '3': [
      { id: '301', number: 'PO-2025-015', date: '2025-03-12', amount: 1875.00, status: 'Open', items: [
        { product_id: '4', description: 'Machine Part X', quantity: 15, unit_of_measure: 'pcs', unit_price: 100, tax_percent: 5, amount: 1500, tax_amount: 75, total_amount: 1575 },
        { product_id: '1', description: 'Raw Material A', quantity: 30, unit_of_measure: 'kg', unit_price: 10, tax_percent: 5, amount: 300, tax_amount: 15, total_amount: 315 },
      ]},
    ],
  };
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If supplier changes, update related fields and fetch purchase orders
    if (name === 'supplier_id') {
      // Reset selected purchase order and line items
      setSelectedPurchaseOrder(null);
      setLineItems([]);
      
      // Find the selected supplier
      const selectedSupplier = suppliers.find(s => s.value === value);
      if (selectedSupplier) {
        // Update supplier details
        if (selectedSupplier.value === '1') {
          setFormData(prev => ({
            ...prev,
            email: 'info@rawmaterials.com',
          }));
        } else if (selectedSupplier.value === '2') {
          setFormData(prev => ({
            ...prev,
            email: 'orders@packagingsupplies.com',
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            email: 'sales@industrialequipment.com',
          }));
        }
        
        // Fetch supplier purchase orders
        setPurchaseOrders(mockPurchaseOrders[value] || []);
        setShowPurchaseOrders(true);
      } else {
        setPurchaseOrders([]);
        setShowPurchaseOrders(false);
      }
    }
    
    // Update balance due when amount paid changes
    if (name === 'amount_paid') {
      const amountPaid = parseFloat(value) || 0;
      const grandTotal = formData.grand_total;
      setFormData(prev => ({
        ...prev,
        balance_due: Math.max(0, grandTotal - amountPaid),
      }));
    }
  };
  
  // Handle purchase order selection
  const handlePurchaseOrderSelect = (purchaseOrderId: string) => {
    // Set selected purchase order
    setSelectedPurchaseOrder(purchaseOrderId);
    
    // Find the selected purchase order
    const selectedPO = purchaseOrders.find(po => po.id === purchaseOrderId);
    if (selectedPO) {
      // Set line items from purchase order
      setLineItems(selectedPO.items.map((item: any) => ({
        ...item,
        purchase_order_id: selectedPO.id,
        purchase_order_number: selectedPO.number,
        received_quantity: item.quantity, // Default to full quantity
      })));
      
      // Update totals
      updateTotals(selectedPO.items);
      
      // Hide purchase orders list
      setShowPurchaseOrders(false);
    }
  };
  
  // Handle line item changes
  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate amount if received_quantity changes
    if (field === 'received_quantity') {
      const receivedQuantity = parseFloat(value) || 0;
      const originalQuantity = parseFloat(updatedItems[index].quantity) || 0;
      const unitPrice = parseFloat(updatedItems[index].unit_price) || 0;
      const taxPercent = parseFloat(updatedItems[index].tax_percent) || 0;
      
      // Ensure received quantity doesn't exceed original quantity
      if (receivedQuantity > originalQuantity) {
        updatedItems[index].received_quantity = originalQuantity;
        return;
      }
      
      // Calculate prorated amounts
      const amount = unitPrice * receivedQuantity;
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
        quantity: '0',
        received_quantity: '0',
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
    const amountPaid = parseFloat(formData.amount_paid) || 0;
    
    setFormData(prev => ({
      ...prev,
      total_net: totalNet,
      total_tax: totalTax,
      total_gross: totalGross,
      grand_total: totalGross,
      balance_due: Math.max(0, totalGross - amountPaid),
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
      
      setSuccess('Purchase record created successfully!');
      
      // In a real app, we would redirect to the purchase list or detail page
      // setTimeout(() => router.push('/dashboard/purchases/purchases'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Line items table columns
  const lineItemColumns = [
    {
      field: 'purchase_order_number',
      header: 'PO #',
      type: 'text' as const,
      width: '10%',
      readOnly: true,
    },
    {
      field: 'product_id',
      header: 'Product',
      type: 'select' as const,
      options: products,
      width: '15%',
    },
    {
      field: 'description',
      header: 'Description',
      type: 'text' as const,
      width: '20%',
    },
    {
      field: 'quantity',
      header: 'PO Qty',
      type: 'number' as const,
      width: '10%',
      readOnly: true,
    },
    {
      field: 'received_quantity',
      header: 'Received Qty',
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
      width: '5%',
    },
    {
      field: 'total_amount',
      header: 'Amount',
      type: 'calculated' as const,
      width: '10%',
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
  
  // Purchase order table columns
  const purchaseOrderColumns = [
    {
      header: 'PO Number',
      accessor: 'number',
    },
    {
      header: 'Date',
      accessor: 'date',
      cell: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      header: 'Amount',
      accessor: 'amount',
      cell: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          value === 'Open' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {value}
        </span>
      ),
    },
    {
      header: 'Action',
      accessor: 'id',
      cell: (value: string) => (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handlePurchaseOrderSelect(value)}
        >
          Select
        </Button>
      ),
    },
  ];
  
  // Form actions
  const formActions = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push('/dashboard/purchases/purchases')}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
      >
        Save Purchase
      </Button>
    </>
  );
  
  return (
    <FormLayout
      title="New Purchase"
      subtitle="Record goods received from suppliers"
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
          </div>
          
          <div>
            <FormField
              label="Purchase Date"
              htmlFor="purchase_date"
              required
            >
              <Input
                id="purchase_date"
                name="purchase_date"
                type="date"
                value={formData.purchase_date}
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
        
        {showPurchaseOrders && purchaseOrders.length > 0 && (
          <Card
            title="Select Purchase Order"
            subtitle="Choose a purchase order to record received goods"
          >
            <Table
              columns={purchaseOrderColumns}
              data={purchaseOrders}
              emptyMessage="No purchase orders found for this supplier"
            />
          </Card>
        )}
        
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Purchase Items</h3>
          
          <LineItemsTable
            items={lineItems}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onItemChange={handleItemChange}
            columns={lineItemColumns}
            totals={totals}
            emptyMessage={
              formData.supplier_id && purchaseOrders.length > 0
                ? "Select a purchase order above or add items manually"
                : "Select a supplier to view purchase orders or add items manually"
            }
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormField
              label="Notes"
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
          
          <div>
            <Card title="Payment Summary">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Total Net:</span>
                  <span className="text-sm text-gray-900">${formData.total_net.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Tax:</span>
                  <span className="text-sm text-gray-900">${formData.total_tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Grand Total:</span>
                  <span className="text-sm font-semibold text-gray-900">${formData.grand_total.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <FormField
                    label="Amount Paid"
                    htmlFor="amount_paid"
                  >
                    <Input
                      id="amount_paid"
                      name="amount_paid"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount_paid.toString()}
                      onChange={handleChange}
                    />
                  </FormField>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-500">Balance Due:</span>
                  <span className="text-sm font-semibold text-gray-900">${formData.balance_due.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/purchases/purchases')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Save Purchase
          </Button>
        </div>
      </form>
    </FormLayout>
  );
}
