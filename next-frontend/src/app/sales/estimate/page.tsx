'use client';

import React, { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { CustomerSection } from "@/components/forms/CustomerSection";
import { ItemsTable } from "@/components/forms/ItemsTable";
import { FormMessage } from "@/components/forms/FormMessage";
import { DateField } from "@/components/forms/DateFields";
import { DocumentTotal } from "@/components/forms/DocumentTotal";
import { useEstimateForm } from "@/hooks/useEstimateForm";
import { PageLoader } from "@/components/ui/page-loader";
import { AnimatePresence } from "framer-motion";
import { FormHeader } from "@/components/forms/FormHeader";
import { FormFooter } from "@/components/forms/FormFooter";

export default function EstimatePage() {
  const [loading, setLoading] = useState(true);
  
  const {
    estimate,
    updateEstimate,
    updateCustomer,
    addEstimateItem,
    updateEstimateItem,
    removeEstimateItem,
    clearAllItems,
    saveEstimate,
    updateOtherFees
  } = useEstimateForm();

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
        {loading && <PageLoader message="Preparing estimate form..." />}
      </AnimatePresence>
    
      <div className="bg-gray-50 min-h-screen w-full">
        <div className="bg-transparent">
          <FormHeader title="Estimate" />
          
          <div className="p-4 pb-17">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <CustomerSection 
                      customer={estimate.customer}
                      document={estimate}
                      updateCustomer={updateCustomer} 
                      updateDocument={updateEstimate}
                    />
                  </div>
                  <div>
                    <div className="space-y-3 pb-5">
                      <div className="grid grid-cols-2 gap-3">
                        <DateField 
                          label="Estimate date"
                          date={estimate.estimateDate}
                          onDateChange={(date) => updateEstimate({ estimateDate: date })}
                        />
                        <DateField 
                          label="Expiration date"
                          date={estimate.expirationDate}
                          onDateChange={(date) => updateEstimate({ expirationDate: date })}
                        />
                      </div>
                      
                      {/* <SalesRepresentative 
                        value={estimate.salesRep || ""}
                        onChange={(rep) => updateEstimate({ salesRep: rep })}
                      /> */}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <DocumentTotal 
                  total={estimate.total}
                  balanceDue={estimate.balanceDue}
                  otherFeesAmount={estimate.otherFees?.amount}
                  documentType="estimate"
                />
              </div>
            </div>
            
            <div className="bg-white rounded-md shadow-sm p-4 mb-6">
              <ItemsTable 
                items={estimate.items} 
                addItem={addEstimateItem} 
                updateItem={updateEstimateItem} 
                removeItem={removeEstimateItem}
                clearAllItems={clearAllItems}
                otherFees={estimate.otherFees || { description: "", amount: undefined }}
                updateOtherFees={updateOtherFees}
              />
            </div>
            
            <div className="mt-8">
              <FormMessage 
                message={estimate.messageOnInvoice}
                label="MESSAGE ON ESTIMATE"
                onChange={(message) => updateEstimate({ messageOnInvoice: message })}
                placeholder="Enter a message to be displayed on the estimate"
              />
            </div>
          </div>
          
          <FormFooter 
            onClear={clearAllItems}
            onSave={saveEstimate}
            onSaveAndNew={() => {}}
          />
        </div>
      </div>
    </>
  );
}
