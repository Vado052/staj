
export type WorkPeriod = {
  id: string;
  name: string; // Added name field
  startDate: Date | null;
  endDate: Date | null;
  coefficient: number;
};

export type Employee = {
  name: string;
  periods: WorkPeriod[];
};

export const calculateExperience = (periods: WorkPeriod[]): number => {
  let totalDays = 0;

  periods.forEach((period) => {
    if (period.startDate && period.endDate) {
      // Calculate days difference
      const timeDiff = period.endDate.getTime() - period.startDate.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      
      // Apply coefficient
      totalDays += daysDiff * period.coefficient;
    }
  });

  return Math.floor(totalDays);
};

export const formatExperience = (days: number): string => {
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = Math.floor(days % 30);
  
  let result = '';
  
  if (years > 0) {
    result += `${years} ${pluralize(years, 'год', 'года', 'лет')} `;
  }
  
  if (months > 0) {
    result += `${months} ${pluralize(months, 'месяц', 'месяца', 'месяцев')} `;
  }
  
  if (remainingDays > 0 || (years === 0 && months === 0)) {
    result += `${remainingDays} ${pluralize(remainingDays, 'день', 'дня', 'дней')}`;
  }
  
  return result.trim();
};

// Russian pluralize function
const pluralize = (count: number, form1: string, form2: string, form5: string): string => {
  let n = Math.abs(count) % 100;
  if (n >= 5 && n <= 20) {
    return form5;
  }
  
  n %= 10;
  if (n === 1) {
    return form1;
  }
  
  if (n >= 2 && n <= 4) {
    return form2;
  }
  
  return form5;
};

// Function to save employee data to a file
export const saveEmployeeData = (employee: Employee): void => {
  const data = JSON.stringify(employee, (key, value) => {
    // Convert Date objects to strings
    if (key === 'startDate' || key === 'endDate') {
      return value ? new Date(value).toISOString() : null;
    }
    return value;
  }, 2);
  
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' });
  const fileName = `${employee.name.replace(/\s+/g, '_')}_стаж.txt`;
  
  // Create a download link and trigger it
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  
  // Cleanup
  URL.revokeObjectURL(link.href);
};

// Function to parse employee data from file content
export const parseEmployeeData = (content: string): Employee => {
  try {
    const parsed = JSON.parse(content);
    
    // Convert string dates back to Date objects
    if (parsed.periods && Array.isArray(parsed.periods)) {
      parsed.periods = parsed.periods.map((period: WorkPeriod) => ({
        ...period,
        startDate: period.startDate ? new Date(period.startDate) : null,
        endDate: period.endDate ? new Date(period.endDate) : null,
      }));
    }
    
    return parsed;
  } catch (error) {
    console.error('Error parsing employee data:', error);
    return { name: '', periods: [] };
  }
};
