
import React from "react";
import { formatExperience } from "@/utils/calculatorUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ResultDisplayProps {
  totalDays: number;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ totalDays }) => {
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

export default ResultDisplay;
