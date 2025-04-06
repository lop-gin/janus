import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import api from "@/lib/api";
import { InvoiceType, DocumentItem, Customer, OtherFees } from "@/types/document";

/**
 * Custom hook to manage invoice form state and operations.
 * Provides functions to update invoice data, manage items, and save to the backend.
 */
export const useInvoiceForm = () => {
  const initialCustomer: Customer = {
    name: "",
    email: "",
    company: "",
    billing_address: { street: "", city: "", state: "", zipCode: "", country: "" },
  };

  const createEmptyItem = (): DocumentItem => {
    return {
      id: uuidv4(), // Use UUID for unique IDs
      product: "",
      customerproduct: "",
      description: "",
      quantity: 1,
      unit: "",
      unitPrice: 0,
      taxPercent: 0,
      amount: 0,
    };
  };

  const [invoice, setInvoice] = useState<InvoiceType>({
    invoiceNumber: `INV-${Date.now()}`,
    invoiceDate: new Date(),
    dueDate: new Date(),
    terms: "Due on receipt",
    customer: initialCustomer,
    items: [createEmptyItem()], // Start with 1 empty row with unique ID
    messageOnInvoice: "",
    messageOnStatement: "",
    tags: [],
    subTotal: 0,
    total: 0,
    balanceDue: 0,
    otherFees: { description: "", amount: 0 },
  });

  // Helper function to calculate totals including tax
  const calculateTotals = (items: DocumentItem[], otherFees: { description: string; amount?: number }) => {
    const subTotal = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unitPrice || 0)), 0);
    const taxTotal = items.reduce(
      (sum, item) => sum + (((item.quantity || 0) * (item.unitPrice || 0)) * ((item.taxPercent || 0) / 100)),
      0
    );
    const otherFeesAmount = otherFees?.amount || 0;
    const total = subTotal + taxTotal + otherFeesAmount;
    const balanceDue = total;
    return { subTotal, taxTotal, total, balanceDue };
  };

  // Update top-level invoice properties and recalculate totals if items or otherFees change
  const updateInvoice = (updates: Partial<InvoiceType>) => {
    setInvoice((prev) => {
      const newInvoice = { ...prev, ...updates };
      if (updates.items || updates.otherFees) {
        const { subTotal, total, balanceDue } = calculateTotals(
          newInvoice.items,
          newInvoice.otherFees || { description: "", amount: 0 }
        );
        return { ...newInvoice, subTotal, total, balanceDue };
      }
      return newInvoice;
    });
  };

  // Update customer details
  const updateCustomer = (customer: Customer) => {
    setInvoice((prev) => ({ ...prev, customer }));
  };

  // Add a new item to the invoice and recalculate totals
  const addInvoiceItem = () => {
    const newItem = createEmptyItem();
    setInvoice((prev) => {
      const items = [...prev.items, newItem];
      const { subTotal, total, balanceDue } = calculateTotals(items, prev.otherFees || { description: "", amount: 0 });
      return { ...prev, items, subTotal, total, balanceDue };
    });
  };

  // Update an existing item and recalculate totals
  const updateInvoiceItem = (itemId: string, updates: Partial<DocumentItem>) => {
    setInvoice((prev) => {
      const items = prev.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      const { subTotal, total, balanceDue } = calculateTotals(items, prev.otherFees || { description: "", amount: 0 });
      return { ...prev, items, subTotal, total, balanceDue };
    });
  };

  // Remove an item and recalculate totals, ensuring at least one item remains
  const removeInvoiceItem = (itemId: string) => {
    setInvoice((prev) => {
      let items = prev.items.filter((item) => item.id !== itemId);
      if (items.length === 0) {
        items = [createEmptyItem()];
      }
      const { subTotal, total, balanceDue } = calculateTotals(items, prev.otherFees || { description: "", amount: 0 });
      return { ...prev, items, subTotal, total, balanceDue };
    });
  };

  // Clear all items and reset to 1 empty item
  const clearAllItems = () => {
    setInvoice((prev) => {
      const items = [createEmptyItem()];
      const { subTotal, total, balanceDue } = calculateTotals(items, prev.otherFees || { description: "", amount: 0 });
      return { ...prev, items, subTotal, total, balanceDue };
    });
  };

  // Update terms and adjust due date accordingly
  const updateTerms = (terms: string) => {
    let dueDate = new Date(invoice.invoiceDate);
    switch (terms) {
      case "Due on receipt":
        break;
      case "Net 15":
        dueDate.setDate(dueDate.getDate() + 15);
        break;
      case "Net 30":
        dueDate.setDate(dueDate.getDate() + 30);
        break;
      case "Net 45":
        dueDate.setDate(dueDate.getDate() + 45);
        break;
      case "Net 60":
        dueDate.setDate(dueDate.getDate() + 60);
        break;
    }
    setInvoice((prev) => ({ ...prev, terms, dueDate }));
  };

  // Update other fees and recalculate totals
  const updateOtherFees = (updates: Partial<OtherFees>) => {
    setInvoice((prev) => {
      const prevOtherFees = prev.otherFees || { description: "", amount: 0 };
      const newOtherFees: OtherFees = { 
        description: updates.description !== undefined ? updates.description : prevOtherFees.description, 
        amount: updates.amount !== undefined ? updates.amount : prevOtherFees.amount 
      };
      const { subTotal, total, balanceDue } = calculateTotals(prev.items, newOtherFees);
      return { ...prev, otherFees: newOtherFees, subTotal, total, balanceDue };
    });
  };

  // Save invoice to the backend
  const saveInvoice = async () => {
    try {
      if (!invoice.customer.id) {
        alert("Please select a customer before saving the invoice.");
        return false;
      }

      const { subTotal, taxTotal, total, balanceDue } = calculateTotals(
        invoice.items,
        invoice.otherFees || { description: "", amount: 0 }
      );
      const invoiceData = {
        transaction_number: invoice.invoiceNumber,
        transaction_type: "invoice",
        customer_id: invoice.customer.id,
        sales_rep_id: invoice.salesRep ? parseInt(invoice.salesRep) : null,
        transaction_date: invoice.invoiceDate.toISOString().split("T")[0],
        due_date: invoice.dueDate.toISOString().split("T")[0],
        terms: invoice.terms,
        status: "due",
        message: invoice.messageOnInvoice,
        net_total: subTotal,
        tax_total: taxTotal,
        other_fees: invoice.otherFees?.amount || 0,
        gross_total: total,
        items: invoice.items.map((item) => ({
          product_id: item.product && !isNaN(parseInt(item.product)) ? parseInt(item.product) : null,
          description: item.description,
          quantity: item.quantity || 0,
          unit_of_measure: item.unit || "",
          unit_price: item.unitPrice || 0,
          tax_percent: item.taxPercent || 0,
          amount: (item.quantity || 0) * (item.unitPrice || 0),
        })),
      };
      const response = await api.post("http://127.0.0.1:8000/invoices", invoiceData);
      console.log("Invoice saved:", response.data);
      return true;
    } catch (error) {
      console.error("Failed to save invoice:", error);
      return false;
    }
  };

  // Reset the form to initial state with 1 empty item
  const clearForm = () => {
    setInvoice({
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: new Date(),
      dueDate: new Date(),
      terms: "Due on receipt",
      customer: initialCustomer,
      items: [createEmptyItem()],
      messageOnInvoice: "",
      messageOnStatement: "",
      tags: [],
      subTotal: 0,
      total: 0,
      balanceDue: 0,
      otherFees: { description: "", amount: 0 },
    });
  };

  return {
    invoice,
    updateInvoice,
    updateCustomer,
    addInvoiceItem,
    updateInvoiceItem,
    removeInvoiceItem,
    clearAllItems,
    updateTerms,
    saveInvoice,
    updateOtherFees,
    clearForm,
  };
};