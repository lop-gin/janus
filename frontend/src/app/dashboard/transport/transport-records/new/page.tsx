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

export default function TransportRecordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    transporter_id: '',
    notes: '',
  });
  
  // Transport items state
  const [transportItems, setTransportItems] = useState<any[]>([]);
  
  // Mock data for dropdowns - in a real app, these would be fetched from the API
  const transporters = [
    { value: '1', label: 'John Doe' },
    { value: '2', label: 'Jane Smith' },
    { value: '3', label: 'Bob Johnson' },
  ];
  
  const products = [
    { value: '1', label: 'Raw Material A' },
    { value: '2', label: 'Raw Material B' },
    { value: '3', label: 'Semi-finished Product X' },
    { value: '4', label: 'Finished Product A' },
    { value: '5', label: 'Finished Product B' },
  ];
  
  const storageLocations = [
    { value: '1', label: 'Main Warehouse' },
    { value: '2', label: 'Production Floor Storage' },
    { value: '3', label: 'Finished Goods Storage' },
    { value: '4', label: 'Raw Materials Storage' },
    { value: '5', label: 'Distribution Center' },
  ];
  
  const unitOptions = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'l', label: 'Liters (l)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'box', label: 'Boxes' },
    { value: 'pallet', label: 'Pallets' },
  ];
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle transport item changes
  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...transportItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // If product_id changes, update description
    if (field === 'product_id') {
      const selectedProduct = products.find(p => p.value === value);
      if (selectedProduct) {
        updatedItems[index].description = selectedProduct.label;
      }
    }
    
    setTransportItems(updatedItems);
  };
  
  // Add new transport item
  const handleAddItem = () => {
    setTransportItems([
      ...transportItems,
      {
        product_id: '',
        description: '',
        quantity: '',
        unit_of_measure: 'pcs',
        from_location_id: '',
        to_location_id: '',
      },
    ]);
  };
  
  // Remove transport item
  const handleRemoveItem = (index: number) => {
    const updatedItems = transportItems.filter((_, i) => i !== index);
    setTransportItems(updatedItems);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form
      if (!formData.date) {
        throw new Error('Please select a date');
      }
      
      if (!formData.transporter_id) {
        throw new Error('Please select a transporter');
      }
      
      if (transportItems.length === 0) {
        throw new Error('Please add at least one transport item');
      }
      
      // Validate transport items
      for (const item of transportItems) {
        if (!item.product_id || !item.quantity || !item.unit_of_measure || !item.from_location_id || !item.to_location_id) {
          throw new Error('Please complete all transport item fields');
        }
        
        // Ensure from and to locations are different
        if (item.from_location_id === item.to_location_id) {
          throw new Error('From and To locations must be different');
        }
      }
      
      // In a real app, this would send data to the API
      console.log('Form data:', { 
        ...formData, 
        transport_items: transportItems
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Transport record created successfully!');
      
      // In a real app, we would redirect to the transport records list or detail page
      // setTimeout(() => router.push('/dashboard/transport/transport-records'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Transport items table columns
  const transportItemColumns = [
    {
      field: 'product_id',
      header: 'Product',
      type: 'select' as const,
      options: products,
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
      type: 'select' as const,
      options: unitOptions,
      width: '10%',
    },
    {
      field: 'from_location_id',
      header: 'From Location',
      type: 'select' as const,
      options: storageLocations,
      width: '25%',
    },
    {
      field: 'to_location_id',
      header: 'To Location',
      type: 'select' as const,
      options: storageLocations,
      width: '25%',
    },
  ];
  
  // Form actions
  const formActions = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push('/dashboard/transport/transport-records')}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
      >
        Save Transport Record
      </Button>
    </>
  );
  
  return (
    <FormLayout
      title="New Transport Record"
      subtitle="Record internal movement of products between storage locations"
      actions={formActions}
      isLoading={isLoading}
      error={error}
      success={success}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormField
              label="Date"
              htmlFor="date"
              required
            >
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
              />
            </FormField>
            
            <FormField
              label="Transporter"
              htmlFor="transporter_id"
              required
            >
              <Select
                id="transporter_id"
                name="transporter_id"
                value={formData.transporter_id}
                onChange={handleChange}
                options={transporters}
                placeholder="Select a transporter"
              />
            </FormField>
          </div>
          
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
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Transport Items</h3>
          
          <LineItemsTable
            items={transportItems}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onItemChange={handleItemChange}
            columns={transportItemColumns}
            emptyMessage="No transport items added yet"
          />
        </div>
        
        <div className="flex justify-end space-x-3 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/transport/transport-records')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Save Transport Record
          </Button>
        </div>
      </form>
    </FormLayout>
  );
}
