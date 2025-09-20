import { useLocation } from "wouter";
import QuizSelector from "@/components/QuizSelector";
import DashboardLayout from "@/components/DashboardLayout";

export default function QuizSelectorPage() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation("/dashboard");
  };

  return (
    <DashboardLayout activeTab="subjects" onTabChange={() => {}}>
      <div className="p-6">
        <QuizSelector onBack={handleBack} />
      </div>
    </DashboardLayout>
  );
}
