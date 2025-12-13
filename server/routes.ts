import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./authMiddleware";
import { setupAuthRoutes } from "./routes/auth";
import { questionService } from "./services/questionService";
import { alocService } from "./services/alocService";
import { generateExplanation } from "./services/openaiService";
import { sendStudyReminder, sendQuizResults } from "./services/smsService";
import { insertQuizSessionSchema, insertUserProgressSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Auth routes (login, signup, etc.)
  setupAuthRoutes(app);

  // Seed initial questions on startup
  setTimeout(async () => {
    try {
      await questionService.seedInitialQuestions();
    } catch (error) {
      console.error("Failed to seed questions:", error);
    }
  }, 1000);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const profile = await storage.getProfile(userId);
      
      res.json({
        ...user,
        profile,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Profile routes
  app.post('/api/profile/setup', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profileData = { id: userId, ...req.body };
      
      const existingProfile = await storage.getProfile(userId);
      let profile;
      
      if (existingProfile) {
        profile = await storage.updateProfile(userId, req.body);
      } else {
        profile = await storage.createProfile(profileData);
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error setting up profile:", error);
      res.status(500).json({ message: "Failed to setup profile" });
    }
  });

  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.updateProfile(userId, req.body);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Question routes
  app.get('/api/questions/random/:subject/:count', async (req, res) => {
    try {
      const { subject, count } = req.params;
      const { examType } = req.query;
      const questions = await questionService.getQuestionsForQuiz(
        subject, 
        parseInt(count), 
        examType as string || 'JAMB'
      );
      res.json(questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // ✅✅✅ NEW EXPLANATION ENDPOINT - THIS IS WHAT WAS MISSING ✅✅✅
  // ✅ FIXED EXPLANATION ENDPOINT
app.get('/api/questions/:id/explanation', isAuthenticated, async (req: any, res) => {
  try {
    const questionId = req.params.id;
    const userAnswer = req.query.userAnswer as string; // Get user's answer from query params
    
    console.log(`[Explanation] Request for question ${questionId}, userAnswer: ${userAnswer}`);
    
    // Get question from database
    const question = await storage.getQuestionById(parseInt(questionId));
    
    if (!question) {
      console.error(`[Explanation] Question ${questionId} not found`);
      return res.status(404).json({ 
        error: 'Question not found',
        message: `No question found with ID ${questionId}`
      });
    }
    
    console.log(`[Explanation] Found question:`, {
      id: question.id,
      subject: question.subject,
      questionText: question.questionText.substring(0, 50) + '...'
    });
    
    // Parse options from JSON
    let options;
    if (typeof question.options === 'string') {
      try {
        options = JSON.parse(question.options);
      } catch (e) {
        console.error('[Explanation] Failed to parse options:', e);
        return res.status(500).json({ error: 'Invalid question options format' });
      }
    } else {
      options = question.options;
    }
    
    // Ensure options have uppercase keys (A, B, C, D)
    const normalizedOptions = {
      A: options.A || options.a || '',
      B: options.B || options.b || '',
      C: options.C || options.c || '',
      D: options.D || options.d || ''
    };
    
    // Validate we have all required data
    if (!normalizedOptions.A || !normalizedOptions.B || !normalizedOptions.C || !normalizedOptions.D) {
      console.error('[Explanation] Missing options:', normalizedOptions);
      return res.status(500).json({ error: 'Question is missing required options' });
    }
    
    // Generate explanation
    const explanation = await generateExplanation({
      questionText: question.questionText,
      options: normalizedOptions,
      correctAnswer: question.correctAnswer,
      subject: question.subject,
      userAnswer: userAnswer || question.correctAnswer // Use provided userAnswer or default to correct
    });
    
    console.log(`[Explanation] Generated successfully for question ${questionId}`);
    
    return res.status(200).json({
      explanation: explanation.explanation,
      keyPoints: explanation.keyPoints,
      studyTips: explanation.studyTips,
      questionId: questionId,
      correctAnswer: question.correctAnswer,
      userAnswer: userAnswer
    });
    
  } catch (error) {
    console.error('[Explanation Error]:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return res.status(500).json({ 
      error: 'Failed to generate explanation',
      message: errorMessage
    });
  }
});

  // Filtered quiz generation
  app.get('/api/quiz/generate', async (req, res) => {
    try {
      const subject = (req.query.subject as string) || '';
      const count = parseInt((req.query.count as string) || '20');
      const examType = (req.query.examType as string) || 'JAMB';
      const difficulty = (req.query.difficulty as string) || undefined;
      const topicsParam = (req.query.topics as string) || '';
      const excludeParam = (req.query.excludeIds as string) || '';

      if (!subject) {
        return res.status(400).json({ message: 'subject is required' });
      }

      const topics = topicsParam
        ? topicsParam.split(',').map((t) => t.trim()).filter(Boolean)
        : undefined;
      const excludeIds = excludeParam
        ? excludeParam.split(',').map((t) => t.trim()).filter(Boolean)
        : undefined;

      const questions = await questionService.getFilteredQuestions({
        subject,
        count,
        examType,
        difficulty,
        topics,
        excludeIds,
      });

      res.json(questions);
    } catch (error) {
      console.error('Error generating filtered quiz:', error);
      res.status(500).json({ message: 'Failed to generate quiz' });
    }
  });

  // Quiz routes
  app.post('/api/quiz/submit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sessionData = insertQuizSessionSchema.parse({
        ...req.body,
        userId,
      });

      const session = await storage.createQuizSession(sessionData);

      // Update user progress
      const progressData = insertUserProgressSchema.parse({
        userId,
        subject: sessionData.subject,
        topic: sessionData.subject, // Use subject as topic for now
        questionsAttempted: sessionData.totalQuestions,
        questionsCorrect: sessionData.correctAnswers,
        energyPoints: sessionData.correctAnswers * 10, // 10 points per correct answer
      });

      await storage.upsertUserProgress(progressData);

      // Send SMS notification for premium users
      try {
        const profile = await storage.getProfile(userId);
        if (profile?.phone) {
          const score = parseFloat(sessionData.scorePercentage || "0");
          await sendQuizResults(profile.phone, profile.fullName || "Student", score, sessionData.subject);
        }
      } catch (smsError) {
        console.error("Failed to send SMS:", smsError);
        // Don't fail the entire request if SMS fails
      }

      res.json(session);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  app.get('/api/quiz/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const history = await storage.getQuizHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      res.status(500).json({ message: "Failed to fetch quiz history" });
    }
  });

  // Progress routes
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  // AI explanation route (OLD - keeping for backward compatibility)
  app.post('/api/explain', isAuthenticated, async (req, res) => {
    try {
      const explanation = await generateExplanation(req.body);
      res.json(explanation);
    } catch (error) {
      console.error("Error generating explanation:", error);
      res.status(500).json({ message: "Failed to generate explanation" });
    }
  });

  // SMS reminder route
  app.post('/api/sms/reminder', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.getProfile(userId);
      
      if (!profile?.phone) {
        return res.status(400).json({ message: "Phone number not found" });
      }

      const result = await sendStudyReminder(profile.phone, profile.fullName || "Student");
      
      // Log the SMS notification
      await storage.createSmsNotification({
        userId,
        phoneNumber: profile.phone,
        message: `Study reminder sent`,
        status: result.success ? 'sent' : 'failed',
      });

      res.json(result);
    } catch (error) {
      console.error("Error sending reminder:", error);
      res.status(500).json({ message: "Failed to send reminder" });
    }
  });

  // Achievement routes
  app.get('/api/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // ALOC API test endpoint (for development)
  app.get('/api/aloc/test', async (req, res) => {
    try {
      const isConnected = await alocService.testConnection();
      
      if (isConnected) {
        // Test fetching a sample question
        const questions = await alocService.fetchQuestions('Mathematics', 1, 'JAMB');
        res.json({
          status: 'connected',
          message: 'ALOC API is working correctly',
          sampleQuestion: questions[0] || null,
          totalQuestions: questions.length
        });
      } else {
        res.json({
          status: 'disconnected',
          message: 'ALOC API is not accessible'
        });
      }
    } catch (error) {
      console.error('ALOC API test failed:', error);
      res.status(500).json({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // ALOC comprehensive seeding endpoint (2015-2025)
  app.post('/api/aloc/seed-comprehensive', async (req, res) => {
    try {
      const { startYear = 2015, endYear = 2025 } = req.body;
      
      console.log(`🚀 Starting comprehensive ALOC seeding (${startYear}-${endYear})...`);
      
      const results = await alocService.seedComprehensiveQuestions(startYear, endYear);
      
      res.json({
        success: true,
        message: `Comprehensive seeding completed for years ${startYear}-${endYear}`,
        results: {
          totalAttempted: results.totalAttempted,
          totalSuccessful: results.totalSuccessful,
          totalErrors: results.totalErrors,
          bySubject: results.bySubject,
          successRate: results.totalAttempted > 0 ? 
            ((results.totalSuccessful / results.totalAttempted) * 100).toFixed(2) + '%' : '0%'
        }
      });
      
    } catch (error) {
      console.error('Comprehensive seeding failed:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Comprehensive seeding failed'
      });
    }
  });

  // ALOC question coverage analysis
  app.get('/api/aloc/coverage/:subject/:examType', async (req, res) => {
    try {
      const { subject, examType } = req.params;
      const { startYear = 2015, endYear = 2025 } = req.query;
      
      const coverage = await alocService.analyzeQuestionCoverage(
        subject,
        examType,
        parseInt(startYear as string),
        parseInt(endYear as string)
      );
      
      const availableYears = Object.keys(coverage).filter(year => coverage[parseInt(year)] > 0);
      const totalYears = Object.keys(coverage).length;
      const coveragePercentage = (availableYears.length / totalYears * 100).toFixed(2);
      
      res.json({
        subject,
        examType,
        yearRange: `${startYear}-${endYear}`,
        coverage,
        availableYears: availableYears.map(year => parseInt(year)),
        coveragePercentage: coveragePercentage + '%',
        totalYearsChecked: totalYears,
        yearsWithQuestions: availableYears.length
      });
      
    } catch (error) {
      console.error('Coverage analysis failed:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Coverage analysis failed'
      });
    }
  });

  // Get recent questions (2020-2025 priority)
  app.get('/api/aloc/recent/:subject/:examType/:count', async (req, res) => {
    try {
      const { subject, examType, count } = req.params;
      
      const questions = await alocService.fetchRecentQuestions(
        subject,
        parseInt(count),
        examType
      );
      
      res.json({
        subject,
        examType,
        requested: parseInt(count),
        received: questions.length,
        questions: questions.map(q => ({
          id: q.id,
          question: q.question.substring(0, 100) + '...',
          year: q.examyear,
          hasOptions: !!q.option,
          hasAnswer: !!q.answer,
          hasSolution: !!q.solution
        }))
      });
      
    } catch (error) {
      console.error('Recent questions fetch failed:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to fetch recent questions'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}