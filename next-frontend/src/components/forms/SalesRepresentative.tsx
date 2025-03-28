
import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SALES_RELATED_ROLES, PROCUREMENT_RELATED_ROLES } from "@/types/roles";

interface SalesRepresentativeProps {
  representativeType?: "sales" | "procurement";
  value: string;
  onChange: (value: string) => void;
}

interface Employee {
  id: string;
  full_name: string;
  role_name?: string;
}

export const SalesRepresentative: React.FC<SalesRepresentativeProps> = ({
  representativeType = "sales",
  value,
  onChange
}) => {
  const { user, userMetadata } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  const labelText = representativeType === "sales" ? "Sales Rep" : "Procurement Rep";
  const relevantRoles = representativeType === "sales" ? SALES_RELATED_ROLES : PROCUREMENT_RELATED_ROLES;

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      try {
        // Join profiles with roles to get employees with sales or procurement roles
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            roles:role_id (
              name
            )
          `)
          .eq('status', 'active')
          .order('full_name');
          
        if (error) throw error;
        
        // Transform and filter employees by relevant roles
        const formattedEmployees = (data || [])
          .map(item => ({
            id: item.id,
            full_name: item.full_name || 'Unknown',
            role_name: item.roles?.name
          }))
          .filter(emp => 
            emp.role_name && 
            relevantRoles.some(role => 
              emp.role_name?.toLowerCase().includes(role.toLowerCase())
            )
          );
        
        setEmployees(formattedEmployees);
        
        // Set default to current user if they have an appropriate role
        if (!value && user?.id) {
          const currentUserInList = formattedEmployees.find(emp => emp.id === user.id);
          if (currentUserInList) {
            onChange(currentUserInList.id);
          }
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [user, value, onChange, representativeType, relevantRoles]);
  
  return (
    <div>
      <div className="flex items-center mb-1">
        <Label htmlFor="salesRep" className="text-xs font-medium text-gray-600 mr-1">{labelText}</Label>
        <HelpCircle className="h-3 w-3 text-gray-400" />
      </div>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={loading}
      >
        <SelectTrigger className="w-full h-9 text-xs">
          <SelectValue placeholder={`Select ${labelText}`} />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <div className="flex justify-center p-2">
              <div className="animate-spin h-4 w-4 border-b-2 border-primary rounded-full"></div>
            </div>
          ) : employees.length > 0 ? (
            employees.map(employee => (
              <SelectItem key={employee.id} value={employee.id}>
                {employee.full_name}
              </SelectItem>
            ))
          ) : (
            <div className="p-2 text-sm text-gray-500">
              No {representativeType} representatives available
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
