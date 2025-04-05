
import ExperienceCalculatorForm from "@/components/ExperienceCalculatorForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <header className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2">
            Калькулятор стажа работы
          </h1>
          <p className="text-gray-600">
            Расчет общего трудового стажа с применением коэффициентов
          </p>
        </header>
        
        <main>
          <ExperienceCalculatorForm />
        </main>
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>© 2025 Калькулятор стажа работы</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
