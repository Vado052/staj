
import React from "react";
import { WorkPeriod } from "@/utils/calculatorUtils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface WorkPeriodInputProps {
  period: WorkPeriod;
  onChange: (updatedPeriod: WorkPeriod) => void;
  onDelete: () => void;
  isDeleteDisabled: boolean;
}

const coefficientOptions = [1, 1.5, 2, 3];

const WorkPeriodInput: React.FC<WorkPeriodInputProps> = ({
  period,
  onChange,
  onDelete,
  isDeleteDisabled,
}) => {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onChange({
        ...period,
        startDate: new Date(e.target.value),
      });
    } else {
      onChange({
        ...period,
        startDate: null,
      });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      onChange({
        ...period,
        endDate: new Date(e.target.value),
      });
    } else {
      onChange({
        ...period,
        endDate: null,
      });
    }
  };

  const handleCoefficientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...period,
      coefficient: parseFloat(e.target.value),
    });
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="p-4 border border-gray-200 rounded-md mb-4 shadow-sm bg-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-md font-medium">Период работы</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          disabled={isDeleteDisabled}
          title={isDeleteDisabled ? "Необходим минимум один период" : "Удалить период"}
          className="h-8 w-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`start-date-${period.id}`} className="text-sm">Дата начала</Label>
          <Input
            id={`start-date-${period.id}`}
            type="date"
            value={formatDateForInput(period.startDate)}
            onChange={handleStartDateChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`end-date-${period.id}`} className="text-sm">Дата окончания</Label>
          <Input
            id={`end-date-${period.id}`}
            type="date"
            value={formatDateForInput(period.endDate)}
            onChange={handleEndDateChange}
            min={period.startDate ? formatDateForInput(period.startDate) : ""}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`coefficient-${period.id}`} className="text-sm">Коэффициент</Label>
          <select
            id={`coefficient-${period.id}`}
            value={period.coefficient}
            onChange={handleCoefficientChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {coefficientOptions.map(coef => (
              <option key={coef} value={coef}>
                {coef === 1 ? "1 (обычный стаж)" : coef}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default WorkPeriodInput;
