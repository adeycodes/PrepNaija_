import { storage } from "../storage";
import { generateQuestionVariation } from "./openaiService";
import { alocService } from "./alocService";
import type { Question, InsertQuestion } from "@shared/schema";

export const SUBJECTS = ["Mathematics", "English", "Physics", "Chemistry", "Biology"];
export const EXAM_TYPES = ["JAMB", "WAEC", "NECO"];

export class QuestionService {
  async getQuestionsForQuiz(subject: string, count: number = 20, examType: string = 'JAMB'): Promise<Question[]> {
    try {
      // First, try to get questions from ALOC API (authentic past questions)
      let questions: Question[] = [];
      
      try {
        console.log(`Fetching ${count} recent ${subject} questions (${examType}) from ALOC API...`);
        const alocQuestions = await alocService.fetchRecentQuestions(subject, count, examType);
        
        if (alocQuestions.length > 0) {
          // Convert ALOC questions to our format and save to database for caching
          for (const alocQ of alocQuestions) {
            const convertedQuestion = alocService.convertToOurFormat(alocQ, subject, examType);
            try {
              const savedQuestion = await storage.createQuestion(convertedQuestion);
              questions.push(savedQuestion);
            } catch (saveError) {
              // If question already exists, skip (likely duplicate)
              console.log('Skipping duplicate question from ALOC API');
            }
          }
          
          console.log(`Successfully fetched ${questions.length} questions from ALOC API`);
          return questions.slice(0, count);
        }
      } catch (alocError) {
        console.log('ALOC API unavailable, falling back to local questions:', alocError);
      }
      
      // Fallback: Get questions from local database
      questions = await storage.getRandomQuestions(subject, count, examType);
      
      // If we still don't have enough questions, generate some using AI
      if (questions.length < count && questions.length > 0) {
        const needed = count - questions.length;
        const generated = await this.generateAdditionalQuestions(questions[0], needed);
        questions.push(...generated);
      }
      
      return questions.slice(0, count);
    } catch (error) {
      console.error("Error getting questions for quiz:", error);
      throw new Error("Failed to load quiz questions");
    }
  }

  async getFilteredQuestions(params: {
    subject: string;
    count: number;
    examType?: string;
    difficulty?: string;
    topics?: string[];
    excludeIds?: string[];
  }): Promise<Question[]> {
    const { subject, count, examType, difficulty, topics, excludeIds } = params;

    // Prefer database with filters; ALOC API does not support filtering by difficulty/topics reliably
    let base = await storage.getFilteredRandomQuestions({
      subject,
      count,
      examType,
      difficulty,
      topics,
      excludeIds,
    });

    // If not enough, top-up with general random and AI generation
    if (base.length < count) {
      const more = await storage.getRandomQuestions(subject, count - base.length, examType);
      base = base.concat(more);
    }

    if (base.length < count && base.length > 0) {
      const needed = count - base.length;
      const generated = await this.generateAdditionalQuestions(base[0], needed);
      base.push(...generated);
    }

    return base.slice(0, count);
  }

  async generateAdditionalQuestions(baseQuestion: Question, count: number): Promise<Question[]> {
    const generated: Question[] = [];
    
    for (let i = 0; i < Math.min(count, 5); i++) { // Limit to 5 AI generations per request
      try {
        const variation = await generateQuestionVariation(baseQuestion);
        
        const newQuestion: InsertQuestion = {
          subject: baseQuestion.subject,
          topic: baseQuestion.topic,
          questionText: variation.questionText,
          options: {
            A: variation.optionA,
            B: variation.optionB,
            C: variation.optionC,
            D: variation.optionD
          },
          correctAnswer: variation.correctAnswer,
          difficulty: baseQuestion.difficulty || "medium",
          explanation: variation.explanation,
          examType: baseQuestion.examType,
          year: new Date().getFullYear(),
        };

        const created = await storage.createQuestion(newQuestion);
        generated.push(created);
      } catch (error) {
        console.error(`Error generating question ${i + 1}:`, error);
        // Continue with other generations even if one fails
      }
    }

    return generated;
  }

  async seedInitialQuestions(): Promise<void> {
    const existingQuestions = await storage.getAllQuestions();
    
    // If we have fewer than 100 questions, seed more from ALOC
    if (existingQuestions.length >= 100) {
      console.log(`Questions already seeded (${existingQuestions.length} total)`);
      return;
    }
    
    console.log("🚀 Starting comprehensive question seeding from ALOC API (2015-2025)...");
    
    // First, try fetching a few questions from ALOC API (gentler approach)
    try {
      console.log('🔍 Testing ALOC API connection...');
      const isConnected = await alocService.testConnection();
      
      if (isConnected) {
        console.log('✅ ALOC API is accessible! Fetching sample questions...');
        
        // Fetch a few questions from each subject for immediate use
        const subjects = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology'];
        const examTypes = ['JAMB', 'WAEC', 'NECO'];
        let totalFetched = 0;
        
        for (const subject of subjects) {
          for (const examType of examTypes) {
            try {
              console.log(`📖 Fetching ${subject} ${examType} questions...`);
              const questions = await alocService.fetchRecentQuestions(subject, 3, examType);
              
              for (const alocQ of questions) {
                try {
                  const convertedQuestion = alocService.convertToOurFormat(alocQ, subject, examType);
                  await storage.createQuestion(convertedQuestion);
                  totalFetched++;
                } catch (saveError) {
                  console.log('Skipping duplicate question');
                }
              }
              
              // Delay between requests to respect rate limits
              await new Promise(resolve => setTimeout(resolve, 2000));
              
            } catch (error) {
              console.log(`⚠️ Could not fetch ${subject} ${examType}: ${error}`);
            }
          }
        }
        
        if (totalFetched > 0) {
          console.log(`🎉 Successfully fetched ${totalFetched} questions from ALOC API`);
          return; // Success! No need for fallback seeding
        }
      }
    } catch (alocError) {
      console.log('⚠️  ALOC API not available, falling back to local seeding:', alocError);
    }
    
    // Fallback: Seed basic local questions if ALOC fails
    console.log("📝 Seeding fallback local questions...");

    const initialQuestions: InsertQuestion[] = [
      // Mathematics
      {
        subject: "Mathematics",
        topic: "Logarithms",
        questionText: "If log₁₀2 = 0.3010, find log₁₀8",
        options: {
          A: "0.9030",
          B: "0.9020",
          C: "0.9010",
          D: "0.9000"
        },
        correctAnswer: "A",
        difficulty: "hard",
        explanation: "log₁₀8 = log₁₀(2³) = 3log₁₀2 = 3(0.3010) = 0.9030",
        examType: "JAMB",
        year: 2024,
      },
      {
        subject: "Mathematics",
        topic: "Ratio and Proportion",
        questionText: "The ages of Kemi and Tolu are in the ratio 2:3. If Kemi is 12 years old, how old is Tolu?",
        options: {
          A: "18 years",
          B: "15 years",
          C: "20 years",
          D: "16 years"
        },
        correctAnswer: "A",
        difficulty: "medium",
        explanation: "If Kemi:Tolu = 2:3 and Kemi = 12, then 2x = 12, so x = 6. Therefore Tolu = 3x = 3(6) = 18 years",
        examType: "JAMB",
        year: 2024,
      },
      // English
      {
        subject: "English",
        topic: "Vocabulary",
        questionText: "Choose the option that best completes the gap: The principal _____ the students for their poor performance.",
        options: {
          A: "berated",
          B: "bereaved",
          C: "betrayed",
          D: "beloved"
        },
        correctAnswer: "A",
        difficulty: "medium",
        explanation: "Berated means to scold or criticize angrily, which fits the context of poor performance",
        examType: "WAEC",
        year: 2024,
      },
      {
        subject: "English",
        topic: "Grammar",
        questionText: "Which of the following sentences is correct?",
        options: {
          A: "Neither John nor his friends were present",
          B: "Neither John nor his friends was present",
          C: "Either John or his friends were present",
          D: "Neither John or his friends were present"
        },
        correctAnswer: "B",
        difficulty: "hard",
        explanation: "With 'neither...nor' construction, the verb agrees with the subject closest to it. Since 'John' (singular) is closest, we use 'was'",
        examType: "WAEC",
        year: 2024,
      },
      // Physics
      {
        subject: "Physics",
        topic: "Motion",
        questionText: "A car travels 60km in the first hour and 40km in the second hour. Calculate the average speed.",
        options: {
          A: "50 km/h",
          B: "100 km/h", 
          C: "60 km/h",
          D: "40 km/h"
        },
        correctAnswer: "A",
        difficulty: "medium",
        explanation: "Average speed = Total distance / Total time = (60 + 40) / 2 = 100/2 = 50 km/h",
        examType: "JAMB",
        year: 2024,
      },
      // Chemistry
      {
        subject: "Chemistry",
        topic: "Organic Chemistry",
        questionText: "What is the molecular formula of glucose?",
        options: {
          A: "C₆H₁₂O₆",
          B: "C₆H₁₀O₅",
          C: "C₅H₁₂O₆",
          D: "C₆H₁₂O₅"
        },
        correctAnswer: "A",
        difficulty: "easy",
        explanation: "Glucose is a simple sugar with the molecular formula C₆H₁₂O₆, containing 6 carbon atoms, 12 hydrogen atoms, and 6 oxygen atoms",
        examType: "JAMB",
        year: 2024,
      },
      // Biology
      {
        subject: "Biology",
        topic: "Cell Biology",
        questionText: "Which organelle is responsible for photosynthesis in plant cells?",
        options: {
          A: "Chloroplast",
          B: "Mitochondria",
          C: "Nucleus",
          D: "Ribosome"
        },
        correctAnswer: "A",
        difficulty: "easy",
        explanation: "Chloroplasts contain chlorophyll and are the sites where photosynthesis occurs in plant cells, converting light energy into chemical energy",
        examType: "JAMB",
        year: 2024,
      },
    ];

    for (const question of initialQuestions) {
      try {
        await storage.createQuestion(question);
      } catch (error) {
        console.error("Error seeding questionText:", error);
      }
    }

    console.log(`Seeded ${initialQuestions.length} initial questions`);
  }
}

export const questionService = new QuestionService();
