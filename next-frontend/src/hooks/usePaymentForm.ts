
import { useState, useEffect } from "react";
import { Customer, OutstandingInvoice, PaymentType } from "@/types/document";

// Mock data for outstanding invoices
const mockOutstandingInvoices: OutstandingInvoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-001",
    invoiceDate: new Date(2025, 0, 14), // Jan 14, 2025
    dueDate: new Date(2025, 1, 14),     // Feb 14, 2025
    status: "open",
    originalAmount: 300,
    paymentReceived: 0,
    openBalance: 300,
    payment: 0,
    selected: false
  },
  {
    id: "2",
    invoiceNumber: "INV-002",
    invoiceDate: new Date(2025, 0, 20), // Jan 20, 2025
    dueDate: new Date(2025, 1, 20),     // Feb 20, 2025
    status: "open",
    originalAmount: 100,
    paymentReceived: 0,
    openBalance: 100,
    payment: 0,
    selected: false
  },
  {
    id: "3",
    invoiceNumber: "INV-003",
    invoiceDate: new Date(2025, 0, 25), // Jan 25, 2025
    dueDate: new Date(2025, 1, 25),     // Feb 25, 2025
    status: "open",
    originalAmount: 200,
    paymentReceived: 0,
    openBalance: 200,
    payment: 0,
    selected: false
  }
];

export function usePaymentForm() {
  const initialPayment: PaymentType = {
    paymentId: `PMT-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`,
    paymentDate: new Date(),
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
    amountReceived: 0,
    outstandingInvoices: [],
    messageOnInvoice: "",
    amountToApply: 0,
    amountToCredit: 0
  };

  const [payment, setPayment] = useState<PaymentType>(initialPayment);
  const [totalOpenBalance, setTotalOpenBalance] = useState(0);

  // Update customer information
  const updateCustomer = (customer: Customer) => {
    // When customer changes, load their outstanding invoices
    // In a real app, this would fetch from API
    setPayment(prev => {
      const newPayment = { 
        ...prev, 
        customer,
        // Only load invoices if customer has a name
        outstandingInvoices: customer.name ? 
          // Sort by invoice date, oldest first for applying payments
          [...mockOutstandingInvoices].sort(
            (a, b) => a.invoiceDate.getTime() - b.invoiceDate.getTime()
          ) : 
          []
      };
      
      return newPayment;
    });
  };

  // Update payment date
  const updatePaymentDate = (date: Date) => {
    setPayment(prev => ({
      ...prev,
      paymentDate: date
    }));
  };

  // Update the amount received
  const updateAmountReceived = (amount: number) => {
    setPayment(prev => {
      const newPayment = {
        ...prev,
        amountReceived: amount
      };
      
      // Auto-distribute the payment if amount changed
      distributePayment(newPayment, amount);
      
      return newPayment;
    });
  };

  // Toggle invoice selection
  const toggleInvoiceSelection = (invoiceId: string) => {
    setPayment(prev => {
      const newOutstandingInvoices = prev.outstandingInvoices.map(invoice => {
        if (invoice.id === invoiceId) {
          const newSelected = !invoice.selected;
          
          return {
            ...invoice,
            selected: newSelected,
            // If newly selected, set payment to open balance, otherwise set to 0
            payment: newSelected ? invoice.openBalance : 0
          };
        }
        return invoice;
      });
      
      const newPayment = {
        ...prev,
        outstandingInvoices: newOutstandingInvoices
      };
      
      // Recalculate amount received based on selected invoices
      calculateAmountReceived(newPayment);
      
      return newPayment;
    });
  };

  // Update payment for a specific invoice
  const updateInvoicePayment = (invoiceId: string, amount: number) => {
    setPayment(prev => {
      const newOutstandingInvoices = prev.outstandingInvoices.map(invoice => {
        if (invoice.id === invoiceId) {
          // Ensure payment doesn't exceed open balance
          const payment = Math.min(amount, invoice.openBalance);
          
          return {
            ...invoice,
            payment,
            // Auto-select if payment > 0
            selected: payment > 0
          };
        }
        return invoice;
      });
      
      const newPayment = {
        ...prev,
        outstandingInvoices: newOutstandingInvoices
      };
      
      // Recalculate amount received based on payments
      calculateAmountReceived(newPayment);
      
      return newPayment;
    });
  };

  // Clear all payments
  const clearPayment = () => {
    setPayment(prev => {
      const clearedInvoices = prev.outstandingInvoices.map(invoice => ({
        ...invoice,
        payment: 0,
        selected: false
      }));
      
      return {
        ...prev,
        outstandingInvoices: clearedInvoices,
        amountReceived: 0,
        amountToApply: 0,
        amountToCredit: 0
      };
    });
  };

  // Save the payment
  const savePayment = () => {
    console.log("Saving payment:", payment);
    // In a real app, you would send this to your backend
  };

  // Helper: Calculate amount received based on invoice payments
  const calculateAmountReceived = (paymentObj: PaymentType) => {
    const totalPayments = paymentObj.outstandingInvoices.reduce(
      (sum, invoice) => sum + (invoice.payment || 0),
      0
    );
    
    paymentObj.amountToApply = totalPayments;
    paymentObj.amountReceived = totalPayments;
    paymentObj.amountToCredit = 0; // Reset credit
  };

  // Helper: Distribute payment amount to invoices starting from oldest
  const distributePayment = (paymentObj: PaymentType, amount: number) => {
    let remainingAmount = amount;
    
    // Reset all payments and selections
    const updatedInvoices = paymentObj.outstandingInvoices.map(invoice => ({
      ...invoice,
      payment: 0,
      selected: false
    }));
    
    // Distribute starting from first invoice (oldest)
    for (let i = 0; i < updatedInvoices.length && remainingAmount > 0; i++) {
      const invoice = updatedInvoices[i];
      
      // Apply payment to this invoice
      const paymentForInvoice = Math.min(remainingAmount, invoice.openBalance);
      
      if (paymentForInvoice > 0) {
        invoice.payment = paymentForInvoice;
        invoice.selected = true;
        remainingAmount -= paymentForInvoice;
      }
    }
    
    paymentObj.outstandingInvoices = updatedInvoices;
    paymentObj.amountToApply = amount;
    
    // If there's remaining amount after applying to all invoices, it's credit
    paymentObj.amountToCredit = Math.max(0, remainingAmount);
  };

  // Calculate totals whenever outstandingInvoices changes
  useEffect(() => {
    // Calculate total open balance
    const openBalanceTotal = payment.outstandingInvoices.reduce(
      (sum, invoice) => sum + invoice.openBalance,
      0
    );
    setTotalOpenBalance(openBalanceTotal);
    
    // Calculate amount to apply (sum of all payments)
    const amountToApply = payment.outstandingInvoices.reduce(
      (sum, invoice) => sum + (invoice.payment || 0),
      0
    );
    
    // Calculate amount to credit
    const amountToCredit = Math.max(0, payment.amountReceived - amountToApply);
    
    setPayment(prev => ({
      ...prev,
      amountToApply,
      amountToCredit
    }));
  }, [payment.outstandingInvoices, payment.amountReceived]);

  return {
    payment,
    updateCustomer,
    updatePaymentDate,
    updateAmountReceived,
    toggleInvoiceSelection,
    updateInvoicePayment,
    clearPayment,
    savePayment,
    totalOpenBalance
  };
}
