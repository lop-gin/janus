
import React from "react";
import { TransactionTable } from "./TransactionTable";

// Interface for transactions data
interface Transaction {
  id: string;
  type: string;
  date: string;
  number: string;
  total: number;
  status: string;
}

interface TransactionSelectionProps {
  customerName: string;
  availableTransactions: Transaction[];
  selectedTransactions: string[];
  onTransactionSelect: (transactionId: string) => void;
  isLoading?: boolean;
}

export const TransactionSelection: React.FC<TransactionSelectionProps> = ({
  customerName,
  availableTransactions,
  selectedTransactions,
  onTransactionSelect,
  isLoading = false,
}) => {
  if (!customerName) {
    return null;
  }

  return (
    <div className="bg-white rounded-md shadow-sm p-4 mb-6">
      <div className="mb-3">
        <h2 className="text-sm font-medium text-gray-700">Select Invoices/Receipts to Credit</h2>
        <p className="text-xs text-gray-500">Select one or more transactions to add their items to this credit note.</p>
      </div>
      
      {isLoading ? (
        <div className="text-center py-4 text-gray-500">
          Loading transactions...
        </div>
      ) : (
        <TransactionTable 
          transactions={availableTransactions}
          selectedTransactions={selectedTransactions}
          onTransactionSelect={onTransactionSelect}
        />
      )}
    </div>
  );
};
