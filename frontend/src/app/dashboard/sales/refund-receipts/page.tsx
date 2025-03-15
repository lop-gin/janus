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

export default function RefundReceiptForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    customer_id: '',
    company_name: '',
    email: '',
    billing_address: '',
    refund_date: new Date().toISOString().split('T')[0],
    sales_rep_id: '',
    notes: '',
    total_net: 0,
    total_tax: 0,
    total_gross: 0,
    other_fees_description: '',
    other_fees_amount: 0,
    grand_total: 0,
    payment_method: 'cash',
    reference_number: '',
  });
  
  // Line items state
  const [lineItems, setLineItems] = useState<any[]>([]);
  
  // Customer transactions state
  const [showTransactions, setShowTransactions] = useState(false);
  const [customerTransactions, setCustomerTransactions] = useState<any[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  
  // Mock data for dropdowns - in a real app, these would be fetched from the API
  const customers = [
    { value: '1', label: 'Acme Corp' },
    { value: '2', label: 'XYZ Industries' },
    { value: '3', label: 'Global Enterprises' },
  ];
  
  const salesReps = [
    { value: '1', label: 'John Doe' },
    { value: '2', label: 'Jane Smith' },
    { value: '3', label: 'Bob Johnson' },
  ];
  
  const products = [
    { value: '1', label: 'Finished Product A' },
    { value: '2', label: 'Finished Product B' },
    { value: '3', label: 'Finished Product C' },
    { value: '4', label: 'Finished Product D' },
  ];
  
  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'other', label: 'Other' },
  ];
  
  const unitOptions = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'l', label: 'Liters (l)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'box', label: 'Boxes' },
    { value: 'pallet', label: 'Pallets' },
  ];
  
  // Mock customer transactions - in a real app, these would be fetched from the API
  const mockTransactions = {
    '1': [
      { id: '101', type: 'Invoice', number: 'INV-2025-001', date: '2025-03-01', amount: 1250.00, status: 'Paid', items: [
        { product_id: '1', description: 'Finished Product A', quantity: 5, unit_of_measure: 'pcs', unit_price: 100, tax_percent: 25, amount: 500, tax_amount: 125, total_amount: 625 },
        { product_id: '2', description: 'Finished Product B', quantity: 2, unit_of_measure: 'pcs', unit_price: 250, tax_percent: 25, amount: 500, tax_amount: 125, total_amount: 625 },
      ]},
      { id: '102', type: 'Sales Receipt', number: 'SR-2025-005', date: '2025-03-05', amount: 750.00, status: 'Completed', items: [
        { product_id: '3', description: 'Finished Product C', quantity: 10, unit_of_measure: 'kg', unit_price: 75, tax_percent: 0, amount: 750, tax_amount: 0, total_amount: 750 },
      ]},
    ],
    '2': [
      { id: '201', type: 'Invoice', number: 'INV-2025-010', date: '2025-03-08', amount: 2000.00, status: 'Paid', items: [
        { product_id: '1', description: 'Finished Product A', quantity: 10, unit_of_measure: 'pcs', unit_price: 100, tax_percent: 25, amount: 1000, tax_amount: 250, total_amount: 1250 },
        { product_id: '3', description: 'Finished Product C', quantity: 10, unit_of_measure: 'kg', unit_price: 75, tax_percent: 0, amount: 750, tax_amount: 0, total_amount: 750 },
      ]},
    ],
    '3': [
      { id: '301', type: 'Sales Receipt', number: 'SR-2025-015', date: '2025-03-12', amount: 1875.00, status: 'Completed', items: [
        { product_id: '2', description: 'Finished Product B', quantity: 5, unit_of_measure: 'pcs', unit_price: 250, tax_percent: 25, amount: 1250, tax_amount: 312.5, total_amount: 1562.5 },
        { product_id: '4', description: 'Finished Product D', quantity: 2, unit_of_measure: 'l', unit_price: 150, tax_percent: 10, amount: 300, tax_amount: 30, total_amount: 330 },
      ]},
    ],
  };
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If customer changes, update related fields and fetch transactions
    if (name === 'customer_id') {
      // Reset selected transactions and line items
      setSelectedTransactions([]);
      setLineItems([]);
      
      // Find the selected customer
      const selectedCustomer = customers.find(c => c.value === value);
      if (selectedCustomer) {
        // Update customer details
        if (selectedCustomer.value === '1') {
          setFormData(prev => ({
            ...prev,
            company_name: 'Acme Corp',
            email: 'accounting@acmecorp.com',
            billing_address: '123 Acme St, Business District, City',
          }));
        } else if (selectedCustomer.value === '2') {
          setFormData(prev => ({
            ...prev,
            company_name: 'XYZ Industries',
            email: 'finance@xyzindustries.com',
            billing_address: '456 Industry Rd, Manufacturing Zone, City',
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            company_name: 'Global Enterprises',
            email: 'accounts@globalenterprises.com',
            billing_address: '789 Global Ave, Corporate Park, City',
          }));
        }
        
        // Fetch customer transactions
        setCustomerTransactions(mockTransactions[value] || []);
        setShowTransactions(true);
      } else {
        setCustomerTransactions([]);
        setShowTransactions(false);
      }
    }
    
    // Update grand total when other fees amount changes
    if (name === 'other_fees_amount') {
      const otherFeesAmount = parseFloat(value) || 0;
      setFormData(prev => ({
        ...prev,
        grand_total: prev.total_gross + otherFeesAmount,
      }));
    }
  };
  
  // Handle transaction selection
  const handleTransactionSelect = (transactionId: string) => {
    // Toggle selection
    if (selectedTransactions.includes(transactionId)) {
      setSelectedTransactions(prev => prev.filter(id => id !== transactionId));
    } else {
      setSelectedTransactions(prev => [...prev, transactionId]);
    }
  };
  
  // Apply selected transactions to line items
  const handleApplyTransactions = () => {
    // Get all selected transactions
    const allSelectedTransactions = customerTransactions.filter(t => 
      selectedTransactions.includes(t.id)
    );
    
    // Extract line items from selected transactions
    let newLineItems: any[] = [];
    allSelectedTransactions.forEach(transaction => {
      transaction.items.forEach((item: any) => {
        // Add transaction reference to each item
        newLineItems.push({
          ...item,
          transaction_id: transaction.id,
          transaction_number: transaction.number,
          // Set default return quantity to the original quantity
          return_quantity: item.quantity,
        });
      });
    });
    
    // Update line items
    setLineItems(newLineItems);
    updateTotals(newLineItems);
    
    // Hide transactions list
    setShowTransactions(false);
  };
  
  // Handle line item changes
  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate amount if return_quantity changes
    if (field === 'return_quantity') {
      const returnQuantity = parseFloat(value) || 0;
      const originalQuantity = parseFloat(updatedItems[index].quantity) || 0;
      const unitPrice = parseFloat(updatedItems[index].unit_price) || 0;
      const taxPercent = parseFloat(updatedItems[index].tax_percent) || 0;
      
      // Ensure return quantity doesn't exceed original quantity
      if (returnQuantity > originalQuantity) {
        updatedItems[index].return_quantity = originalQuantity;
        return;
      }
      
      // Calculate prorated amounts
      const ratio = returnQuantity / originalQuantity;
      const amount = unitPrice * returnQuantity;
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
        return_quantity: '0',
        unit_of_measure: 'pcs',
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
    const otherFeesAmount = parseFloat(formData.other_fees_amount) || 0;
    
    setFormData(prev => ({
      ...prev,
      total_net: totalNet,
      total_tax: totalTax,
      total_gross: totalGross,
      grand_total: totalGross + otherFeesAmount,
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
      if (!formData.customer_id) {
        throw new Error('Please select a customer');
      }
      
      if (!formData.refund_date) {
        throw new Error('Please select a refund date');
      }
      
      if (!formData.payment_method) {
        throw new Error('Please select a payment method');
      }
      
      if (lineItems.length === 0) {
        throw new Error('Please add at least one item');
      }
      
      // In a real app, this would send data to the API
      console.log('Form data:', { ...formData, items: lineItems });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Refund receipt created successfully!');
      
      // In a real app, we would redirect to the refund receipt list or detail page
      // setTimeout(() => router.push('/dashboard/sales/refund-receipts'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Line items table columns
  const lineItemColumns = [
    {
      field: 'transaction_number',
      header: 'Source',
      type: 'text' as const,
      width: '15%',
      readOnly: true,
    },
    {
      field: 'product_id',
      header: 'Product',
      type: 'select' as const,
      options: products,
      width: '15%',
      readOnly: true,
    },
    {
      field: 'quantity',
      header: 'Original Qty',
      type: 'number' as const,
      width: '10%',
      readOnly: true,
    },
    {
      field: 'return_quantity',
      header: 'Return Qty',
      type: 'number' as const,
      width: '10%',
    },
    {
      field: 'unit_of_measure',
      header: 'Unit',
      type: 'select' as const,
      options: unitOptions,
      width: '10%',
      readOnly: true,
    },
    {
      field: 'unit_price',
      header: 'Unit Price',
      type: 'number' as const,
      width: '10%',
      readOnly: true,
    },
    {
      field: 'tax_percent',
      header: 'Tax %',
      type: 'number' as const,
      width: '5%',
      readOnly: true,
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
      label: 'Total Gross',
      formatter: (value: number) => `$${value.toFixed(2)}`,
    },
  ];
  
  // Transaction table columns
  const transactionColumns = [
    {
      header: 'Select',
      accessor: 'id',
      cell: (value: string, row: any) => (
        <input
          type="checkbox"
          checked={selectedTransactions.includes(value)}
          onChange={() => handleTransactionSelect(value)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
      ),
      className: 'w-16',
    },
    {
      header: 'Type',
      accessor: 'type',
    },
    {
      header: 'Number',
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
          value === 'Paid' || value === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {value}
        </span>
      ),
    },
  ];
  
  // Form actions
  const formActions = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push('/dashboard/sales/refund-receipts')}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
      >
        Save Refund Receipt
      </Button>
    </>
  );
  
  return (
    <FormLayout
      title="New Refund Receipt"
      subtitle="Create a new refund receipt for customer returns"
      actions={formActions}
      isLoading={isLoading}
      error={error}
      success={success}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormField
              label="Customer"
              htmlFor="customer_id"
              required
            >
              <Select
                id="customer_id"
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                options={customers}
                placeholder="Select a customer"
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
              label="Billing Address"
              htmlFor="billing_address"
            >
              <textarea
                id="billing_address"
                name="billing_address"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.billing_address}
                onChange={handleChange}
              />
            </FormField>
          </div>
          
          <div>
            <FormField
              label="Refund Date"
              htmlFor="refund_date"
              required
            >
              <Input
                id="refund_date"
                name="refund_date"
                type="date"
                value={formData.refund_date}
                onChange={handleChange}
              />
            </FormField>
            
            <FormField
              label="Payment Method"
              htmlFor="payment_method"
              required
            >
              <Select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                options={paymentMethods}
              />
            </FormField>
            
            <FormField
              label="Reference Number"
              htmlFor="reference_number"
            >
              <Input
                id="reference_number"
                name="reference_number"
                value={formData.reference_number}
                onChange={handleChange}
                placeholder="Check #, Transaction ID, etc."
              />
            </FormField>
            
            <FormField
              label="Sales Representative"
              htmlFor="sales_rep_id"
            >
              <Select
                id="sales_rep_id"
                name="sales_rep_id"
                value={formData.sales_rep_id}
                onChange={handleChange}
                options={salesReps}
                placeholder="Select a representative"
              />
            </FormField>
          </div>
        </div>
        
        {showTransactions && customerTransactions.length > 0 && (
          <Card
            title="Select Transactions"
            subtitle="Choose the transactions you want to create a refund for"
            footer={
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleApplyTransactions}
                  disabled={selectedTransactions.length === 0}
                >
                  Apply Selected Transactions
                </Button>
              </div>
            }
          >
            <Table
              columns={transactionColumns}
              data={customerTransactions}
              emptyMessage="No transactions found for this customer"
            />
          </Card>
        )}
        
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Refund Items</h3>
          
          <LineItemsTable
            items={lineItems}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onItemChange={handleItemChange}
            columns={lineItemColumns}
            totals={totals}
            emptyMessage={
              formData.customer_id && customerTransactions.length > 0
                ? "Select transactions above to add items"
                : "Select a customer to view their transactions"
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
            <Card title="Refund Summary">
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
                  <span className="text-sm font-medium text-gray-500">Total Gross:</span>
                  <span className="text-sm text-gray-900">${formData.total_gross.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Other Fees Description"
                      htmlFor="other_fees_description"
                    >
                      <Input
                        id="other_fees_description"
                        name="other_fees_description"
                        value={formData.other_fees_description}
                        onChange={handleChange}
                      />
                    </FormField>
                    <FormField
                      label="Other Fees Amount"
                      htmlFor="other_fees_amount"
                    >
                      <Input
                        id="other_fees_amount"
                        name="other_fees_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.other_fees_amount.toString()}
                        onChange={handleChange}
                      />
                    </FormField>
                  </div>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-500">Grand Total Refunded:</span>
                  <span className="text-sm font-semibold text-gray-900">${formData.grand_total.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/sales/refund-receipts')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Save Refund Receipt
          </Button>
        </div>
      </form>
    </FormLayout>
  );
}
