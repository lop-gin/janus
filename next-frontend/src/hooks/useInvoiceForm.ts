import { useState } from "react";
import axios from "axios";
import { InvoiceType, DocumentItem, Customer } from "@/types/document";

export const useInvoiceForm = () => {
  const initialCustomer: Customer = {
    name: "",
    email: "",
    company: "",
    billingAddress: { street: "", city: "", state: "", zipCode: "", country: "" },
  };

  const [invoice, setInvoice] = useState<InvoiceType>({
    invoiceNumber: `INV-${Date.now()}`, // Temporary number
    invoiceDate: new Date(),
    dueDate: new Date(),
    terms: "Due on receipt",
    customer: initialCustomer,
    items: [],
    messageOnInvoice: "",
    messageOnStatement: "",
    tags: [],
    subTotal: 0,
    total: 0,
    balanceDue: 0,
    otherFees: { description: "", amount: 0 },
  });

  const updateInvoice = (updates: Partial<InvoiceType>) => {
    setInvoice((prev) => ({ ...prev, ...updates }));
  };

  const updateCustomer = (customer: Customer) => {
    setInvoice((prev) => ({ ...prev, customer }));
  };

  const addInvoiceItem = () => {
    const newItem: DocumentItem = {
      id: Date.now().toString(),
      product: "",
      description: "",
      quantity: 1,
      unit: "",
      unitPrice: 0,
      taxPercent: 0,
      amount: 0,
    };
    setInvoice((prev) => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const updateInvoiceItem = (index: number, updates: Partial<DocumentItem>) => {
    setInvoice((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], ...updates };
      const subTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
      const total = subTotal + (prev.otherFees?.amount || 0);
      return { ...prev, items, subTotal, total, balanceDue: total };
    });
  };

  const removeInvoiceItem = (index: number) => {
    setInvoice((prev) => {
      const items = prev.items.filter((_, i) => i !== index);
      const subTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
      const total = subTotal + (prev.otherFees?.amount || 0);
      return { ...prev, items, subTotal, total, balanceDue: total };
    });
  };

  const clearAllItems = () => {
    setInvoice((prev) => ({ ...prev, items: [], subTotal: 0, total: prev.otherFees?.amount || 0, balanceDue: prev.otherFees?.amount || 0 }));
  };

  const updateTerms = (terms: string) => {
    let dueDate = invoice.dueDate;
    switch (terms) {
      case "Due on receipt":
        dueDate = invoice.invoiceDate;
        break;
      case "Net 15":
        dueDate = new Date(invoice.invoiceDate);
        dueDate.setDate(dueDate.getDate() + 15);
        break;
      case "Net 30":
        dueDate = new Date(invoice.invoiceDate);
        dueDate.setDate(dueDate.getDate() + 30);
        break;
      case "Net 45":
        dueDate = new Date(invoice.invoiceDate);
        dueDate.setDate(dueDate.getDate() + 45);
        break;
      case "Net 60":
        dueDate = new Date(invoice.invoiceDate);
        dueDate.setDate(dueDate.getDate() + 60);
        break;
    }
    setInvoice((prev) => ({ ...prev, terms, dueDate }));
  };

  const updateOtherFees = (otherFees: { description: string; amount?: number }) => {
    const amount = otherFees.amount || 0;
    setInvoice((prev) => {
      const total = prev.subTotal + amount;
      return { ...prev, otherFees, total, balanceDue: total };
    });
  };

  const saveInvoice = async () => {
    try {
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
        net_total: invoice.subTotal,
        tax_total: invoice.items.reduce((sum, item) => sum + (item.taxPercent || 0) * (item.amount || 0) / 100, 0),
        other_fees: invoice.otherFees?.amount || 0,
        gross_total: invoice.total,
        items: invoice.items.map((item) => ({
          product_id: item.product ? parseInt(item.product) : null,
          description: item.description,
          quantity: item.quantity || 0,
          unit_of_measure: item.unit || "",
          unit_price: item.unitPrice || 0,
          tax_percent: item.taxPercent || 0,
          amount: item.amount || 0,
        })),
      };
      const response = await axios.post("http://127.0.0.1:8000/invoices", invoiceData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}` },
      });
      console.log("Invoice saved:", response.data);
      return true;
    } catch (error) {
      console.error("Failed to save invoice", error);
      return false;
    }
  };

  const clearForm = () => {
    setInvoice({
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: new Date(),
      dueDate: new Date(),
      terms: "Due on receipt",
      customer: initialCustomer,
      items: [],
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