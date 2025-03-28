import { InvoiceType, DocumentItem } from "@/types/document";
import { useDocumentForm } from "./useDocumentForm";
import { generateInvoiceNumber, calculateDueDate } from "@/lib/document-utils";

export function useInvoiceForm() {
  const initialInvoice: InvoiceType = {
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date(),
    dueDate: new Date(),
    terms: "Due on receipt",
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
    document: invoice,
    updateDocument: updateInvoice,
    updateCustomer,
    addDocumentItem: addInvoiceItem,
    updateDocumentItem: updateInvoiceItem,
    removeDocumentItem: removeInvoiceItem,
    clearAllItems,
    updateOtherFees,
    saveDocument: saveInvoiceToSupabase,
    isLoading,
    error
  } = useDocumentForm<InvoiceType>(initialInvoice);

  // Function to update terms and recalculate due date
  const updateTerms = (terms: string) => {
    const newDueDate = calculateDueDate(invoice.invoiceDate, terms);
    updateInvoice({ 
      terms,
      dueDate: newDueDate
    });
  };

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
    updateInvoice({
      items: [...invoice.items, ...processedItems]
    } as Partial<InvoiceType>);
  };

  // Function to save invoice
  const saveInvoice = async () => {
    return await saveInvoiceToSupabase('invoice');
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
    updateOtherFees,
    saveInvoice,
    addItems,
    isLoading,
    error
  };
}