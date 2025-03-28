
import React from "react";

interface DocumentTotalProps {
  total: number;
  balanceDue: number;
  otherFeesAmount?: number;
  documentType?: 'invoice' | 'creditNote' | 'refundReceipt' | 'estimate' | 'salesReceipt';
}

export const DocumentTotal: React.FC<DocumentTotalProps> = ({
  total,
  balanceDue,
  otherFeesAmount,
  documentType = 'invoice'
}) => {
  const calculatedTotal = total + (otherFeesAmount || 0);
  const calculatedBalanceDue = balanceDue + (otherFeesAmount || 0);

  // Define labels based on document type
  // const getTotalLabel = () => {
  //   switch (documentType) {
  //     case 'creditNote':
  //       return 'Total Credit';
  //     case 'refundReceipt':
  //       return 'Total Amount';
  //     case 'estimate':
  //       return 'Estimate Total';
  //     default:
  //       return 'Total Amount';
  //   }
  // };

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
        {/* <div>
          <div className="text-xs text-gray-500">{getTotalLabel()}</div>
          <div className="text-2xl font-bold text-gray-800">
            Ksh{calculatedTotal.toFixed(2)}
          </div>
        </div> */}
        <div>
          <div className="text-xl text-gray-500">{getBalanceDueLabel()}</div>
          <div className="text-4xl font-bold text-gray-800">
            Ksh {calculatedBalanceDue.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};
