'use client';

import React, { useState, useEffect } from "react";
import { CustomerSection } from "@/components/forms/CustomerSection";
import { FormMessage } from "@/components/forms/FormMessage";
import { DateField } from "@/components/forms/DateFields";
import { OutstandingInvoicesTable } from "@/components/forms/payment/OutstandingInvoicesTable";
import { PaymentSummary } from "@/components/forms/payment/PaymentSummary";
import { AmountReceivedInput } from "@/components/forms/payment/AmountReceivedInput";
import { DocumentTotal } from "@/components/forms/DocumentTotal";
import { usePaymentForm } from "@/hooks/usePaymentForm";
import { FormHeader } from "@/components/forms/FormHeader";
import { FormFooter } from "@/components/forms/FormFooter";
import { toast } from "sonner";
import { PageLoader } from "@/components/ui/page-loader";
import { AnimatePresence } from "framer-motion";


export default function PaymentPage() {
  const [loading, setLoading] = useState(true);
  const {
    payment,
    updateCustomer,
    updatePaymentDate,
    updateAmountReceived,
    toggleInvoiceSelection,
    updateInvoicePayment,
    clearPayment,
    savePayment,
    totalOpenBalance
  } = usePaymentForm();

  const [isCustomerSelected, setIsCustomerSelected] = useState(false);

  const handleCustomerSelect = (customerName: string) => {
    setIsCustomerSelected(!!customerName);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    savePayment();
    toast.success("Payment saved successfully");
  };

  const handleSaveAndNew = () => {
    savePayment();
    clearPayment();
    toast.success("Payment saved successfully. New payment form ready.");
  };

  const documentForCustomer = {
    customer: payment.customer,
    items: [],
    messageOnInvoice: "",
    messageOnStatement: "",
    subTotal: 0,
    total: 0,
    balanceDue: 0
  };

  return (
    <>
      <AnimatePresence>
        {loading && <PageLoader message="Preparing payment form..." />}
      </AnimatePresence>
    
      <div className="bg-gray-50 min-h-screen w-full">
        <div className="bg-transparent">
          <FormHeader title="Receive Payment" />
          
          <div className="p-4 pb-17">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <CustomerSection
                      customer={payment.customer}
                      document={documentForCustomer}
                      updateCustomer={updateCustomer}
                      updateDocument={() => {}}
                      onCustomerSelect={handleCustomerSelect}
                    />
                  </div>
                  <div>
                    <div className="space-y-3 pb-5">
                      <div className="grid grid-cols-2 gap-3">
                        <DateField 
                          label="Receive Payment date"
                          date={payment.paymentDate}
                          onDateChange={(date) => updatePaymentDate(date)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 h-full flex flex-col">
                  <div className="text-center mb-auto">
                    <DocumentTotal 
                        total={payment.total}
                        balanceDue={payment.balanceDue}
                        otherFeesAmount={payment.otherFees?.amount}
                    />
                  </div>
                  
                  <AmountReceivedInput 
                    amount={payment.amountReceived} 
                    onChange={updateAmountReceived} 
                  />
                </div>
              </div>
            </div>

            {isCustomerSelected && (
              <div className="bg-white rounded-md shadow-sm p-4 mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg text-gray-700 font-semibold">Outstanding Invoices</h2>
                </div>

                <div className="mb-6">
                  <OutstandingInvoicesTable
                    invoices={payment.outstandingInvoices}
                    onToggleSelection={toggleInvoiceSelection}
                    onUpdatePayment={updateInvoicePayment}
                  />
                </div>
                
                {/* Payment Summary positioned below the table and to the right */}
                <div className="flex justify-end">
                  <div className="w-full md:w-1/3">
                    <PaymentSummary
                      amountToApply={payment.amountToApply}
                      amountToCredit={payment.amountToCredit}
                      onClearPayment={clearPayment}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8">
              <FormMessage
                message={payment.messageOnInvoice}
                onChange={(message) => {
                  const updatedPayment = { ...payment, messageOnInvoice: message };
                  savePayment();
                }}
                label="MESSAGE ON PAYMENT"
                placeholder="Add a note to this payment"
              />
            </div>
          </div>
          
          <FormFooter 
            onClear={clearPayment}
            onSave={savePayment}
            onSaveAndNew={() => {}}
          />
        </div>
      </div>
    </>
  );
}
