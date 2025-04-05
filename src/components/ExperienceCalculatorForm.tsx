
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WorkPeriodInput from "@/components/WorkPeriodInput";
import ResultDisplay from "@/components/ResultDisplay";
import { WorkPeriod, calculateExperience } from "@/utils/calculatorUtils";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const ExperienceCalculatorForm: React.FC = () => {
  const [periods, setPeriods] = useState<WorkPeriod[]>([
    {
      id: uuidv4(),
      startDate: null,
      endDate: null,
      coefficient: 1,
    },
  ]);

  const addPeriod = () => {
    setPeriods([
      ...periods,
      {
        id: uuidv4(),
        startDate: null,
        endDate: null,
        coefficient: 1,
      },
    ]);
  };

  const updatePeriod = (id: string, updatedPeriod: WorkPeriod) => {
    setPeriods(
      periods.map((period) => (period.id === id ? updatedPeriod : period))
    );
  };

  const removePeriod = (id: string) => {
    setPeriods(periods.filter((period) => period.id !== id));
  };

  const totalDays = calculateExperience(periods);

  return (
    <Card>
      <CardHeader className="bg-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-center">Калькулятор стажа работы с коэффициентами</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800">
            <p>
              Укажите периоды работы, для каждого периода выберите соответствующий коэффициент.
              Результат будет автоматически рассчитан с учетом всех периодов и коэффициентов.
            </p>
          </div>

          <div className="space-y-4">
            {periods.map((period) => (
              <WorkPeriodInput
                key={period.id}
                period={period}
                onChange={(updatedPeriod) => updatePeriod(period.id, updatedPeriod)}
                onDelete={() => removePeriod(period.id)}
                isDeleteDisabled={periods.length === 1}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={addPeriod}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Добавить период
            </Button>
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
