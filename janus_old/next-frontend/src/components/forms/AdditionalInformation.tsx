import React from "react";
import { Document } from "@/types/document";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * AdditionalInformation Component Props Interface
 * 
 * This interface defines the props that the AdditionalInformation component accepts:
 * - document: The Document object containing all the document data
 * - updateDocument: A function to update the document with partial changes
 */
interface AdditionalInformationProps {
  document: Document;
  updateDocument: (updates: Partial<Document>) => void;
}

/**
 * AdditionalInformation Component
 * 
 * This component renders a form section for additional document information like
 * messages and tags. It demonstrates several React concepts:
 * 
 * 1. Function Components: This is a functional component using React.FC type
 * 2. Props Destructuring: We extract document and updateDocument from props
 * 3. Event Handlers: We define functions to handle input changes
 * 4. Controlled Components: Form elements' values are controlled by React state
 */
export const AdditionalInformation: React.FC<AdditionalInformationProps> = ({
  document,
  updateDocument,
}) => {
  /**
   * handleChange Function
   * 
   * This function handles changes to input and textarea elements.
   * When a user types in these fields, this function:
   * 1. Extracts the field name and new value from the event
   * 2. Creates an update object with the field name as key and new value
   * 3. Calls updateDocument to update the parent component's state
   * 
   * The computed property name syntax [name] allows us to dynamically set
   * the property name based on which input field triggered the change.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateDocument({ [name]: value } as Partial<Document>);
  };

  /**
   * handleTagsChange Function
   * 
   * This specialized handler processes comma-separated tags input:
   * 1. Gets the raw string value from the input
   * 2. Splits it by commas into an array
   * 3. Trims whitespace from each tag
   * 4. Filters out any empty tags
   * 5. Updates the document with the processed tags array
   */
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    updateDocument({ tags: tagsArray } as Partial<Document>);
  };

  // The component's UI structure using JSX
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Additional Information</h3>
      
      {/* First row with message textareas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="messageOnInvoice" className="text-xs text-gray-600">
            Message on Invoice
          </Label>
          <Textarea
            id="messageOnInvoice"
            name="messageOnInvoice"
            value={document.messageOnInvoice || ""}
            onChange={handleChange}
            placeholder="Enter a message to be displayed on the invoice"
            className="h-24 text-sm"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="messageOnStatement" className="text-xs text-gray-600">
            Message on Statement
          </Label>
          <Textarea
            id="messageOnStatement"
            name="messageOnStatement"
            value={document.messageOnStatement || ""}
            onChange={handleChange}
            placeholder="Enter a message to be displayed on the statement"
            className="h-24 text-sm"
          />
        </div>
      </div>
      
      {/* Second row with sales rep and tags inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salesRep" className="text-xs text-gray-600">
            Sales Rep
          </Label>
          <Input
            id="salesRep"
            name="salesRep"
            value={document.salesRep || ""}
            onChange={handleChange}
            placeholder="Enter sales representative name"
            className="h-9 text-sm"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tags" className="text-xs text-gray-600">
            Tags (comma separated)
          </Label>
          <Input
            id="tags"
            name="tags"
            value={(document.tags || []).join(", ")}
            onChange={handleTagsChange}
            placeholder="Enter tags separated by commas"
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
};