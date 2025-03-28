'use client';

import React, { useState, useEffect } from "react";
import { CustomerSection } from "@/components/forms/CustomerSection";
import { ItemsTable } from "@/components/forms/ItemsTable";
import { FormMessage } from "@/components/forms/FormMessage";
import { DateField } from "@/components/forms/DateFields";
import { DocumentTotal } from "@/components/forms/DocumentTotal";
import { useSalesReceiptForm } from "@/hooks/useSalesReceiptForm";
import { PageLoader } from "@/components/ui/page-loader";
// import { SalesRepresentative } from "@/components/forms/SalesRepresentative";
import { AnimatePresence } from "framer-motion";
import { FormHeader } from "@/components/forms/FormHeader";
import { FormFooter } from "@/components/forms/FormFooter";

export default function SalesReceiptPage() {
  const [loading, setLoading] = useState(true);
  
  const {
    salesReceipt,
    updateSalesReceipt,
    updateCustomer,
    addSalesReceiptItem,
    updateSalesReceiptItem,
    removeSalesReceiptItem,
    clearAllItems,
    saveSalesReceipt,
    updateOtherFees
  } = useSalesReceiptForm();

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <PageLoader message="Preparing salesReceipt form..." />}
      </AnimatePresence>
    
      <div className="bg-gray-50 min-h-screen w-full">
        <div className="bg-transparent">
          <FormHeader title="Sales Receipt" />
          
          <div className="p-4 pb-17"> 
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <CustomerSection 
                      customer={salesReceipt.customer}
                      document={salesReceipt}
                      updateCustomer={updateCustomer} 
                      updateDocument={updateSalesReceipt}
                    />
                  </div>
                  <div>
                    <div className="space-y-3 pb-5">
                      <div className="grid grid-cols-2 gap-3">
                        <DateField 
                          label="salesReceipt date"
                          date={salesReceipt.saleDate}
                          onDateChange={(date) => updateSalesReceipt({ saleDate: date })}
                        />
                      </div>
                      
                      {/* <SalesRepresentative 
                        value={salesReceipt.salesRep || ""}
                        onChange={(rep) => updatesalesReceipt({ salesRep: rep })}
                      /> */}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <DocumentTotal 
                  total={salesReceipt.total}
                  balanceDue={salesReceipt.balanceDue}
                  otherFeesAmount={salesReceipt.otherFees?.amount}
                />
              </div>
            </div>
            
            <div className="bg-white rounded-md shadow-sm p-4 mb-6">
              <ItemsTable 
                items={salesReceipt.items} 
                addItem={addSalesReceiptItem} 
                updateItem={updateSalesReceiptItem} 
                removeItem={removeSalesReceiptItem}
                clearAllItems={clearAllItems}
                otherFees={salesReceipt.otherFees || { description: "", amount: undefined }}
                updateOtherFees={updateOtherFees}
              />
            </div>
            
            <div className="mt-8">
              <FormMessage 
                message={salesReceipt.messageOnInvoice}
                label="MESSAGE ON SalesReceipt"
                onChange={(message) => updateSalesReceipt({ messageOnInvoice: message })}
                placeholder="Enter a message to be displayed on the SalesReceipt"
              />
            </div>
          </div>
          
          <FormFooter 
            onClear={clearAllItems}
            onSave={saveSalesReceipt}
            onSaveAndNew={() => {}}
          />
        </div>
      </div>
    </>
  );
}