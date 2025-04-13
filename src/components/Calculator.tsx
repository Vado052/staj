
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkPeriod, Employee, calculateExperience, saveEmployeeData, parseEmployeeData } from "@/utils/calculatorUtils";
import { Plus, Download, Upload, Save, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

// Military ranks list
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

// Coefficients available for selection
const coefficientOptions = [1, 1.5, 2, 3];

// Format experience for display
const formatExperience = (totalDays: number): string => {
  const years = Math.floor(totalDays / 365);
  const months = Math.floor((totalDays % 365) / 30);
  const days = Math.floor((totalDays % 365) % 30);

  return `${years} ${getYearLabel(years)}, ${months} ${getMonthLabel(months)}, ${days} ${getDayLabel(days)}`;
};

// Helper functions for proper Russian word endings
const getYearLabel = (years: number): string => {
  if (years % 10 === 1 && years % 100 !== 11) return "год";
  if ([2, 3, 4].includes(years % 10) && ![12, 13, 14].includes(years % 100)) return "года";
  return "лет";
};

const getMonthLabel = (months: number): string => {
  if (months % 10 === 1 && months % 100 !== 11) return "месяц";
  if ([2, 3, 4].includes(months % 10) && ![12, 13, 14].includes(months % 100)) return "месяца";
  return "месяцев";
};

const getDayLabel = (days: number): string => {
  if (days % 10 === 1 && days % 100 !== 11) return "день";
  if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return "дня";
  return "дней";
};

// Employee Info Input Component
const EmployeeInfoInput = ({ name, rank, onChange, onRankChange }: {
  name: string;
  rank?: string;
  onChange: (name: string) => void;
  onRankChange: (rank: string) => void;
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

// Work Period Input Component
const WorkPeriodInput = ({ 
  period, 
  onChange, 
  onDelete, 
  isDeleteDisabled 
}: { 
  period: WorkPeriod; 
  onChange: (updatedPeriod: WorkPeriod) => void; 
  onDelete: () => void; 
  isDeleteDisabled: boolean; 
}) => {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...period,
      name: e.target.value,
    });
  };

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
        <div className="flex-grow mr-4">
          <Input
            type="text"
            value={period.name || ""}
            onChange={handleNameChange}
            placeholder="Название периода"
            className="font-medium"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          disabled={isDeleteDisabled}
          title={isDeleteDisabled ? "Необходим минимум один период" : "Удалить период"}
          className="h-8 w-8 flex-shrink-0"
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

// Result Display Component
const ResultDisplay = ({ totalDays }: { totalDays: number }) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-center text-blue-800">Результат расчета</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <p className="text-sm text-blue-700 mb-1">Общий трудовой стаж с учетом коэффициентов:</p>
          <p className="text-2xl font-bold text-blue-900">{formatExperience(totalDays)}</p>
          <p className="text-sm text-blue-600 mt-2">({totalDays} дней)</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Calculator Component
const Calculator: React.FC = () => {
  const [employee, setEmployee] = useState<Employee>({
    name: "",
    rank: "",
    periods: [
      {
        id: uuidv4(),
        name: "Основной период",
        startDate: null,
        endDate: null,
        coefficient: 1,
      },
    ],
  });
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const addPeriod = () => {
    // Generate a number for the new period
    const periodNumber = employee.periods.length + 1;
    
    setEmployee({
      ...employee,
      periods: [
        ...employee.periods,
        {
          id: uuidv4(),
          name: `Период ${periodNumber}`,
          startDate: null,
          endDate: null,
          coefficient: 1,
        },
      ]
    });
  };

  
  const updatePeriod = (id: string, updatedPeriod: WorkPeriod) => {
    setEmployee({
      ...employee,
      periods: employee.periods.map((period) => 
        period.id === id ? updatedPeriod : period
      )
    });
  };

  const removePeriod = (id: string) => {
    setEmployee({
      ...employee,
      periods: employee.periods.filter((period) => period.id !== id)
    });
  };

  const updateEmployeeName = (name: string) => {
    setEmployee({
      ...employee,
      name
    });
  };
  
  const updateEmployeeRank = (rank: string) => {
    setEmployee({
      ...employee,
      rank
    });
  };

  const handleSaveData = () => {
    if (!employee.name.trim()) {
      toast.error("Пожалуйста, введите ФИО работника");
      return;
    }

    saveEmployeeData(employee);
    toast.success("Данные успешно сохранены");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const loadedEmployee = parseEmployeeData(content);
        
        // Ensure all periods have names (for backwards compatibility)
        if (loadedEmployee && loadedEmployee.periods) {
          loadedEmployee.periods = loadedEmployee.periods.map((period, index) => ({
            ...period,
            name: period.name || `Период ${index + 1}`
          }));
        }
        
        setEmployee(loadedEmployee);
        toast.success("Данные успешно загружены");
      } catch (error) {
        toast.error("Ошибка при загрузке файла");
        console.error(error);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const totalDays = calculateExperience(employee.periods);

  return (
    <Card>
      <CardHeader className="bg-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-center">Калькулятор стажа работы с коэффициентами</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
            <p>
              Укажите ФИО работника и периоды работы. Для каждого периода выберите соответствующий коэффициент.
              Результат будет автоматически рассчитан с учетом всех периодов и коэффициентов.
              Вы можете сохранить данные в файл или загрузить ранее сохраненные данные.
            </p>
          </div>

          <EmployeeInfoInput 
            name={employee.name} 
            rank={employee.rank}
            onChange={updateEmployeeName}
            onRankChange={updateEmployeeRank}
          />

          <div className="space-y-4">
            {employee.periods.map((period) => (
              <WorkPeriodInput
                key={period.id}
                period={period}
                onChange={(updatedPeriod) => updatePeriod(period.id, updatedPeriod)}
                onDelete={() => removePeriod(period.id)}
                isDeleteDisabled={employee.periods.length === 1}
              />
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              onClick={addPeriod}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Добавить период
            </Button>
            
            <Button
              onClick={handleSaveData}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" /> Сохранить в файл
            </Button>
            
            <Button
              onClick={triggerFileUpload}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" /> Загрузить из файла
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".txt,.json"
              style={{ display: 'none' }}
            />
          </div>

          <div className="mt-8">
            <ResultDisplay totalDays={totalDays} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Calculator;
