import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FormFooterProps {
  backUrl?: string;
  onClear?: () => void;
  onSave?: () => void;
  onSaveAndNew?: () => void;
  saveLabel?: string;
  clearLabel?: string;
  cancelLabel?: string;
  showSaveAndNew?: boolean;
}

export const FormFooter: React.FC<FormFooterProps> = ({
  backUrl = "/dashboard",
  onClear,
  onSave,
  onSaveAndNew,
  saveLabel = "Save and close",
  clearLabel = "Clear",
  cancelLabel = "Cancel",
  showSaveAndNew = true,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-2 flex justify-between items-center">
      <div className="flex space-x-3">
        <Link href={backUrl}>
          <Button variant="outline" className="h-8 rounded-xl bg-transparent text-white border-gray-600 hover:bg-gray-700 hover:text-white">
            {cancelLabel}
          </Button>
        </Link>
        {onClear && (
          <Button 
            variant="outline" 
            className="h-8 rounded-xl bg-transparent text-white border-gray-600 hover:bg-gray-700 hover:text-white"
            onClick={onClear}
          >
            {clearLabel}
          </Button>
        )}
      </div>
      
      <div className="flex items-center space-x-3">
        {showSaveAndNew && (
          <Button 
            variant="outline"
            className="h-8 rounded-xl bg-transparent text-white border-gray-600 hover:bg-gray-700 hover:text-white"
            onClick={onSaveAndNew}
          >
            Save & New
          </Button>
        )}
        <Button 
          className="h-8 rounded-xl bg-green-600 hover:bg-green-700 text-white"
          onClick={onSave}
        >
          {saveLabel}
        </Button>
      </div>
    </div>
  );
};