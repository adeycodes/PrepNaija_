import { useLocation } from "wouter";
import StudyPathSystem from "@/components/dashboard/StudyPathSystem";

export default function StudyPath() {
  const [location] = useLocation();

  // Parse subject from URL query params
  const searchParams = new URLSearchParams(window.location.search);
  const preselectedSubject = searchParams.get("subject");

  return (
    <div className="min-h-screen bg-background">
      <StudyPathSystem initialSubject={preselectedSubject} />
    </div>
  );
}
