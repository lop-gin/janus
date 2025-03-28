// Utility functions for document generation and calculations

// Generate a random invoice number
export function generateInvoiceNumber(): string {
  return `INV-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
}

// Generate a random receipt number
export function generateReceiptNumber(): string {
  return `SR-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
}

// Generate a random credit note number
export function generateCreditNoteNumber(): string {
  return `CN-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
}

// Generate a unique refund receipt number
export const generateRefundReceiptNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().substring(2); // Get last 2 digits of year
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `RR-${year}${month}-${random}`;
};

// Generate a unique estimate number
export const generateEstimateNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().substring(2); // Get last 2 digits of year
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `EST-${year}${month}-${random}`;
};

// Calculate due date based on terms
export function calculateDueDate(invoiceDate: Date, terms: string): Date {
  const dueDate = new Date(invoiceDate);
  
  if (terms === "Net 15") {
    dueDate.setDate(dueDate.getDate() + 15);
  } else if (terms === "Net 30") {
    dueDate.setDate(dueDate.getDate() + 30);
  } else if (terms === "Net 45") {
    dueDate.setDate(dueDate.getDate() + 45);
  } else if (terms === "Net 60") {
    dueDate.setDate(dueDate.getDate() + 60);
  } else if (terms === "Due on receipt") {
    // No change, due date is same as invoice date
  }
  
  return dueDate;
}

// Format a number as a currency string without currency symbol
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}