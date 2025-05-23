import React from "react";
import { HelpCircle } from "lucide-react";

export const TableHeader: React.FC = () => {
  return (
    <tr className="text-xs text-gray-700 border-b border-gray-300 bg-gray-100 font-bold">
      <th className="text-center w-8 py-2 border-r border-gray-300 px-2">
        <span className="text-[11px] font-extrabold tracking-wide uppercase">
          #
        </span>
      </th>
      <th className="text-left py-2 w-[10%] border-r border-gray-300 px-3">
        <span className="text-[11px] font-extrabold tracking-wide uppercase">
          CATEGORY
        </span>
      </th>
      <th className="text-left py-2 w-[15%] border-r border-gray-300 px-3">
        <div className="flex items-center">
          <span className="text-[11px] font-extrabold tracking-wide uppercase">
            ORIGINAL PRODUCT
          </span>
          <HelpCircle className="h-3.5 w-3.5 text-gray-600 ml-2" />
        </div>
      </th>
      <th className="text-left py-2 w-[15%] border-r border-gray-300 px-3">
        <div className="flex items-center">
          <span className="text-[11px] font-extrabold tracking-wide uppercase">
            CUSTOMER PRODUCT
          </span>
          <HelpCircle className="h-3.5 w-3.5 text-gray-600 ml-2" />
        </div>
      </th>
      <th className="text-left py-2 w-[25%] border-r border-gray-300 px-3">
        <span className="text-[11px] font-extrabold tracking-wide uppercase">
          DESCRIPTION
        </span>
      </th>
      <th className="text-right py-2 w-[8%] border-r border-gray-300 px-3">
        <span className="text-[11px] font-extrabold tracking-wide uppercase">
          QTY
        </span>
      </th>
      <th className="text-right py-2 w-[10%] border-r border-gray-300 px-3">
        <span className="text-[11px] font-extrabold tracking-wide uppercase">
          UNIT
        </span>
      </th>
      <th className="text-right py-2 w-[10%] border-r border-gray-300 px-3">
        <span className="text-[11px] font-extrabold tracking-wide uppercase">
          UNIT PRICE
        </span>
      </th>
      <th className="text-right py-2 w-[8%] border-r border-gray-300 px-3">
        <span className="text-[11px] font-extrabold tracking-wide uppercase">
          TAX %
        </span>
      </th>
      <th className="text-right py-2 w-[10%] border-r border-gray-300 px-3">
        <span className="text-[11px] font-extrabold tracking-wide uppercase">
          AMOUNT
        </span>
      </th>
      <th className="text-center w-8 py-2 px-2"></th>
    </tr>
  );
};