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

export default function ReceivePaymentForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    customer_id: '',
    company_name: '',
    email: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    reference_number: '',
    amount_received: '0.00',
    memo: '',
  });
  
  // Unpaid invoices state
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [paymentAllocations, setPaymentAllocations] = useState<any[]>([]);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [unallocatedAmount, setUnallocatedAmount] = useState(0);
  
  // Mock data for dropdowns - in a real app, these would be fetched from the API
  const customers = [
    { value: '1', label: 'Acme Corp' },
    { value: '2', label: 'XYZ Industries' },
    { value: '3', label: 'Global Enterprises' },
  ];
  
  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'other', label: 'Other' },
  ];
  
  // Mock unpaid invoices - in a real app, these would be fetched from the API
  const mockUnpaidInvoices = {
    '1': [
      { id: '101', number: 'INV-2025-001', date: '2025-03-01', due_date: '2025-03-31', original_amount: 1250.00, amount_paid: 250.00, open_balance: 1000.00 },
      { id: '102', number: 'INV-2025-008', date: '2025-03-08', due_date: '2025-04-07', original_amount: 750.00, amount_paid: 0.00, open_balance: 750.00 },
    ],
    '2': [
      { id: '201', number: 'INV-2025-010', date: '2025-03-10', due_date: '2025-04-09', original_amount: 2000.00, amount_paid: 500.00, open_balance: 1500.00 },
    ],
    '3': [
      { id: '301', number: 'INV-2025-015', date: '2025-03-15', due_date: '2025-04-14', original_amount: 1875.00, amount_paid: 0.00, open_balance: 1875.00 },
      { id: '302', number: 'INV-2025-020', date: '2025-03-20', due_date: '2025-04-19', original_amount: 3250.00, amount_paid: 1000.00, open_balance: 2250.00 },
    ],
  };
  
  // Update unallocated amount when amount received or allocations change
  useEffect(() => {
    const amountReceived = parseFloat(formData.amount_received) || 0;
    setUnallocatedAmount(amountReceived - totalAllocated);
  }, [formData.amount_received, totalAllocated]);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // If customer changes, update related fields and fetch unpaid invoices
    if (name === 'customer_id') {
      // Reset payment allocations
      setPaymentAllocations([]);
      setTotalAllocated(0);
      
      // Find the selected customer
      const selectedCustomer = customers.find(c => c.value === value);
      if (selectedCustomer) {
        // Update customer details
        if (selectedCustomer.value === '1') {
          setFormData(prev => ({
            ...prev,
            company_name: 'Acme Corp',
            email: 'accounting@acmecorp.com',
          }));
        } else if (selectedCustomer.value === '2') {
          setFormData(prev => ({
            ...prev,
            company_name: 'XYZ Industries',
            email: 'finance@xyzindustries.com',
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            company_name: 'Global Enterprises',
            email: 'accounts@globalenterprises.com',
          }));
        }
        
        // Fetch unpaid invoices
        const customerInvoices = mockUnpaidInvoices[value] || [];
        setUnpaidInvoices(customerInvoices);
        
        // Initialize payment allocations
        const initialAllocations = customerInvoices.map(invoice => ({
          invoice_id: invoice.id,
          invoice_number: invoice.number,
          open_balance: invoice.open_balance,
          payment_amount: '0.00',
        }));
        setPaymentAllocations(initialAllocations);
      } else {
        setUnpaidInvoices([]);
      }
    }
    
    // If amount received changes, auto-allocate to oldest invoices
    if (name === 'amount_received') {
      autoAllocatePayment(value);
    }
  };
  
  // Auto-allocate payment to oldest invoices
  const autoAllocatePayment = (amountReceivedStr: string) => {
    const amountReceived = parseFloat(amountReceivedStr) || 0;
    
    // Sort invoices by date (oldest first)
    const sortedInvoices = [...unpaidInvoices].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let remainingAmount = amountReceived;
    const newAllocations = [...paymentAllocations];
    
    // Reset all allocations
    newAllocations.forEach(allocation => {
      allocation.payment_amount = '0.00';
    });
    
    // Allocate to each invoice until amount is fully allocated
    for (const invoice of sortedInvoices) {
      if (remainingAmount <= 0) break;
      
      const allocation = newAllocations.find(a => a.invoice_id === invoice.id);
      if (allocation) {
        const openBalance = invoice.open_balance;
        const paymentAmount = Math.min(remainingAmount, openBalance);
        
        allocation.payment_amount = paymentAmount.toFixed(2);
        remainingAmount -= paymentAmount;
      }
    }
    
    setPaymentAllocations(newAllocations);
    updateTotalAllocated(newAllocations);
  };
  
  // Handle payment allocation changes
  const handleAllocationChange = (invoiceId: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    
    // Find the invoice
    const invoice = unpaidInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    // Ensure payment amount doesn't exceed open balance
    const openBalance = invoice.open_balance;
    const paymentAmount = Math.min(numericValue, openBalance);
    
    // Update the allocation
    const newAllocations = paymentAllocations.map(allocation => {
      if (allocation.invoice_id === invoiceId) {
        return {
          ...allocation,
          payment_amount: paymentAmount.toFixed(2),
        };
      }
      return allocation;
    });
    
    setPaymentAllocations(newAllocations);
    updateTotalAllocated(newAllocations);
  };
  
  // Update total allocated amount
  const updateTotalAllocated = (allocations: any[]) => {
    const total = allocations.reduce((sum, allocation) => 
      sum + (parseFloat(allocation.payment_amount) || 0), 0
    );
    setTotalAllocated(total);
  };
  
  // Auto-fill payment amount for an invoice
  const handleAutoFill = (invoiceId: string) => {
    // Find the invoice
    const invoice = unpaidInvoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    
    // Calculate available amount
    const amountReceived = parseFloat(formData.amount_received) || 0;
    const currentAllocated = paymentAllocations.reduce((sum, allocation) => 
      allocation.invoice_id !== invoiceId ? sum + (parseFloat(allocation.payment_amount) || 0) : sum, 0
    );
    const availableAmount = amountReceived - currentAllocated;
    
    // Determine payment amount (min of open balance and available amount)
    const openBalance = invoice.open_balance;
    const paymentAmount = Math.min(availableAmount, openBalance);
    
    // Update the allocation
    const newAllocations = paymentAllocations.map(allocation => {
      if (allocation.invoice_id === invoiceId) {
        return {
          ...allocation,
          payment_amount: paymentAmount.toFixed(2),
        };
      }
      return allocation;
    });
    
    setPaymentAllocations(newAllocations);
    updateTotalAllocated(newAllocations);
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
      
      if (!formData.payment_date) {
        throw new Error('Please select a payment date');
      }
      
      if (!formData.payment_method) {
        throw new Error('Please select a payment method');
      }
      
      const amountReceived = parseFloat(formData.amount_received);
      if (isNaN(amountReceived) || amountReceived <= 0) {
        throw new Error('Please enter a valid amount received');
      }
      
      // Check if any payment is allocated
      const totalPayment = paymentAllocations.reduce((sum, allocation) => 
        sum + (parseFloat(allocation.payment_amount) || 0), 0
      );
      
      if (totalPayment <= 0) {
        throw new Error('Please allocate payment to at least one invoice');
      }
      
      // In a real app, this would send data to the API
      console.log('Form data:', { 
        ...formData, 
        payment_allocations: paymentAllocations.filter(a => parseFloat(a.payment_amount) > 0) 
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Payment recorded successfully!');
      
      // In a real app, we would redirect to the payments list or customer detail page
      // setTimeout(() => router.push('/dashboard/sales/payments'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Form actions
  const formActions = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push('/dashboard/sales/payments')}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
      >
        Save Payment
      </Button>
    </>
  );
  
  return (
    <FormLayout
      title="Receive Payment"
      subtitle="Record customer payments for outstanding invoices"
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
          </div>
          
          <div>
            <FormField
              label="Payment Date"
              htmlFor="payment_date"
              required
            >
              <Input
                id="payment_date"
                name="payment_date"
                type="date"
                value={formData.payment_date}
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
              label="Amount Received"
              htmlFor="amount_received"
              required
            >
              <Input
                id="amount_received"
                name="amount_received"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount_received}
                onChange={handleChange}
              />
            </FormField>
          </div>
        </div>
        
        {unpaidInvoices.length > 0 ? (
          <div className="mt-8">
            <Card
              title="Outstanding Invoices"
              subtitle="Allocate payment to invoices"
              footer={
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">Total Allocated:</span> ${totalAllocated.toFixed(2)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Unallocated Amount:</span> ${unallocatedAmount.toFixed(2)}
                  </div>
                </div>
              }
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice Number
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Original Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Open Balance
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {unpaidInvoices.map((invoice) => {
                      const allocation = paymentAllocations.find(a => a.invoice_id === invoice.id);
                      return (
                        <tr key={invoice.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {invoice.number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invoice.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${invoice.original_amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            ${invoice.open_balance.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max={invoice.open_balance}
                              value={allocation?.payment_amount || '0.00'}
                              onChange={(e) => handleAllocationChange(invoice.id, e.target.value)}
                              className="w-24"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Button
                              type="button"
                              variant="link"
                              onClick={() => handleAutoFill(invoice.id)}
                            >
                              Auto-fill
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        ) : formData.customer_id ? (
          <div className="mt-8">
            <Card>
              <div className="text-center py-4">
                <p className="text-gray-500">No outstanding invoices found for this customer.</p>
              </div>
            </Card>
          </div>
        ) : null}
        
        <div className="mt-4">
          <FormField
            label="Memo"
            htmlFor="memo"
          >
            <textarea
              id="memo"
              name="memo"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.memo}
              onChange={handleChange}
            />
          </FormField>
        </div>
        
        <div className="flex justify-end space-x-3 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/sales/payments')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Save Payment
          </Button>
        </div>
      </form>
    </FormLayout>
  );
}
