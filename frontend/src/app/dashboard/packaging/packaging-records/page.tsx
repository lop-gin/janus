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

export default function PackagingRecordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    packaging_person_id: '',
    notes: '',
  });
  
  // Packaging items state
  const [packagingItems, setPackagingItems] = useState<any[]>([]);
  
  // Mock data for dropdowns - in a real app, these would be fetched from the API
  const packagingPersons = [
    { value: '1', label: 'John Doe' },
    { value: '2', label: 'Jane Smith' },
    { value: '3', label: 'Bob Johnson' },
  ];
  
  const productionProducts = [
    { value: '1', label: 'Semi-finished Product X' },
    { value: '2', label: 'Semi-finished Product Y' },
    { value: '3', label: 'Semi-finished Product Z' },
  ];
  
  const salesProducts = [
    { value: '101', label: 'Finished Product A' },
    { value: '102', label: 'Finished Product B' },
    { value: '103', label: 'Finished Product C' },
  ];
  
  const storageLocations = [
    { value: '1', label: 'Main Warehouse' },
    { value: '2', label: 'Production Floor Storage' },
    { value: '3', label: 'Finished Goods Storage' },
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
  
  // Handle packaging item changes
  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...packagingItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // If from_product_id changes, update description
    if (field === 'from_product_id') {
      const selectedProduct = productionProducts.find(p => p.value === value);
      if (selectedProduct) {
        updatedItems[index].from_description = selectedProduct.label;
      }
    }
    
    // If to_product_id changes, update description
    if (field === 'to_product_id') {
      const selectedProduct = salesProducts.find(p => p.value === value);
      if (selectedProduct) {
        updatedItems[index].to_description = selectedProduct.label;
      }
    }
    
    setPackagingItems(updatedItems);
  };
  
  // Add new packaging item
  const handleAddItem = () => {
    setPackagingItems([
      ...packagingItems,
      {
        from_product_id: '',
        from_description: '',
        to_product_id: '',
        to_description: '',
        quantity: '',
        unit_of_measure: 'pcs',
        storage_location_id: '',
      },
    ]);
  };
  
  // Remove packaging item
  const handleRemoveItem = (index: number) => {
    const updatedItems = packagingItems.filter((_, i) => i !== index);
    setPackagingItems(updatedItems);
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
      
      if (!formData.packaging_person_id) {
        throw new Error('Please select a packaging person');
      }
      
      if (packagingItems.length === 0) {
        throw new Error('Please add at least one packaging item');
      }
      
      // Validate packaging items
      for (const item of packagingItems) {
        if (!item.from_product_id || !item.to_product_id || !item.quantity || !item.unit_of_measure || !item.storage_location_id) {
          throw new Error('Please complete all packaging item fields');
        }
      }
      
      // In a real app, this would send data to the API
      console.log('Form data:', { 
        ...formData, 
        packaging_items: packagingItems
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Packaging record created successfully!');
      
      // In a real app, we would redirect to the packaging records list or detail page
      // setTimeout(() => router.push('/dashboard/packaging/packaging-records'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Packaging items table columns
  const packagingItemColumns = [
    {
      field: 'from_product_id',
      header: 'From (Production)',
      type: 'select' as const,
      options: productionProducts,
      width: '20%',
    },
    {
      field: 'to_product_id',
      header: 'To (Sales)',
      type: 'select' as const,
      options: salesProducts,
      width: '20%',
    },
    {
      field: 'quantity',
      header: 'Quantity',
      type: 'number' as const,
      width: '15%',
    },
    {
      field: 'unit_of_measure',
      header: 'Unit',
      type: 'select' as const,
      options: unitOptions,
      width: '15%',
    },
    {
      field: 'storage_location_id',
      header: 'Storage Location',
      type: 'select' as const,
      options: storageLocations,
      width: '20%',
    },
  ];
  
  // Form actions
  const formActions = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push('/dashboard/packaging/packaging-records')}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
      >
        Save Packaging Record
      </Button>
    </>
  );
  
  return (
    <FormLayout
      title="New Packaging Record"
      subtitle="Record packaging of production items into sales-ready products"
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
              label="Packaging Person"
              htmlFor="packaging_person_id"
              required
            >
              <Select
                id="packaging_person_id"
                name="packaging_person_id"
                value={formData.packaging_person_id}
                onChange={handleChange}
                options={packagingPersons}
                placeholder="Select a packaging person"
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">Packaging Items</h3>
          
          <LineItemsTable
            items={packagingItems}
            onAddItem={handleAddItem}
            onRemoveItem={handleRemoveItem}
            onItemChange={handleItemChange}
            columns={packagingItemColumns}
            emptyMessage="No packaging items added yet"
          />
        </div>
        
        <div className="flex justify-end space-x-3 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/packaging/packaging-records')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Save Packaging Record
          </Button>
        </div>
      </form>
    </FormLayout>
  );
}
