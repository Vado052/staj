
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmployeeInfoInputProps {
  name: string;
  onChange: (name: string) => void;
}

const EmployeeInfoInput: React.FC<EmployeeInfoInputProps> = ({ name, onChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="employee-name" className="text-sm">ФИО работника</Label>
      <Input
        id="employee-name"
        type="text"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Введите ФИО работника"
        className="w-full"
      />
    </div>
  );
};

export default EmployeeInfoInput;
