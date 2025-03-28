
import { Document, DocumentItem } from "@/types/document";
import { useDocumentForm } from "./useDocumentForm";
import { generateEstimateNumber } from "@/lib/document-utils";
import { addDays } from "date-fns";

// Define the EstimateType interface
export interface EstimateType extends Document {
  estimateNumber: string;
  estimateDate: Date;
  expirationDate: Date;
}

export function useEstimateForm() {
  const initialEstimate: EstimateType = {
    estimateNumber: generateEstimateNumber(),
    estimateDate: new Date(),
    expirationDate: addDays(new Date(), 30), // Default to 30 days from now
    customer: {
      name: "",
      email: "",
      company: "",
      billingAddress: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
    },
    items: [
      {
        id: Date.now().toString(),
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
    ],
    messageOnInvoice: "",
    messageOnStatement: "",
    salesRep: "",
    tags: [],
    subTotal: 0,
    total: 0,
    balanceDue: 0,
    otherFees: {
      description: "",
      amount: undefined
    }
  };

  const {
    document: estimate,
    updateDocument: updateEstimate,
    updateCustomer,
    addDocumentItem: addEstimateItem,
    updateDocumentItem: updateEstimateItem,
    removeDocumentItem: removeEstimateItem,
    clearAllItems,
    updateOtherFees,
    saveDocument: saveEstimate
  } = useDocumentForm<EstimateType>(initialEstimate);

  // Function to add multiple items at once
  const addItems = (items: DocumentItem[]) => {
    // Ensure each item has valid properties and unique ID
    const processedItems = items.map(item => ({
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      taxPercent: item.taxPercent || 0,
      serviceDate: item.serviceDate || "",
      category: item.category || "",
      unit: item.unit || "",
      rate: item.rate,
      amount: (item.quantity || 0) * (item.unitPrice || 0)
    }));
    
    // Add to existing items instead of replacing them
    updateEstimate({
      items: [...estimate.items, ...processedItems]
    } as Partial<EstimateType>);
  };

  return {
    estimate,
    updateEstimate,
    updateCustomer,
    addEstimateItem,
    updateEstimateItem,
    removeEstimateItem,
    clearAllItems,
    updateOtherFees,
    saveEstimate,
    addItems
  };
}
