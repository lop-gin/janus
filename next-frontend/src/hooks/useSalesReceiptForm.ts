import { useState } from "react";
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique IDs
import api from "@/lib/api";
import { SalesReceiptType, DocumentItem, Customer, OtherFees } from "@/types/document";

/**
 * Custom hook to manage sales receipt form state and operations.
 * Provides functions to update sales receipt data, manage items, and save to the backend.
 */
export const useSalesReceiptForm = () => {
  const initialCustomer: Customer = {
    name: "",
    email: "",
    company: "",
    billing_address: { street: "", city: "", state: "", zipCode: "", country: "" },
  };

  // Function to create an empty item with a unique UUID
  const createEmptyItem = (): DocumentItem => {
    return {
      id: uuidv4(), // Generate a unique ID using uuid
      product: "",
      customerproduct: "", // Included for consistency with invoice, though not sent to backend
      description: "",
      quantity: 1, // Default quantity set to 1
      unit: "",
      unitPrice: 0,
      taxPercent: 0,
      amount: 0,
    };
  };

  const [salesReceipt, setSalesReceipt] = useState<SalesReceiptType>({
    receiptNumber: `SR-${Date.now()}`,
    saleDate: new Date(),
    customer: initialCustomer,
    items: [createEmptyItem()], // Start with one empty item
    messageOnInvoice: "",
    messageOnStatement: "",
    salesRep: "",
    tags: [],
    subTotal: 0,
    total: 0,
    balanceDue: 0, // Typically 0 for sales receipts as payment is immediate
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
    const balanceDue = 0; // For sales receipts, balance due is 0 since payment is immediate
    return { subTotal, taxTotal, total, balanceDue };
  };

  // Update top-level sales receipt properties and recalculate totals if items or otherFees change
  const updateSalesReceipt = (updates: Partial<SalesReceiptType>) => {
    setSalesReceipt((prev) => {
      const newSalesReceipt = { ...prev, ...updates };
      if (updates.items || updates.otherFees) {
        const { subTotal, total, balanceDue } = calculateTotals(
          newSalesReceipt.items,
          newSalesReceipt.otherFees || { description: "", amount: 0 }
        );
        return { ...newSalesReceipt, subTotal, total, balanceDue };
      }
      return newSalesReceipt;
    });
  };

  // Update customer details
  const updateCustomer = (customer: Customer) => {
    setSalesReceipt((prev) => ({ ...prev, customer }));
  };

  // Add a new item to the sales receipt and recalculate totals
  const addSalesReceiptItem = () => {
    const newItem = createEmptyItem();
    setSalesReceipt((prev) => {
      const items = [...prev.items, newItem];
      const { subTotal, total, balanceDue } = calculateTotals(items, prev.otherFees || { description: "", amount: 0 });
      return { ...prev, items, subTotal, total, balanceDue };
    });
  };

  // Update an existing item and recalculate totals
  const updateSalesReceiptItem = (itemId: string, updates: Partial<DocumentItem>) => {
    setSalesReceipt((prev) => {
      const items = prev.items.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      const { subTotal, total, balanceDue } = calculateTotals(items, prev.otherFees || { description: "", amount: 0 });
      return { ...prev, items, subTotal, total, balanceDue };
    });
  };

  // Remove an item and recalculate totals, ensuring at least one item remains
  const removeSalesReceiptItem = (itemId: string) => {
    setSalesReceipt((prev) => {
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
    setSalesReceipt((prev) => {
      const items = [createEmptyItem()];
      const { subTotal, total, balanceDue } = calculateTotals(items, prev.otherFees || { description: "", amount: 0 });
      return { ...prev, items, subTotal, total, balanceDue };
    });
  };

  // Update other fees and recalculate totals
  const updateOtherFees = (updates: Partial<OtherFees>) => {
    setSalesReceipt((prev) => {
      const prevOtherFees = prev.otherFees || { description: "", amount: 0 };
      const newOtherFees: OtherFees = {
        description: updates.description !== undefined ? updates.description : prevOtherFees.description,
        amount: updates.amount !== undefined ? updates.amount : prevOtherFees.amount,
      };
      const { subTotal, total, balanceDue } = calculateTotals(prev.items, newOtherFees);
      return { ...prev, otherFees: newOtherFees, subTotal, total, balanceDue };
    });
  };

  // Save sales receipt to the backend
  const saveSalesReceipt = async () => {
    try {
      if (!salesReceipt.customer.id) {
        alert("Please select a customer before saving the sales receipt.");
        return false;
      }

      const { subTotal, taxTotal, total } = calculateTotals(
        salesReceipt.items,
        salesReceipt.otherFees || { description: "", amount: 0 }
      );
      const salesReceiptData = {
        transaction_number: salesReceipt.receiptNumber,
        transaction_type: "sales_receipt",
        customer_id: salesReceipt.customer.id,
        sales_rep_id: salesReceipt.salesRep ? parseInt(salesReceipt.salesRep) : null,
        transaction_date: salesReceipt.saleDate.toISOString().split("T")[0],
        status: "paid", // Sales receipts are typically paid immediately
        message: salesReceipt.messageOnInvoice,
        net_total: subTotal,
        tax_total: taxTotal,
        other_fees: salesReceipt.otherFees?.amount || 0,
        gross_total: total,
        items: salesReceipt.items.map((item) => ({
          product_id: item.product && !isNaN(parseInt(item.product)) ? parseInt(item.product) : null,
          description: item.description,
          quantity: item.quantity || 0,
          unit_of_measure: item.unit || "",
          unit_price: item.unitPrice || 0,
          tax_percent: item.taxPercent || 0,
          amount: (item.quantity || 0) * (item.unitPrice || 0),
        })),
      };
      const response = await api.post("/sales-receipts", salesReceiptData);
      console.log("Sales receipt saved:", response.data);
      return true;
    } catch (error) {
      console.error("Failed to save sales receipt:", error);
      return false;
    }
  };

  // Reset the form to initial state with 1 empty item
  const clearForm = () => {
    setSalesReceipt({
      receiptNumber: `SR-${Date.now()}`,
      saleDate: new Date(),
      customer: initialCustomer,
      items: [createEmptyItem()],
      messageOnInvoice: "",
      messageOnStatement: "",
      salesRep: "",
      tags: [],
      subTotal: 0,
      total: 0,
      balanceDue: 0,
      otherFees: { description: "", amount: 0 },
    });
  };

  return {
    salesReceipt,
    updateSalesReceipt,
    updateCustomer,
    addSalesReceiptItem,
    updateSalesReceiptItem,
    removeSalesReceiptItem,
    clearAllItems,
    updateOtherFees,
    saveSalesReceipt,
    clearForm,
  };
};