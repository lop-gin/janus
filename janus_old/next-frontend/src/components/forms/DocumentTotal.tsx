import React from "react";

interface DocumentTotalProps {
  total: number;
  balanceDue: number;
  documentType?: 'invoice' | 'creditNote' | 'refundReceipt' | 'estimate' | 'salesReceipt';
}

export const DocumentTotal: React.FC<DocumentTotalProps> = ({
  total,
  balanceDue,
  documentType = 'invoice'
}) => {
  const getBalanceDueLabel = () => {
    switch (documentType) {
      case 'creditNote':
        return 'Amount to Refund';
      case 'salesReceipt':
        return 'Amount Received';
      case 'refundReceipt':
        return 'Amount Refunded';
      case 'estimate':
        return 'Estimate Total';
      default:
        return 'Balance Due';
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 h-full flex flex-col justify-center">
      <div className="text-center space-y-4">
        <div>
          <div className="text-xl text-gray-500">{getBalanceDueLabel()}</div>
          <div className="text-4xl font-bold text-gray-800">
            {total.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};