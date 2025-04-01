"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SalesRepresentativeProps {
  value: string;
  onChange: (rep: string) => void;
}

export const SalesRepresentative: React.FC<SalesRepresentativeProps> = ({ value, onChange }) => {
  const [salesReps, setSalesReps] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchSalesReps = async () => {
      try {
        console.log("Token:", localStorage.getItem("supabase.auth.token"));
        const response = await api.get("http://127.0.0.1:8000/sales-reps", {
          headers: { Authorization: `Bearer ${localStorage.getItem("supabase.auth.token")}` },
        });
        setSalesReps(response.data);
      } catch (error) {
        console.error("Failed to fetch sales reps", error);
      }
    };
    fetchSalesReps();
  }, []);

  return (
    <div>
      <label className="text-xs font-medium text-gray-600 mr-1">Sales Representative</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-xs w-full bg-white">
          <SelectValue placeholder="Select sales representative" />
        </SelectTrigger>
        <SelectContent className="bg-white text-gray-700 border-white">
          {salesReps.map((rep) => (
            <SelectItem key={rep.id} value={rep.id.toString()}>
              {rep.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};