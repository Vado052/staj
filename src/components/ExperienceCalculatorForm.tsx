
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WorkPeriodInput from "@/components/WorkPeriodInput";
import ResultDisplay from "@/components/ResultDisplay";
import EmployeeInfoInput from "@/components/EmployeeInfoInput";
import { WorkPeriod, Employee, calculateExperience, saveEmployeeData, parseEmployeeData } from "@/utils/calculatorUtils";
import { Plus, Download, Upload, Save } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

const ExperienceCalculatorForm: React.FC = () => {
  const [employee, setEmployee] = useState<Employee>({
    name: "",
    periods: [
      {
        id: uuidv4(),
        startDate: null,
        endDate: null,
        coefficient: 1,
      },
    ],
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addPeriod = () => {
    setEmployee({
      ...employee,
      periods: [
        ...employee.periods,
        {
          id: uuidv4(),
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
            onChange={updateEmployeeName} 
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

export default ExperienceCalculatorForm;
