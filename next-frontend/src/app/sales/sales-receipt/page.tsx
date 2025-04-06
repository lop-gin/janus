"use client";

import React, { useState, useEffect } from "react";
import { CustomerSection } from "@/components/forms/CustomerSection";
import { ItemsTable } from "@/components/forms/ItemsTable";
import { FormMessage } from "@/components/forms/FormMessage";
import { DateField } from "@/components/forms/DateFields";
import { DocumentTotal } from "@/components/forms/DocumentTotal";
import { useSalesReceiptForm } from "@/hooks/useSalesReceiptForm";
import { PageLoader } from "@/components/ui/page-loader";
import { SalesRepresentative } from "@/components/forms/SalesRepresentative";
import { AnimatePresence } from "framer-motion";
import { FormHeader } from "@/components/forms/FormHeader";
import { FormFooter } from "@/components/forms/FormFooter";
import { useRouter } from "next/navigation";

/**
 * SalesReceiptPage component renders the main sales receipt creation form.
 * Manages loading state and navigation after save actions.
 */
export default function SalesReceiptPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const {
    salesReceipt,
    updateSalesReceipt,
    updateCustomer,
    addSalesReceiptItem,
    updateSalesReceiptItem,
    removeSalesReceiptItem,
    clearAllItems,
    saveSalesReceipt,
    updateOtherFees,
    clearForm,
  } = useSalesReceiptForm();

  // Simulate loading delay (replace with actual data fetch if needed)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Save sales receipt and redirect to dashboard
  const handleSaveAndClose = async () => {
    const success = await saveSalesReceipt();
    if (success) router.push("/dashboard");
  };

  // Save sales receipt and reset form for a new entry
  const handleSaveAndNew = async () => {
    const success = await saveSalesReceipt();
    if (success) clearForm();
  };

  return (
    <>
      <AnimatePresence>
        {loading && <PageLoader message="Preparing sales receipt form..." />}
      </AnimatePresence>
      {!loading && (
        <div className="bg-gray-50 min-h-screen w-full">
          <FormHeader title="Sales Receipt" />
          <div className="p-4 pb-17">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CustomerSection
                    customer={salesReceipt.customer}
                    document={salesReceipt}
                    updateCustomer={updateCustomer}
                    updateDocument={updateSalesReceipt}
                  />
                  <div className="space-y-3 pb-5">
                    <DateField
                      label="Sale Date"
                      date={salesReceipt.saleDate}
                      onDateChange={(date) => updateSalesReceipt({ saleDate: date })}
                    />
                    <SalesRepresentative
                      value={salesReceipt.salesRep || ""}
                      onChange={(rep) => updateSalesReceipt({ salesRep: rep })}
                    />
                  </div>
                </div>
              </div>
              <DocumentTotal
                total={salesReceipt.total}
                balanceDue={salesReceipt.balanceDue}
                documentType="salesReceipt"
              />
            </div>
            <div className="bg-white rounded-md shadow-sm p-4 mb-6">
              <ItemsTable
                items={salesReceipt.items}
                addItem={addSalesReceiptItem}
                updateItem={updateSalesReceiptItem}
                removeItem={removeSalesReceiptItem}
                clearAllItems={clearAllItems}
                otherFees={salesReceipt.otherFees || { description: "", amount: 0 }}
                updateOtherFees={updateOtherFees}
              />
            </div>
            <FormMessage
              message={salesReceipt.messageOnInvoice}
              label="Message on Sales Receipt"
              onChange={(message) => updateSalesReceipt({ messageOnInvoice: message })}
              placeholder="Enter a message to be displayed on the sales receipt"
            />
          </div>
          <FormFooter
            onClear={clearForm}
            onSave={handleSaveAndClose}
            onSaveAndNew={handleSaveAndNew}
          />
        </div>
      )}
    </>
  );
}