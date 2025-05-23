
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

// Define transaction interface
interface Transaction {
  id: string;
  type: string;
  date: string;
  number: string;
  total: number;
  status: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  selectedTransactions: string[];
  onTransactionSelect: (transactionId: string) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  selectedTransactions,
  onTransactionSelect,
}) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No transactions available for this customer
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-gray-50">
          <TableHead className="w-10"></TableHead>
          <TableHead className="w-10">#</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Transaction Number</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction, index) => (
          <TableRow key={transaction.id} className="hover:bg-gray-50">
            <TableCell className="p-2">
              <Checkbox 
                checked={selectedTransactions.includes(transaction.id)}
                onCheckedChange={() => onTransactionSelect(transaction.id)}
              />
            </TableCell>
            <TableCell className="p-2 text-gray-700">{index + 1}</TableCell>
            <TableCell className="p-2 text-gray-700">{transaction.date}</TableCell>
            <TableCell className="p-2 font-medium text-gray-700">{transaction.number}</TableCell>
            <TableCell className="p-2 text-right text-gray-700">{transaction.total.toFixed(2)}</TableCell>
            <TableCell className="p-2">
              <span 
                className={`inline-block px-2 py-1 text-xs rounded-full ${
                  transaction.status === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : transaction.status === 'overdue'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {transaction.status}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
