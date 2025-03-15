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

export default function ProductionRecordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    operator_id: '',
    machine_id: '',
    start_time: '',
    end_time: '',
    notes: '',
  });
  
  // Input materials state
  const [inputMaterials, setInputMaterials] = useState<any[]>([]);
  
  // Output products state
  const [outputProducts, setOutputProducts] = useState<any[]>([]);
  
  // Mock data for dropdowns - in a real app, these would be fetched from the API
  const operators = [
    { value: '1', label: 'John Doe' },
    { value: '2', label: 'Jane Smith' },
    { value: '3', label: 'Bob Johnson' },
  ];
  
  const machines = [
    { value: '1', label: 'Mixer M1' },
    { value: '2', label: 'Extruder E1' },
    { value: '3', label: 'Packaging Line P1' },
  ];
  
  const rawMaterials = [
    { value: '1', label: 'Raw Material A' },
    { value: '2', label: 'Raw Material B' },
    { value: '3', label: 'Raw Material C' },
    { value: '4', label: 'Raw Material D' },
  ];
  
  const outputProductOptions = [
    { value: '1', label: 'Semi-finished Product X' },
    { value: '2', label: 'Semi-finished Product Y' },
    { value: '3', label: 'Semi-finished Product Z' },
  ];
  
  const unitOptions = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'l', label: 'Liters (l)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
  ];
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle input material changes
  const handleInputMaterialChange = (index: number, field: string, value: any) => {
    const updatedMaterials = [...inputMaterials];
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };
    
    // If material changes, update description
    if (field === 'material_id') {
      const selectedMaterial = rawMaterials.find(m => m.value === value);
      if (selectedMaterial) {
        updatedMaterials[index].description = selectedMaterial.label;
      }
    }
    
    setInputMaterials(updatedMaterials);
  };
  
  // Add new input material
  const handleAddInputMaterial = () => {
    setInputMaterials([
      ...inputMaterials,
      {
        material_id: '',
        description: '',
        quantity: '',
        unit_of_measure: 'kg',
      },
    ]);
  };
  
  // Remove input material
  const handleRemoveInputMaterial = (index: number) => {
    const updatedMaterials = inputMaterials.filter((_, i) => i !== index);
    setInputMaterials(updatedMaterials);
  };
  
  // Handle output product changes
  const handleOutputProductChange = (index: number, field: string, value: any) => {
    const updatedProducts = [...outputProducts];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    
    // If product changes, update description
    if (field === 'product_id') {
      const selectedProduct = outputProductOptions.find(p => p.value === value);
      if (selectedProduct) {
        updatedProducts[index].description = selectedProduct.label;
      }
    }
    
    setOutputProducts(updatedProducts);
  };
  
  // Add new output product
  const handleAddOutputProduct = () => {
    setOutputProducts([
      ...outputProducts,
      {
        product_id: '',
        description: '',
        quantity: '',
        unit_of_measure: 'kg',
      },
    ]);
  };
  
  // Remove output product
  const handleRemoveOutputProduct = (index: number) => {
    const updatedProducts = outputProducts.filter((_, i) => i !== index);
    setOutputProducts(updatedProducts);
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
      
      if (!formData.operator_id) {
        throw new Error('Please select an operator');
      }
      
      if (!formData.machine_id) {
        throw new Error('Please select a machine');
      }
      
      if (!formData.start_time || !formData.end_time) {
        throw new Error('Please specify start and end times');
      }
      
      if (inputMaterials.length === 0) {
        throw new Error('Please add at least one input material');
      }
      
      if (outputProducts.length === 0) {
        throw new Error('Please add at least one output product');
      }
      
      // Validate input materials
      for (const material of inputMaterials) {
        if (!material.material_id || !material.quantity || !material.unit_of_measure) {
          throw new Error('Please complete all input material fields');
        }
      }
      
      // Validate output products
      for (const product of outputProducts) {
        if (!product.product_id || !product.quantity || !product.unit_of_measure) {
          throw new Error('Please complete all output product fields');
        }
      }
      
      // In a real app, this would send data to the API
      console.log('Form data:', { 
        ...formData, 
        input_materials: inputMaterials,
        output_products: outputProducts
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Production record created successfully!');
      
      // In a real app, we would redirect to the production records list or detail page
      // setTimeout(() => router.push('/dashboard/production/production-records'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Input materials table columns
  const inputMaterialColumns = [
    {
      field: 'material_id',
      header: 'Raw Material',
      type: 'select' as const,
      options: rawMaterials,
      width: '30%',
    },
    {
      field: 'description',
      header: 'Description',
      type: 'text' as const,
      width: '30%',
    },
    {
      field: 'quantity',
      header: 'Quantity',
      type: 'number' as const,
      width: '20%',
    },
    {
      field: 'unit_of_measure',
      header: 'Unit',
      type: 'select' as const,
      options: unitOptions,
      width: '20%',
    },
  ];
  
  // Output products table columns
  const outputProductColumns = [
    {
      field: 'product_id',
      header: 'Output Product',
      type: 'select' as const,
      options: outputProductOptions,
      width: '30%',
    },
    {
      field: 'description',
      header: 'Description',
      type: 'text' as const,
      width: '30%',
    },
    {
      field: 'quantity',
      header: 'Quantity',
      type: 'number' as const,
      width: '20%',
    },
    {
      field: 'unit_of_measure',
      header: 'Unit',
      type: 'select' as const,
      options: unitOptions,
      width: '20%',
    },
  ];
  
  // Form actions
  const formActions = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => router.push('/dashboard/production/production-records')}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="primary"
        isLoading={isLoading}
      >
        Save Production Record
      </Button>
    </>
  );
  
  return (
    <FormLayout
      title="New Production Record"
      subtitle="Record production activities and material consumption"
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
              label="Operator"
              htmlFor="operator_id"
              required
            >
              <Select
                id="operator_id"
                name="operator_id"
                value={formData.operator_id}
                onChange={handleChange}
                options={operators}
                placeholder="Select an operator"
              />
            </FormField>
            
            <FormField
              label="Machine"
              htmlFor="machine_id"
              required
            >
              <Select
                id="machine_id"
                name="machine_id"
                value={formData.machine_id}
                onChange={handleChange}
                options={machines}
                placeholder="Select a machine"
              />
            </FormField>
          </div>
          
          <div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Start Time"
                htmlFor="start_time"
                required
              >
                <Input
                  id="start_time"
                  name="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={handleChange}
                />
              </FormField>
              
              <FormField
                label="End Time"
                htmlFor="end_time"
                required
              >
                <Input
                  id="end_time"
                  name="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={handleChange}
                />
              </FormField>
            </div>
            
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
          <h3 className="text-lg font-medium text-gray-900 mb-4">Input Materials</h3>
          
          <LineItemsTable
            items={inputMaterials}
            onAddItem={handleAddInputMaterial}
            onRemoveItem={handleRemoveInputMaterial}
            onItemChange={handleInputMaterialChange}
            columns={inputMaterialColumns}
            emptyMessage="No input materials added yet"
          />
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Output Products</h3>
          
          <LineItemsTable
            items={outputProducts}
            onAddItem={handleAddOutputProduct}
            onRemoveItem={handleRemoveOutputProduct}
            onItemChange={handleOutputProductChange}
            columns={outputProductColumns}
            emptyMessage="No output products added yet"
          />
        </div>
        
        <div className="flex justify-end space-x-3 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/production/production-records')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            Save Production Record
          </Button>
        </div>
      </form>
    </FormLayout>
  );
}
