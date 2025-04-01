export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Customer {
  id?: number;
  company_id?: number; // Optional since it’s not used in the form
  name: string;
  company?: string;
  email?: string;
  billing_address: Address; // Use Address type
  initial_balance?: number;
}

export interface DocumentItem {
  id: string;
  serviceDate?: string;
  category?: string;
  product: string;
  customerproduct: string;
  description: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  rate?: number;
  taxPercent?: number;
  amount: number;
}

export interface OtherFees {
  description: string;
  amount?: number;
}

// Base document type that can be extended by specific document types
export interface Document {
  customer: Customer;
  items: DocumentItem[];
  messageOnInvoice: string;
  messageOnStatement: string;
  salesRep?: string;
  tags?: string[];
  subTotal: number;
  total: number;
  balanceDue: number;
  otherFees?: OtherFees;
}

// Invoice specific fields
export interface InvoiceType extends Document {
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  terms: string;
}

// Sales Receipt specific fields
export interface SalesReceiptType extends Document {
  receiptNumber: string;
  saleDate: Date;
}

// Credit Note specific fields
export interface CreditNoteType extends Document {
  creditNoteNumber: string;
  creditNoteDate: Date;
}

// Refund Receipt specific fields
export interface RefundReceiptType extends Document {
  refundReceiptNumber: string;
  refundReceiptDate: Date;
  referencedTransactions?: string[];
}

// Estimate specific fields
export interface EstimateType extends Document {
  estimateNumber: string;
  estimateDate: Date;
  expirationDate: Date;
}

// Payment specific types
export interface OutstandingInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  status: 'open' | 'overdue' | 'paid' | 'partial';
  originalAmount: number;
  paymentReceived: number;
  openBalance: number;
  payment?: number;
  selected: boolean;
}

export interface PaymentType extends Document {
  paymentId: string;
  customerId: string;
  paymentDate: Date;
  paymentMethod: string;
  referenceNumber?: string;
  depositToAccount: string;
  memo?: string;
  amount: number;
  outstandingInvoices: OutstandingInvoice[];
  total: number;
  balanceDue: number;
  otherFees?: OtherFees;
  amountReceived: number;
  amountToApply: number;
  amountToCredit: number;
}