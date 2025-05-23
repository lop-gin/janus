
import React, { memo } from "react";
import { format } from "date-fns";
import { OutstandingInvoice } from "@/types/document";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { IndexCell } from "@/components/forms/ItemsTable/cells/IndexCell";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OutstandingInvoicesTableProps {
  invoices: OutstandingInvoice[];
  onToggleSelection: (invoiceId: string) => void;
  onUpdatePayment: (invoiceId: string, amount: number) => void;
}

export const OutstandingInvoicesTable: React.FC<OutstandingInvoicesTableProps> = ({
  invoices,
  onToggleSelection,
  onUpdatePayment,
}) => {
  if (!invoices.length) {
    return <div className="text-center py-6 text-gray-500">No outstanding invoices found.</div>;
  }

  const handlePaymentChange = (invoiceId: string, value: string) => {
    const amount = value === "" ? 0 : parseFloat(value);
    if (!isNaN(amount)) {
      onUpdatePayment(invoiceId, amount);
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-12">Select</TableHead>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Invoice Details</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Original Amount</TableHead>
            <TableHead className="text-right">Payment Received</TableHead>
            <TableHead className="text-right">Open Balance</TableHead>
            <TableHead className="text-right">Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice, index) => (
            <TableRow key={invoice.id}>
              <TableCell className="text-center">
                <Checkbox
                  checked={invoice.selected}
                  onCheckedChange={() => onToggleSelection(invoice.id)}
                />
              </TableCell>
              <IndexCell index={index} />
              <TableCell>
                {invoice.invoiceNumber} ({format(invoice.invoiceDate, "dd/MM/yyyy")})
              </TableCell>
              <TableCell>{format(invoice.dueDate, "dd/MM/yyyy")}</TableCell>
              <TableCell>
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    invoice.status === "open" 
                      ? "bg-blue-100 text-blue-800"
                      : invoice.status === "overdue" 
                      ? "bg-red-100 text-red-800"
                      : invoice.status === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </TableCell>
              <TableCell className="text-right">{invoice.originalAmount.toFixed(2)}</TableCell>
              <TableCell className="text-right">{invoice.paymentReceived.toFixed(2)}</TableCell>
              <TableCell className="text-right">{invoice.openBalance.toFixed(2)}</TableCell>
              <TableCell className="p-0">
                <Input
                  type="number"
                  value={invoice.payment || ""}
                  onChange={(e) => handlePaymentChange(invoice.id, e.target.value)}
                  className="border-0 h-full text-right"
                  placeholder="0.00"
                  min={0}
                  max={invoice.openBalance}
                  step="0.01"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default memo(OutstandingInvoicesTable);
