import axios from 'axios';
import type { InsertQuestion } from '@shared/schema';

// ALOC API configuration
const ALOC_API_BASE = 'https://questions.aloc.com.ng/api/v2';
const ALOC_ACCESS_TOKEN = process.env.ALOC_ACCESS_TOKEN || '';

// Map our exam types to ALOC types
const EXAM_TYPE_MAPPING = {
  'JAMB': 'utme',
  'WAEC': 'wassce', 
  'NECO': 'neco'
};

// Map our subjects to ALOC subjects (they use lowercase)
const SUBJECT_MAPPING = {
  'Mathematics': 'mathematics',
  'English': 'english',
  'Physics': 'physics', 
  'Chemistry': 'chemistry',
  'Biology': 'biology'
};

interface ALOCQuestion {
  id: string;
  question: string;
  option: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  answer: string;
  solution: string;
  examtype: string;
  examyear: string;
  subject: string;
}

interface ALOCResponse {
  data: ALOCQuestion[];
  status: boolean;
  message?: string;
}

export class ALOCService {
  private baseHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(ALOC_ACCESS_TOKEN && { 'AccessToken': ALOC_ACCESS_TOKEN })
  };

  /**
   * Fetch questions from ALOC API
   */
  async fetchQuestions(
    subject: string, 
    count: number = 20, 
    examType: string = 'JAMB',
    year?: number
  ): Promise<ALOCQuestion[]> {
    try {
      const alocSubject = SUBJECT_MAPPING[subject as keyof typeof SUBJECT_MAPPING];
      const alocExamType = EXAM_TYPE_MAPPING[examType as keyof typeof EXAM_TYPE_MAPPING];

      if (!alocSubject) {
        throw new Error(`Subject ${subject} not supported by ALOC API`);
      }

      // Build query parameters
      const params = new URLSearchParams({
        subject: alocSubject,
        ...(alocExamType && { type: alocExamType }),
        ...(year && { year: year.toString() })
      });

      // Use the appropriate endpoint based on count
      let endpoint = '';
      if (count === 1) {
        endpoint = `/q?${params}`;
      } else if (count <= 40) {
        endpoint = `/q/${count}?${params}`;
      } else {
        // For more than 40, make multiple requests
        endpoint = `/m?${params}`;
      }

      const response = await axios.get(`${ALOC_API_BASE}${endpoint}`, {
        headers: this.baseHeaders,
        timeout: 10000 // 10 second timeout
      });

      if (response.data.status === false) {
        throw new Error(response.data.message || 'ALOC API returned error');
      }

      // Handle different response formats
      let questions: ALOCQuestion[] = [];
      if (Array.isArray(response.data.data)) {
        questions = response.data.data;
      } else if (response.data.data) {
        questions = [response.data.data];
      } else {
        questions = [];
      }

      return questions.slice(0, count); // Ensure we don't exceed requested count

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          throw new Error('ALOC API is currently unavailable');
        }
        throw new Error(`ALOC API error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Convert ALOC question format to our database format
   */
  convertToOurFormat(alocQuestion: ALOCQuestion, subject: string, examType: string): InsertQuestion {
    return {
      subject: subject,
      topic: this.extractTopic(alocQuestion.question),
      questionText: alocQuestion.question,
      options: {
        A: alocQuestion.option.a,
        B: alocQuestion.option.b,
        C: alocQuestion.option.c,
        D: alocQuestion.option.d
      },
      correctAnswer: alocQuestion.answer.toUpperCase(),
      difficulty: this.estimateDifficulty(alocQuestion.question),
      explanation: alocQuestion.solution || `The correct answer is ${alocQuestion.answer.toUpperCase()}.`,
      examType: examType,
      year: parseInt(alocQuestion.examyear) || new Date().getFullYear()
    };
  }

  /**
   * Extract topic from question text (simple heuristic)
   */
  private extractTopic(questionText: string): string {
    const text = questionText.toLowerCase();
    
    // Mathematics topics
    if (text.includes('log') || text.includes('logarithm')) return 'Logarithms';
    if (text.includes('ratio') || text.includes('proportion')) return 'Ratio and Proportion';
    if (text.includes('algebra') || text.includes('equation')) return 'Algebra';
    if (text.includes('geometry') || text.includes('triangle') || text.includes('circle')) return 'Geometry';
    
    // English topics
    if (text.includes('grammar') || text.includes('tense') || text.includes('verb')) return 'Grammar';
    if (text.includes('vocabulary') || text.includes('meaning') || text.includes('synonym')) return 'Vocabulary';
    if (text.includes('comprehension') || text.includes('passage')) return 'Comprehension';
    
    // Physics topics
    if (text.includes('motion') || text.includes('speed') || text.includes('velocity')) return 'Motion';
    if (text.includes('force') || text.includes('newton')) return 'Forces';
    if (text.includes('energy') || text.includes('work') || text.includes('power')) return 'Energy';
    if (text.includes('wave') || text.includes('sound') || text.includes('light')) return 'Waves';
    
    // Chemistry topics
    if (text.includes('organic') || text.includes('carbon') || text.includes('hydrocarbon')) return 'Organic Chemistry';
    if (text.includes('acid') || text.includes('base') || text.includes('salt')) return 'Acids and Bases';
    if (text.includes('periodic') || text.includes('element')) return 'Periodic Table';
    
    // Biology topics
    if (text.includes('cell') || text.includes('organelle')) return 'Cell Biology';
    if (text.includes('plant') || text.includes('photosynthesis')) return 'Plant Biology';
    if (text.includes('human') || text.includes('anatomy')) return 'Human Biology';
    if (text.includes('evolution') || text.includes('genetics')) return 'Evolution and Genetics';
    
    return 'General'; // Default topic
  }

  /**
   * Estimate difficulty based on question complexity (simple heuristic)
   */
  private estimateDifficulty(questionText: string): string {
    const text = questionText.toLowerCase();
    const complexWords = ['calculate', 'determine', 'evaluate', 'analyze', 'derive', 'prove'];
    const mediumWords = ['find', 'solve', 'identify', 'explain'];
    
    if (complexWords.some(word => text.includes(word))) return 'hard';
    if (mediumWords.some(word => text.includes(word))) return 'medium';
    return 'easy';
  }

  /**
   * Test ALOC API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${ALOC_API_BASE}/q?subject=mathematics`, {
        headers: this.baseHeaders,
        timeout: 5000
      });
      return response.status === 200 && response.data.status !== false;
    } catch (error) {
      console.error('ALOC API connection test failed:', error);
      return false;
    }
  }

  /**
   * Get available subjects from ALOC API
   */
  async getSubjects(): Promise<string[]> {
    // ALOC supports these subjects based on their documentation
    return Object.keys(SUBJECT_MAPPING);
  }

  /**
   * Get supported exam types
   */
  getExamTypes(): string[] {
    return Object.keys(EXAM_TYPE_MAPPING);
  }

  /**
   * Seed questions for specific year range (2015-2025)
   */
  async seedQuestionsForYearRange(
    subject: string,
    examType: string,
    startYear: number = 2015,
    endYear: number = 2025,
    questionsPerYear: number = 10
  ): Promise<{ total: number; successful: number; errors: string[] }> {
    const results = {
      total: 0,
      successful: 0,
      errors: [] as string[]
    };

    for (let year = startYear; year <= endYear; year++) {
      try {
        console.log(`Seeding ${subject} ${examType} questions for year ${year}...`);
        const questions = await this.fetchQuestions(subject, questionsPerYear, examType, year);
        results.total += questions.length;
        
        for (const question of questions) {
          try {
            const convertedQuestion = this.convertToOurFormat(question, subject, examType);
            // Override the year to ensure accuracy
            convertedQuestion.year = year;
            results.successful++;
          } catch (conversionError) {
            results.errors.push(`Failed to convert question for ${subject} ${examType} ${year}: ${conversionError}`);
          }
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 3000)); // Increased to 3 seconds
        
      } catch (error) {
        const errorMsg = `Failed to fetch ${subject} ${examType} questions for ${year}: ${error}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    return results;
  }

  /**
   * Comprehensive seeding strategy for all subjects, exam types, and years
   */
  async seedComprehensiveQuestions(
    startYear: number = 2015,
    endYear: number = 2025
  ): Promise<{ [key: string]: any }> {
    const subjects = Object.keys(SUBJECT_MAPPING);
    const examTypes = Object.keys(EXAM_TYPE_MAPPING);
    const results: { [key: string]: any } = {
      totalAttempted: 0,
      totalSuccessful: 0,
      totalErrors: 0,
      bySubject: {},
      errors: [] as string[]
    };

    console.log(`\n🎯 Starting comprehensive question seeding for years ${startYear}-${endYear}`);
    console.log(`📚 Subjects: ${subjects.join(', ')}`);
    console.log(`📝 Exam Types: ${examTypes.join(', ')}`);
    
    for (const subject of subjects) {
      results.bySubject[subject] = {};
      
      for (const examType of examTypes) {
        console.log(`\n📖 Processing ${subject} - ${examType}...`);
        
        try {
          const seedResult = await this.seedQuestionsForYearRange(
            subject,
            examType,
            startYear,
            endYear,
            5 // 5 questions per year per subject per exam type
          );
          
          results.bySubject[subject][examType] = seedResult;
          results.totalAttempted += seedResult.total;
          results.totalSuccessful += seedResult.successful;
          results.totalErrors += seedResult.errors.length;
          results.errors.push(...seedResult.errors);
          
          console.log(`✅ ${subject} ${examType}: ${seedResult.successful}/${seedResult.total} questions seeded`);
          
        } catch (error) {
          const errorMsg = `Failed to seed ${subject} ${examType}: ${error}`;
          console.error(`❌ ${errorMsg}`);
          results.errors.push(errorMsg);
        }
        
        // Delay between different subject-exam combinations
        await new Promise(resolve => setTimeout(resolve, 5000)); // Increased to 5 seconds
      }
    }
    
    console.log(`\n🎉 Comprehensive seeding completed!`);
    console.log(`📊 Total: ${results.totalSuccessful}/${results.totalAttempted} questions seeded successfully`);
    console.log(`❌ Errors: ${results.totalErrors}`);
    
    return results;
  }

  /**
   * Get questions prioritizing recent years (2020-2025)
   */
  async fetchRecentQuestions(
    subject: string,
    count: number = 20,
    examType: string = 'JAMB'
  ): Promise<ALOCQuestion[]> {
    try {
      // First try without specifying year (get any available questions)
      console.log(`Fetching any available ${subject} ${examType} questions...`);
      const questions = await this.fetchQuestions(subject, count, examType);
      
      if (questions.length > 0) {
        console.log(`Found ${questions.length} ${subject} ${examType} questions`);
        return questions.slice(0, count);
      }
      
      // If no questions found, try recent years
      const currentYear = new Date().getFullYear();
      const recentYears = [currentYear, currentYear - 1, currentYear - 2];
      
      for (const year of recentYears) {
        try {
          const yearQuestions = await this.fetchQuestions(subject, count, examType, year);
          if (yearQuestions.length > 0) {
            console.log(`Found ${yearQuestions.length} ${subject} ${examType} questions from ${year}`);
            return yearQuestions.slice(0, count);
          }
        } catch (error) {
          console.log(`No questions for ${subject} ${examType} ${year}`);
          continue;
        }
      }
      
      return [];
      
    } catch (error) {
      console.log(`Error fetching ${subject} ${examType} questions:`, error);
      return [];
    }
  }

  /**
   * Get year-specific questions for analysis
   */
  async getQuestionsByYear(
    subject: string,
    examType: string,
    year: number
  ): Promise<ALOCQuestion[]> {
    return await this.fetchQuestions(subject, 40, examType, year); // Max 40 per request
  }

  /**
   * Analyze available questions by year
   */
  async analyzeQuestionCoverage(
    subject: string,
    examType: string,
    startYear: number = 2015,
    endYear: number = 2025
  ): Promise<{ [year: number]: number }> {
    const coverage: { [year: number]: number } = {};
    
    for (let year = startYear; year <= endYear; year++) {
      try {
        const questions = await this.fetchQuestions(subject, 1, examType, year);
        coverage[year] = questions.length > 0 ? 1 : 0; // Just checking availability
      } catch (error) {
        coverage[year] = 0;
      }
    }
    
    return coverage;
  }
}

export const alocService = new ALOCService();
