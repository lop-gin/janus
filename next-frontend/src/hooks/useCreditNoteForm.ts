
import { CreditNoteType, DocumentItem } from "@/types/document";
import { useDocumentForm } from "./useDocumentForm";
import { generateCreditNoteNumber } from "@/lib/document-utils";

export function useCreditNoteForm() {
  const initialCreditNote: CreditNoteType = {
    creditNoteNumber: generateCreditNoteNumber(),
    creditNoteDate: new Date(),
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
    document: creditNote,
    updateDocument: updateCreditNote,
    updateCustomer,
    addDocumentItem: addCreditNoteItem,
    updateDocumentItem: updateCreditNoteItem,
    removeDocumentItem: removeCreditNoteItem,
    clearAllItems,
    updateOtherFees,
    saveDocument: saveCreditNote
  } = useDocumentForm<CreditNoteType>(initialCreditNote);

  // Function to add multiple items at once (for populating from selected invoices/receipts)
  const addItems = (items: DocumentItem[]) => {
    // Ensure each item has valid properties and unique ID
    const processedItems = items.map(item => ({
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Create truly unique IDs
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
    updateCreditNote({
      items: [...creditNote.items, ...processedItems]
    } as Partial<CreditNoteType>);
  };

  // Function to set multiple items at once (replaces all items)
  const setItems = (items: DocumentItem[]) => {
    // Ensure each item has valid properties and unique ID
    const processedItems = items.map(item => ({
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // Create truly unique IDs
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      taxPercent: item.taxPercent || 0,
      serviceDate: item.serviceDate || "",
      category: item.category || "",
      unit: item.unit || "",
      rate: item.rate,
      amount: (item.quantity || 0) * (item.unitPrice || 0)
    }));
    
    updateCreditNote({ items: processedItems } as Partial<CreditNoteType>);
  };

  return {
    creditNote,
    updateCreditNote,
    updateCustomer,
    addCreditNoteItem,
    updateCreditNoteItem,
    removeCreditNoteItem,
    clearAllItems,
    updateOtherFees,
    saveCreditNote,
    setItems,
    addItems
  };
}
