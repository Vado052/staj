
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const RANKS = [
  "рядовой",
  "сержант",
  "старший сержант",
  "старшина",
  "прапорщик",
  "старший прапорщик",
  "лейтенант",
  "старший лейтенант",
  "капитан",
  "майор",
  "подполковник",
  "полковник",
  "генерал-майор"
];

interface EmployeeInfoInputProps {
  name: string;
  rank?: string;
  onChange: (name: string) => void;
  onRankChange: (rank: string) => void;
}

const EmployeeInfoInput: React.FC<EmployeeInfoInputProps> = ({ 
  name, 
  rank = "", 
  onChange,
  onRankChange
}) => {
  // Parse the full name into its components
  const nameParts = name.split(' ');
  const lastName = nameParts[0] || '';
  const firstName = nameParts[1] || '';
  const middleName = nameParts.slice(2).join(' ') || '';

  const handleNameChange = (
    newLastName: string, 
    newFirstName: string, 
    newMiddleName: string
  ) => {
    // Combine the separate parts back into a full name string
    const fullName = [newLastName, newFirstName, newMiddleName]
      .filter(part => part.trim() !== '')
      .join(' ');
    
    onChange(fullName);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Информация о работнике</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="employee-lastname" className="text-sm">Фамилия</Label>
          <Input
            id="employee-lastname"
            type="text"
            value={lastName}
            onChange={(e) => handleNameChange(
              e.target.value, 
              firstName, 
              middleName
            )}
            placeholder="Фамилия"
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="employee-firstname" className="text-sm">Имя</Label>
          <Input
            id="employee-firstname"
            type="text"
            value={firstName}
            onChange={(e) => handleNameChange(
              lastName, 
              e.target.value, 
              middleName
            )}
            placeholder="Имя"
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="employee-middlename" className="text-sm">Отчество</Label>
          <Input
            id="employee-middlename"
            type="text"
            value={middleName}
            onChange={(e) => handleNameChange(
              lastName, 
              firstName, 
              e.target.value
            )}
            placeholder="Отчество"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee-rank" className="text-sm">Звание</Label>
          <Select value={rank} onValueChange={onRankChange}>
            <SelectTrigger id="employee-rank" className="w-full">
              <SelectValue placeholder="Выберите звание" />
            </SelectTrigger>
            <SelectContent>
              {RANKS.map((rankOption) => (
                <SelectItem key={rankOption} value={rankOption}>
                  {rankOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default EmployeeInfoInput;
