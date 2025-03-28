import { SalesReceiptType, DocumentItem } from "@/types/document";
import { useDocumentForm } from "./useDocumentForm";
import { generateReceiptNumber } from "@/lib/document-utils";

export function useSalesReceiptForm() {
  const initialSalesReceipt: SalesReceiptType = {
    receiptNumber: generateReceiptNumber(),
    saleDate: new Date(),
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
        customerproduct: "",
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
    document: salesReceipt,
    updateDocument: updateSalesReceipt,
    updateCustomer,
    addDocumentItem: addSalesReceiptItem,
    updateDocumentItem: updateSalesReceiptItem,
    removeDocumentItem: removeSalesReceiptItem,
    clearAllItems,
    updateOtherFees,
    saveDocument: saveSalesReceipt
  } = useDocumentForm<SalesReceiptType>(initialSalesReceipt);

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
    updateSalesReceipt({
      items: [...salesReceipt.items, ...processedItems]
    } as Partial<SalesReceiptType>);
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
    addItems
  };
}
