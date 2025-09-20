import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import QuizInterface from "@/components/QuizInterface";
import { SUBJECTS } from "@/utils/constants";

interface QuizUrlParams {
  subject: string;
  examType: string;
  count: number;
  difficulty: string;
  topics: string[];
}

interface DebugInfo {
  href: string;
  search: string;
  pathname: string;
  queryString: string;
  paramEntries: [string, string][];
  wouterlocation: string;
  timestamp: string;
  error?: string;
}

export default function Quiz() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [urlParams, setUrlParams] = useState<QuizUrlParams | null>(null);
  const [debugInfo, setDebugInfo] = useState<Partial<DebugInfo>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Extract URL parameters on component mount and when URL changes
  useEffect(() => {
    const extractParams = () => {
      try {
        console.log('=== URL EXTRACTION START ===');
        
        // Multiple ways to get the URL
        const href = window.location.href;
        const search = window.location.search;
        const pathname = window.location.pathname;
        const hash = window.location.hash;
        
        console.log('window.location.href:', href);
        console.log('window.location.search:', search);
        console.log('window.location.pathname:', pathname);
        console.log('window.location.hash:', hash);
        console.log('wouter location:', location);
        
        // Try to extract query string
        let queryString = '';
        if (search && search.length > 1) {
          queryString = search.substring(1); // Remove '?'
        } else if (href.includes('?')) {
          queryString = href.split('?')[1];
          if (queryString.includes('#')) {
            queryString = queryString.split('#')[0];
          }
        }
        
        console.log('Extracted query string:', queryString);
        
        const params = new URLSearchParams(queryString);
        console.log('URLSearchParams entries:', Array.from(params.entries()));
        
        const extractedParams: QuizUrlParams = {
          subject: params.get('subject') || '',
          examType: params.get('exam') || 'JAMB',
          count: parseInt(params.get('count') || '20', 10) || 20,
          difficulty: params.get('difficulty') || '',
          topics: (params.get('topics') || '').split(',').map((t: string) => t.trim()).filter(Boolean)
        };
        
        console.log('Extracted params:', extractedParams);
        
        const debug = {
          href,
          search,
          pathname,
          queryString,
          paramEntries: Array.from(params.entries()),
          wouterlocation: location,
          timestamp: new Date().toISOString()
        };
        
        setDebugInfo(debug);
        setUrlParams(extractedParams);
        setIsLoading(false);
        
        console.log('=== URL EXTRACTION END ===');
        
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error extracting URL parameters:', error);
        setDebugInfo({ error: errorMessage });
        setUrlParams({
          subject: '',
          examType: 'JAMB',
          count: 20,
          difficulty: '',
          topics: []
        });
        setIsLoading(false);
      }
    };

    extractParams();
    
    // Also listen for URL changes
    const handlePopState = () => {
      console.log('URL changed, re-extracting params');
      extractParams();
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    
  }, [location]); // Re-run when wouter location changes

  // Validate subject (only runs when urlParams is available)
  useEffect(() => {
    if (!urlParams || isLoading) return;
    
    const { subject } = urlParams;
    
    if (!subject || subject.length === 0) {
      console.log('No subject provided');
      return;
    }

    console.log('=== SUBJECT VALIDATION ===');
    console.log('Subject to validate:', subject);
    console.log('Available subjects:', SUBJECTS);
    
    // Check if SUBJECTS is properly loaded
    if (!Array.isArray(SUBJECTS) || SUBJECTS.length === 0) {
      console.error('SUBJECTS array is not properly loaded:', SUBJECTS);
      toast({
        title: "Configuration Error",
        description: "Subject list is not loaded. Please refresh the page.",
        variant: "destructive",
      });
      return;
    }

    const subjectExists = SUBJECTS.some((s: string) => 
      s && typeof s === 'string' && s.toLowerCase() === subject.toLowerCase()
    );
    
    console.log('Subject exists:', subjectExists);

    if (!subjectExists) {
      console.error('Invalid subject:', subject, 'Available:', SUBJECTS);
      toast({
        title: "Invalid Subject",
        description: `Subject "${subject}" not found. Available: ${SUBJECTS.join(', ')}`,
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/quiz-selector");
      }, 3000);
    }
  }, [urlParams, isLoading, toast, setLocation]);

  const handleQuizComplete = (sessionId: string) => {
    setLocation(`/results/${sessionId}`);
  };

  // Show loading while extracting parameters
  if (isLoading || !urlParams) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Loading Quiz...</h1>
            <p className="text-muted-foreground mb-4">Extracting URL parameters...</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Debug Info:</p>
              <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
              <p>Search: {typeof window !== 'undefined' ? window.location.search : 'N/A'}</p>
              <p>Pathname: {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</p>
              <p>Wouter Location: {location}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { subject, examType, count, difficulty, topics } = urlParams as QuizUrlParams;

  console.log('Rendering with params:', { subject, examType, count, difficulty, topics });
  console.log('SUBJECTS array:', SUBJECTS);

  // Show "No Subject Selected" if no subject
  if (!subject || subject.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">No Subject Selected</h1>
            <p className="text-muted-foreground mb-4">
              Please select a subject to start your quiz.
            </p>
            
            <div className="bg-gray-100 p-4 rounded-lg text-xs text-left mb-6 max-w-2xl mx-auto">
              <h3 className="font-bold mb-2">Debug Information:</h3>
              <div className="space-y-1">
                <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                <p><strong>Search params:</strong> {typeof window !== 'undefined' ? window.location.search : 'N/A'}</p>
                <p><strong>Wouter location:</strong> {location}</p>
                <p><strong>Extracted params:</strong> {JSON.stringify(urlParams)}</p>
                <p><strong>Available subjects:</strong> [{Array.isArray(SUBJECTS) ? SUBJECTS.join(', ') : 'Not loaded'}]</p>
                <p><strong>Debug info:</strong> {JSON.stringify(debugInfo, null, 2)}</p>
              </div>
            </div>
            
            <Button onClick={() => setLocation('/quiz-selector')} className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quiz Selector
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Validate subject exists
  if (!SUBJECTS || !SUBJECTS.some(s => s && s.toLowerCase && s.toLowerCase() === subject.toLowerCase())) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Subject</h1>
            <p className="text-muted-foreground mb-4">
              The subject "{subject}" is not available.
            </p>
            
            <div className="bg-gray-100 p-4 rounded-lg text-xs text-left mb-6 max-w-2xl mx-auto">
              <h3 className="font-bold mb-2">Debug Information:</h3>
              <div className="space-y-1">
                <p><strong>Received subject:</strong> "{subject}" (length: {subject.length})</p>
                <p><strong>Subject type:</strong> {typeof subject}</p>
                <p><strong>Available subjects:</strong> [{SUBJECTS ? SUBJECTS.join(', ') : 'Not loaded'}]</p>
                <p><strong>SUBJECTS type:</strong> {typeof SUBJECTS}</p>
                <p><strong>SUBJECTS is array:</strong> {Array.isArray(SUBJECTS) ? 'Yes' : 'No'}</p>
                <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                <p><strong>All extracted params:</strong> {JSON.stringify(urlParams)}</p>
              </div>
            </div>
            
            <button
              onClick={() => setLocation("/quiz-selector")}
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              Select Valid Subject
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Find the correct case version of the subject
  const correctSubject = SUBJECTS.find(s => 
    s && s.toLowerCase && s.toLowerCase() === subject.toLowerCase()
  ) || subject;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-quiz-title">
                {correctSubject} Practice Quiz ({examType})
              </h1>
              <p className="text-muted-foreground">
                Answer {count} questions to test your knowledge
              </p>
            </div>
            
            <button
              onClick={() => setLocation("/")}
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-back-dashboard"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <QuizInterface 
          subject={correctSubject}
          examType={examType}
          onQuizComplete={handleQuizComplete}
          count={count}
          difficulty={difficulty || undefined}
          topics={topics.length ? topics : undefined}
        />
      </main>
    </div>
  );
}