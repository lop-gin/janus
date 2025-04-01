"use client";

import React, { useState, useEffect } from "react";
import { CustomerSection } from "@/components/forms/CustomerSection";
import { ItemsTable } from "@/components/forms/ItemsTable";
import { FormMessage } from "@/components/forms/FormMessage";
import { DateField, TermsSelect } from "@/components/forms/DateFields";
import { DocumentTotal } from "@/components/forms/DocumentTotal";
import { useInvoiceForm } from "@/hooks/useInvoiceForm";
import { PageLoader } from "@/components/ui/page-loader";
import { SalesRepresentative } from "@/components/forms/SalesRepresentative";
import { AnimatePresence } from "framer-motion";
import { FormHeader } from "@/components/forms/FormHeader";
import { FormFooter } from "@/components/forms/FormFooter";
import { useRouter } from "next/navigation";

export default function InvoicePage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const {
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
  } = useInvoiceForm();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSaveAndClose = async () => {
    const success = await saveInvoice();
    if (success) router.push("/dashboard");
  };

  const handleSaveAndNew = async () => {
    const success = await saveInvoice();
    if (success) clearForm();
  };

  return (
    <>
      <AnimatePresence>{loading && <PageLoader message="Preparing invoice form..." />}</AnimatePresence>
      <div className="bg-gray-50 min-h-screen w-full">
        <div className="bg-transparent">
          <FormHeader title="Invoice" />
          <div className="p-4 pb-17">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomerSection
                    customer={invoice.customer}
                    document={invoice}
                    updateCustomer={updateCustomer}
                    updateDocument={updateInvoice}
                  />
                  <div className="space-y-3 pb-5">
                    <div className="grid grid-cols-2 gap-3">
                      <DateField
                        label="Invoice date"
                        date={invoice.invoiceDate}
                        onDateChange={(date) => updateInvoice({ invoiceDate: date })}
                      />
                      <DateField
                        label="Due date"
                        date={invoice.dueDate}
                        onDateChange={(date) => updateInvoice({ dueDate: date })}
                      />
                    </div>
                    <TermsSelect terms={invoice.terms} onTermsChange={updateTerms} />
                    <SalesRepresentative
                      value={invoice.salesRep || ""}
                      onChange={(rep) => updateInvoice({ salesRep: rep })}
                    />
                  </div>
                </div>
              </div>
              <DocumentTotal
                total={invoice.total}
                balanceDue={invoice.balanceDue}
                otherFeesAmount={invoice.otherFees?.amount}
              />
            </div>
            <div className="bg-white rounded-md shadow-sm p-4 mb-6">
              <ItemsTable
                items={invoice.items}
                addItem={addInvoiceItem}
                updateItem={updateInvoiceItem}
                removeItem={removeInvoiceItem}
                clearAllItems={clearAllItems}
                otherFees={invoice.otherFees || { description: "", amount: undefined }}
                updateOtherFees={updateOtherFees}
              />
            </div>
            <FormMessage
              message={invoice.messageOnInvoice}
              label="MESSAGE ON INVOICE"
              onChange={(message) => updateInvoice({ messageOnInvoice: message })}
              placeholder="Enter a message to be displayed on the invoice"
            />
          </div>
          <FormFooter
            onClear={clearForm}
            onSave={handleSaveAndClose}
            onSaveAndNew={handleSaveAndNew}
          />
        </div>
      </div>
    </>
  );
}