"use client";

import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { addDays, isBefore } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface DateFieldProps {
  label: string;
  date: Date;
  onDateChange: (date: Date) => void;
  minDate?: Date;
}

export const DateField: React.FC<DateFieldProps> = ({
  label,
  date,
  onDateChange,
  minDate,
}) => {
  return (
    <div>
      <div className="flex items-center mb-1">
        <Label className="text-xs font-medium text-gray-600 mr-1">{label}</Label>
      </div>
      <div className="relative">
        <DatePicker
          selected={date}
          onChange={(date: Date | null) => date && onDateChange(date)}
          dateFormat="dd/MM/yyyy"
          className="w-full h-9 text-xs bg-white border border-gray-300 rounded-md px-3 py-2 text-left font-normal focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
          showIcon
          minDate={minDate}
          icon={<CalendarIcon className="h-3.5 w-3.5 text-black" />}
          customInput={
            <input
              className={cn(
                "w-full justify-start text-left font-normal h-9 text-xs bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600 text-black",
                !date && "text-gray-500"
              )}
              placeholder="DD/MM/YYYY"
            />
          }
          // Add these props to enhance date validation
          strictParsing
          excludeDates={minDate ? Array.from({length: 10000}, (_, i) => {
            const d = new Date(minDate);
            d.setDate(d.getDate() - i - 1);
            return new Date(d);
          }) : undefined}
        />
      </div>
    </div>
  );
};

interface TermsSelectProps {
  terms: string;
  onTermsChange: (terms: string) => void;
}

export const TermsSelect: React.FC<TermsSelectProps> = ({
  terms,
  onTermsChange,
}) => {
  return (
    <div>
      <div className="flex items-center mb-1">
        <Label className="text-xs font-medium text-gray-600 mr-1">Terms</Label>
      </div>
      <Select value={terms} onValueChange={onTermsChange}>
        <SelectTrigger className="h-9 text-xs w-[150px] bg-white">  {/* Reduced width */}
          <SelectValue placeholder="Select terms" />
        </SelectTrigger>
        <SelectContent className="bg-white text-gray-700 border-white">
          <SelectItem value="Due on receipt">Due on receipt</SelectItem>
          <SelectItem value="Net 15">Net 15</SelectItem>
          <SelectItem value="Net 30">Net 30</SelectItem>
          <SelectItem value="Net 45">Net 45</SelectItem>
          <SelectItem value="Net 60">Net 60</SelectItem>
          <SelectItem value="Custom">Custom</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

interface DateTermsGroupProps {
  invoiceDate: Date;
  dueDate: Date;
  terms: string;
  onInvoiceDateChange: (date: Date) => void;
  onDueDateChange: (date: Date) => void;
  onTermsChange: (terms: string) => void;
}

export const DateTermsGroup: React.FC<DateTermsGroupProps> = ({
  invoiceDate,
  dueDate,
  terms,
  onInvoiceDateChange,
  onDueDateChange,
  onTermsChange,
}) => {
  // Calculate due date based on terms and invoice date
  const calculateDueDate = (terms: string, invoiceDate: Date): Date => {
    switch (terms) {
      case "Due on receipt":
        return new Date(invoiceDate);
      case "Net 15":
        return addDays(new Date(invoiceDate), 15);
      case "Net 30":
        return addDays(new Date(invoiceDate), 30);
      case "Net 45":
        return addDays(new Date(invoiceDate), 45);
      case "Net 60":
        return addDays(new Date(invoiceDate), 60);
      default:
        return new Date(dueDate); // Keep current due date for custom terms
    }
  };

  // Handle invoice date change
  const handleInvoiceDateChange = (newDate: Date) => {
    onInvoiceDateChange(newDate);
    
    // If due date is now before invoice date, update it
    if (isBefore(dueDate, newDate)) {
      onDueDateChange(newDate);
    } else if (terms !== "Custom") {
      // Recalculate due date based on terms
      onDueDateChange(calculateDueDate(terms, newDate));
    }
  };

  // Handle due date change
  const handleDueDateChange = (newDate: Date) => {
    // Always set terms to Custom when manually adjusting dates
    onTermsChange("Custom");
    
    // Prevent setting due date before invoice date
    if (newDate && invoiceDate && isBefore(newDate, invoiceDate)) {
      // If user tries to set due date before invoice date, set it to invoice date
      onDueDateChange(new Date(invoiceDate));
    } else {
      onDueDateChange(newDate);
    }
  };

  // Handle terms change
  const handleTermsChange = (newTerms: string) => {
    onTermsChange(newTerms);
    
    // Update due date based on new terms
    if (newTerms !== "Custom") {
      onDueDateChange(calculateDueDate(newTerms, invoiceDate));
    }
  };

  // Set default values when component mounts or when terms is empty
  useEffect(() => {
    if (!terms) {
      // Default to "Due on receipt"
      onTermsChange("Due on receipt");
      
      // Set invoice date to today if not already set
      const today = new Date();
      if (!invoiceDate || isNaN(invoiceDate.getTime())) {
        onInvoiceDateChange(today);
      }
      
      // Set due date to today for "Due on receipt"
      onDueDateChange(today);
    } else if (terms === "Net 30" && !dueDate) {
      // If terms is already set to Net 30 but no due date, calculate it
      onDueDateChange(calculateDueDate(terms, invoiceDate));
    }
    
    // Ensure due date is never before invoice date
    if (dueDate && invoiceDate && isBefore(dueDate, invoiceDate)) {
      onDueDateChange(new Date(invoiceDate));
      // If terms isn't already Custom, set it to Custom since we're adjusting the date
      if (terms !== "Custom") {
        onTermsChange("Custom");
      }
    }
  }, [terms, invoiceDate, dueDate, onTermsChange, onInvoiceDateChange, onDueDateChange]);

  return (
    <div className="grid grid-cols-3 gap-3">
      <DateField 
        label="Invoice Date" 
        date={invoiceDate} 
        onDateChange={handleInvoiceDateChange} 
      />
      <DateField 
        label="Due Date" 
        date={dueDate} 
        onDateChange={handleDueDateChange} 
        minDate={invoiceDate} // Prevent selecting dates before invoice date in the date picker
      />
      <TermsSelect 
        terms={terms} 
        onTermsChange={handleTermsChange} 
      />
    </div>
  );
};
