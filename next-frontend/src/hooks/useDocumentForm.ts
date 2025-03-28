import { useState } from "react";
import { Document, DocumentItem, Customer, OtherFees } from "@/types/document";
import { supabase } from "@/lib/supabase/client";

export function useDocumentForm<T extends Document>(initialState: T) {
  const [document, setDocument] = useState<T>(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to update document state
  const updateDocument = (updates: Partial<T>) => {
    setDocument((prev) => {
      const newDocument = { ...prev, ...updates };
      
      // Recalculate totals
      const subTotal = newDocument.items.reduce(
        (sum, item) => sum + ((item.quantity || 0) * ((item.unitPrice || 0) || (item.rate || 0))),
        0
      );
      
      const tax = newDocument.items.reduce((sum, item) => {
        const itemAmount = (item.quantity || 0) * ((item.unitPrice || 0) || (item.rate || 0));
        return sum + (itemAmount * (((item.taxPercent || 0)) / 100));
      }, 0);
      
      const otherFeesAmount = newDocument.otherFees?.amount || 0;
      const total = subTotal + tax + otherFeesAmount;
      const balanceDue = total;
      
      return {
        ...newDocument,
        subTotal,
        total,
        balanceDue
      } as T;
    });
  };

  // Function to update customer
  const updateCustomer = (customer: Customer) => {
    updateDocument({ customer } as Partial<T>);
  };

  // Function to update other fees
  const updateOtherFees = (updates: Partial<OtherFees>) => {
    setDocument((prev) => {
      const newOtherFees = { ...(prev.otherFees || { description: "", amount: undefined }), ...updates };
      
      // Trigger a recalculation of totals
      const updatedDoc = {
        ...prev,
        otherFees: newOtherFees
      } as T;
      
      updateDocument(updatedDoc);
      
      return updatedDoc;
    });
  };

  // Function to add a new item
  const addDocumentItem = () => {
    updateDocument({
      items: [
        ...document.items,
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          serviceDate: "",
          category: "",
          product: "",
          description: "",
          quantity: undefined,
          unit: "",
          unitPrice: undefined,
          rate: undefined,
          taxPercent: undefined,
          amount: 0,
        },
      ],
    } as Partial<T>);
  };

  // Function to update an item
  const updateDocumentItem = (itemId: string, updates: Partial<DocumentItem>) => {
    const updatedItems = document.items.map((item) => {
      if (item.id === itemId) {
        const updatedItem = { ...item, ...updates };
        // Calculate the amount
        updatedItem.amount = (updatedItem.quantity || 0) * ((updatedItem.unitPrice || 0) || (updatedItem.rate || 0));
        return updatedItem;
      }
      return item;
    });
    
    updateDocument({ items: updatedItems } as Partial<T>);
  };

  // Function to remove an item
  const removeDocumentItem = (itemId: string) => {
    // Only remove if there's more than one item
    if (document.items.length > 1) {
      updateDocument({
        items: document.items.filter((item) => item.id !== itemId),
      } as Partial<T>);
    }
  };

  // Function to clear all items but leave one empty item
  const clearAllItems = () => {
    updateDocument({
      items: [
        {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          serviceDate: "",
          category: "",
          product: "",
          description: "",
          quantity: undefined,
          unit: "",
          unitPrice: undefined,
          rate: undefined,
          taxPercent: undefined,
          amount: 0,
        }
      ]
    } as Partial<T>);
  };

  // Function to save document to Supabase
  const saveDocument = async (documentType: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First, save or update the customer if it doesn't have an ID
      let customerId = document.customer.id;
      
      if (!customerId && document.customer.name) {
        // Check if customer already exists by email
        if (document.customer.email) {
          const { data: existingCustomers } = await supabase
            .from('customers')
            .select('id')
            .eq('email', document.customer.email)
            .maybeSingle();
            
          if (existingCustomers) {
            customerId = existingCustomers.id;
          }
        }
        
        // If no existing customer, create a new one
        if (!customerId) {
          const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert({
              name: document.customer.name,
              email: document.customer.email,
              company: document.customer.company,
              street: document.customer.billingAddress.street,
              city: document.customer.billingAddress.city,
              state: document.customer.billingAddress.state,
              zip_code: document.customer.billingAddress.zipCode,
              country: document.customer.billingAddress.country
            })
            .select('id')
            .single();
            
          if (customerError) throw new Error(`Error creating customer: ${customerError.message}`);
          customerId = newCustomer.id;
        }
      }
      
      // Prepare document data based on document type
      let documentData: any = {
        document_type: documentType,
        customer_id: customerId,
        total_amount: document.total,
        balance_due: document.balanceDue,
        message_on_invoice: document.messageOnInvoice,
        message_on_statement: document.messageOnStatement,
        sales_rep: document.salesRep,
        tags: document.tags,
        status: 'draft'
      };
      
      // Add specific fields based on document type
      if (documentType === 'invoice') {
        const invoiceDoc = document as any;
        documentData = {
          ...documentData,
          document_number: invoiceDoc.invoiceNumber,
          issue_date: invoiceDoc.invoiceDate,
          due_date: invoiceDoc.dueDate
        };
      }
      
      // Save the document
      const { data: savedDocument, error: documentError } = await supabase
        .from('documents')
        .insert(documentData)
        .select('id')
        .single();
        
      if (documentError) throw new Error(`Error creating document: ${documentError.message}`);
      
      // Save document items
      const documentItems = document.items.map(item => ({
        document_id: savedDocument.id,
        product: item.product,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unitPrice,
        tax_percent: item.taxPercent,
        amount: item.amount,
        service_date: item.serviceDate,
        category: item.category
      }));
      
      const { error: itemsError } = await supabase
        .from('document_items')
        .insert(documentItems);
        
      if (itemsError) throw new Error(`Error creating document items: ${itemsError.message}`);
      
      // Save other fees if present
      if (document.otherFees && document.otherFees.amount) {
        const { error: feesError } = await supabase
          .from('other_fees')
          .insert({
            document_id: savedDocument.id,
            description: document.otherFees.description,
            amount: document.otherFees.amount
          });
          
        if (feesError) throw new Error(`Error creating other fees: ${feesError.message}`);
      }
      
      return savedDocument.id;
    } catch (err: any) {
      setError(err.message);
      console.error('Error saving document:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    document,
    updateDocument,
    updateCustomer,
    addDocumentItem,
    updateDocumentItem,
    removeDocumentItem,
    clearAllItems,
    updateOtherFees,
    saveDocument,
    isLoading,
    error
  };
}