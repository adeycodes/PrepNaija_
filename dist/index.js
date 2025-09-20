// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`uuid_generate_v4()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().references(() => users.id),
  phone: text("phone"),
  fullName: text("full_name"),
  selectedSubjects: text("selected_subjects").array(),
  // make sure column type is text[]
  targetExam: text("target_exam").default("JAMB"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`uuid_generate_v4()`),
  subject: text("subject").notNull(),
  examType: text("exam_type").notNull(),
  questionText: text("question_text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  optionD: text("option_d").notNull(),
  correctAnswer: varchar("correct_answer", { length: 1 }).notNull(),
  explanation: text("explanation"),
  topic: text("topic"),
  difficultyLevel: integer("difficulty_level").default(1),
  year: integer("year"),
  createdAt: timestamp("created_at").defaultNow()
});
var quizSessions = pgTable("quiz_sessions", {
  id: varchar("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: varchar("user_id").references(() => profiles.id),
  subject: text("subject").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  wrongAnswers: integer("wrong_answers").notNull(),
  scorePercentage: decimal("score_percentage", { precision: 5, scale: 2 }),
  timeSpent: integer("time_spent"),
  questionsAnswered: jsonb("questions_answered"),
  completedAt: timestamp("completed_at").defaultNow()
});
var userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: varchar("user_id").references(() => profiles.id),
  subject: text("subject").notNull(),
  topic: text("topic"),
  questionsAttempted: integer("questions_attempted").default(0),
  questionsCorrect: integer("questions_correct").default(0),
  masteryLevel: decimal("mastery_level", { precision: 3, scale: 2 }).default(0),
  lastPracticed: timestamp("last_practiced").defaultNow(),
  energyPoints: integer("energy_points").default(0)
});
var smsNotifications = pgTable("sms_notifications", {
  id: varchar("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: varchar("user_id").references(() => profiles.id),
  phoneNumber: text("phone_number").notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending"),
  sentAt: timestamp("sent_at").defaultNow()
});
var achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: varchar("user_id").references(() => profiles.id),
  achievementType: text("achievement_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  earnedAt: timestamp("earned_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true
});
var insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true
});
var insertQuizSessionSchema = createInsertSchema(quizSessions).omit({
  id: true,
  completedAt: true
});
var insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastPracticed: true
});

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { lookup } from "dns";
var lookupAsync = (hostname) => new Promise((resolve, reject) => {
  lookup(hostname, { family: 4 }, (err, address) => {
    if (err) reject(err);
    else resolve(address);
  });
});
var connectDb = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const url = new URL(process.env.DATABASE_URL);
  const hostname = url.hostname;
  const ip = await lookupAsync(hostname);
  console.log(`\u2705 Resolved ${hostname} to IPv4: ${ip}`);
  const client = new Client({
    host: ip,
    port: parseInt(url.port || "5432"),
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log("\u2705 Connected to Supabase DB via IPv4");
  return drizzle(client);
};
var db = await connectDb();

// server/storage.ts
import { eq, and, desc, sql as sql2 } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userId, userData) {
    const [user] = await db.insert(users).values({ ...userData, id: userId }).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async getProfile(userId) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId));
    return profile;
  }
  async createProfile(profileData) {
    const [profile] = await db.insert(profiles).values({
      id: profileData.id,
      phone: profileData.phone,
      fullName: profileData.fullName,
      selectedSubjects: profileData.selectedSubjects,
      targetExam: profileData.targetExam
    }).returning();
    return profile;
  }
  async updateProfile(userId, updates) {
    const [profile] = await db.update(profiles).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(profiles.id, userId)).returning();
    return profile;
  }
  async getRandomQuestions(subject, count) {
    return await db.select().from(questions).where(eq(questions.subject, subject)).orderBy(sql2`RANDOM()`).limit(count);
  }
  async getAllQuestions() {
    return await db.select().from(questions);
  }
  async createQuestion(questionData) {
    const [question] = await db.insert(questions).values(questionData).returning();
    return question;
  }
  async createQuizSession(sessionData) {
    const [session] = await db.insert(quizSessions).values(sessionData).returning();
    return session;
  }
  async getQuizHistory(userId) {
    return await db.select().from(quizSessions).where(eq(quizSessions.userId, userId)).orderBy(desc(quizSessions.completedAt));
  }
  async getUserProgress(userId) {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }
  async upsertUserProgress(progressData) {
    const existing = await db.select().from(userProgress).where(
      and(
        eq(userProgress.userId, progressData.userId),
        eq(userProgress.subject, progressData.subject),
        eq(userProgress.topic, progressData.topic || "")
      )
    );
    if (existing.length > 0) {
      const [updated] = await db.update(userProgress).set({ ...progressData, lastPracticed: /* @__PURE__ */ new Date() }).where(eq(userProgress.id, existing[0].id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(userProgress).values(progressData).returning();
      return created;
    }
  }
  async createSmsNotification(notificationData) {
    const [notification] = await db.insert(smsNotifications).values(notificationData).returning();
    return notification;
  }
  async getUserAchievements(userId) {
    return await db.select().from(achievements).where(eq(achievements.userId, userId)).orderBy(desc(achievements.earnedAt));
  }
  async createAchievement(achievementData) {
    const [achievement] = await db.insert(achievements).values(achievementData).returning();
    return achievement;
  }
};
var storage = new DatabaseStorage();

// server/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
var supabase = createClient(supabaseUrl, supabaseAnonKey);

// server/authMiddleware.ts
var isAuthenticated = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = data.user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
var setupAuth = async (app2) => {
  console.log("Supabase auth setup complete");
};

// server/services/openaiService.ts
import OpenAI from "openai";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "your-api-key"
});
async function generateExplanation(request) {
  try {
    const prompt = `
      You are a Nigerian exam expert helping students understand ${request.subject} questions.
      
      Question: ${request.questionText}
      Options:
      A) ${request.options.A}
      B) ${request.options.B}
      C) ${request.options.C}
      D) ${request.options.D}
      
      Correct Answer: ${request.correctAnswer}
      Student's Answer: ${request.userAnswer}
      
      Provide a detailed explanation that:
      1. Explains why the correct answer is right
      2. Explains why the student's answer was wrong (if different)
      3. Breaks down the concept in simple terms
      4. Uses Nigerian context and examples where relevant
      5. Provides study tips for similar questions
      
      Respond with JSON in this exact format:
      {
        "explanation": "detailed step-by-step explanation",
        "keyPoints": ["point 1", "point 2", "point 3"],
        "studyTips": ["tip 1", "tip 2", "tip 3"]
      }
    `;
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 800
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      explanation: result.explanation || "Explanation not available",
      keyPoints: result.keyPoints || [],
      studyTips: result.studyTips || []
    };
  } catch (error) {
    console.error("Error generating explanation:", error);
    throw new Error("Failed to generate explanation. Please try again.");
  }
}
async function generateQuestionVariation(baseQuestion) {
  try {
    const prompt = `
      You are a Nigerian examination expert. Based on this verified ${baseQuestion.examType} ${baseQuestion.subject} question:
      
      Question: "${baseQuestion.questionText}"
      Topic: ${baseQuestion.topic}
      Difficulty: ${baseQuestion.difficultyLevel}/5
      
      Generate 1 similar question that:
      1. Tests the same concept but with different scenarios
      2. Uses Nigerian context (names, places, currency when relevant)
      3. Follows official ${baseQuestion.examType} format exactly
      4. Includes 4 options (A, B, C, D) with only one correct answer
      5. Provides detailed step-by-step explanation
      6. Matches the same difficulty level
      7. Uses appropriate Nigerian English
      
      Respond with JSON in this exact format:
      {
        "questionText": "the question text",
        "optionA": "option A text",
        "optionB": "option B text", 
        "optionC": "option C text",
        "optionD": "option D text",
        "correctAnswer": "A",
        "explanation": "detailed explanation"
      }
    `;
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1e3
    });
    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Error generating question variation:", error);
    throw new Error("Failed to generate question variation");
  }
}

// server/services/questionService.ts
var QuestionService = class {
  async getQuestionsForQuiz(subject, count = 20) {
    try {
      const questions2 = await storage.getRandomQuestions(subject, count);
      if (questions2.length < count && questions2.length > 0) {
        const needed = count - questions2.length;
        const generated = await this.generateAdditionalQuestions(questions2[0], needed);
        questions2.push(...generated);
      }
      return questions2.slice(0, count);
    } catch (error) {
      console.error("Error getting questions for quiz:", error);
      throw new Error("Failed to load quiz questions");
    }
  }
  async generateAdditionalQuestions(baseQuestion, count) {
    const generated = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      try {
        const variation = await generateQuestionVariation(baseQuestion);
        const newQuestion = {
          subject: baseQuestion.subject,
          examType: baseQuestion.examType,
          questionText: variation.questionText,
          optionA: variation.optionA,
          optionB: variation.optionB,
          optionC: variation.optionC,
          optionD: variation.optionD,
          correctAnswer: variation.correctAnswer,
          explanation: variation.explanation,
          topic: baseQuestion.topic,
          difficultyLevel: baseQuestion.difficultyLevel,
          year: (/* @__PURE__ */ new Date()).getFullYear()
        };
        const created = await storage.createQuestion(newQuestion);
        generated.push(created);
      } catch (error) {
        console.error(`Error generating question ${i + 1}:`, error);
      }
    }
    return generated;
  }
  async seedInitialQuestions() {
    const existingQuestions = await storage.getAllQuestions();
    if (existingQuestions.length > 0) {
      console.log("Questions already seeded");
      return;
    }
    console.log("Seeding initial questions...");
    const initialQuestions = [
      // Mathematics
      {
        subject: "Mathematics",
        examType: "JAMB",
        questionText: "If log\u2081\u20802 = 0.3010, find log\u2081\u20808",
        optionA: "0.9030",
        optionB: "0.9020",
        optionC: "0.9010",
        optionD: "0.9000",
        correctAnswer: "A",
        explanation: "log\u2081\u20808 = log\u2081\u2080(2\xB3) = 3log\u2081\u20802 = 3(0.3010) = 0.9030",
        topic: "Logarithms",
        difficultyLevel: 3,
        year: 2024
      },
      {
        subject: "Mathematics",
        examType: "JAMB",
        questionText: "The ages of Kemi and Tolu are in the ratio 2:3. If Kemi is 12 years old, how old is Tolu?",
        optionA: "18 years",
        optionB: "15 years",
        optionC: "20 years",
        optionD: "16 years",
        correctAnswer: "A",
        explanation: "If Kemi:Tolu = 2:3 and Kemi = 12, then 2x = 12, so x = 6. Therefore Tolu = 3x = 3(6) = 18 years",
        topic: "Ratio and Proportion",
        difficultyLevel: 2,
        year: 2024
      },
      // English
      {
        subject: "English",
        examType: "WAEC",
        questionText: "Choose the option that best completes the gap: The principal _____ the students for their poor performance.",
        optionA: "berated",
        optionB: "bereaved",
        optionC: "betrayed",
        optionD: "beloved",
        correctAnswer: "A",
        explanation: "Berated means to scold or criticize angrily, which fits the context of poor performance",
        topic: "Vocabulary",
        difficultyLevel: 2,
        year: 2024
      },
      {
        subject: "English",
        examType: "WAEC",
        questionText: "Which of the following sentences is correct?",
        optionA: "Neither John nor his friends were present",
        optionB: "Neither John nor his friends was present",
        optionC: "Either John or his friends were present",
        optionD: "Neither John or his friends were present",
        correctAnswer: "B",
        explanation: "With 'neither...nor' construction, the verb agrees with the subject closest to it. Since 'John' (singular) is closest, we use 'was'",
        topic: "Grammar",
        difficultyLevel: 3,
        year: 2024
      },
      // Physics
      {
        subject: "Physics",
        examType: "JAMB",
        questionText: "A car travels 60km in the first hour and 40km in the second hour. Calculate the average speed.",
        optionA: "50 km/h",
        optionB: "100 km/h",
        optionC: "60 km/h",
        optionD: "40 km/h",
        correctAnswer: "A",
        explanation: "Average speed = Total distance / Total time = (60 + 40) / 2 = 100/2 = 50 km/h",
        topic: "Motion",
        difficultyLevel: 2,
        year: 2024
      },
      // Chemistry
      {
        subject: "Chemistry",
        examType: "JAMB",
        questionText: "What is the molecular formula of glucose?",
        optionA: "C\u2086H\u2081\u2082O\u2086",
        optionB: "C\u2086H\u2081\u2080O\u2085",
        optionC: "C\u2085H\u2081\u2082O\u2086",
        optionD: "C\u2086H\u2081\u2082O\u2085",
        correctAnswer: "A",
        explanation: "Glucose is a simple sugar with the molecular formula C\u2086H\u2081\u2082O\u2086, containing 6 carbon atoms, 12 hydrogen atoms, and 6 oxygen atoms",
        topic: "Organic Chemistry",
        difficultyLevel: 1,
        year: 2024
      },
      // Biology
      {
        subject: "Biology",
        examType: "JAMB",
        questionText: "Which organelle is responsible for photosynthesis in plant cells?",
        optionA: "Chloroplast",
        optionB: "Mitochondria",
        optionC: "Nucleus",
        optionD: "Ribosome",
        correctAnswer: "A",
        explanation: "Chloroplasts contain chlorophyll and are the sites where photosynthesis occurs in plant cells, converting light energy into chemical energy",
        topic: "Cell Biology",
        difficultyLevel: 1,
        year: 2024
      }
    ];
    for (const question of initialQuestions) {
      try {
        await storage.createQuestion(question);
      } catch (error) {
        console.error("Error seeding question:", error);
      }
    }
    console.log(`Seeded ${initialQuestions.length} initial questions`);
  }
};
var questionService = new QuestionService();

// server/services/smsService.ts
import axios from "axios";
var TERMII_API_KEY = process.env.TERMII_API_KEY || process.env.TERMII_KEY || "your-termii-api-key";
var TERMII_BASE_URL = "https://api.ng.termii.com/api";
async function sendStudyReminder(phone, name) {
  const message = `Hi ${name}! \u{1F4DA} Ready for your daily JAMB practice? Complete 10 questions today and earn energy points! - PrepNaija`;
  return await sendSMS({ to: phone, message });
}
async function sendQuizResults(phone, name, score, subject) {
  const message = `\u{1F389} Great job ${name}! You scored ${score}% in ${subject}. Keep practicing to improve further! - PrepNaija`;
  return await sendSMS({ to: phone, message });
}
async function sendSMS(request) {
  try {
    let phoneNumber = request.to.replace(/\D/g, "");
    if (phoneNumber.startsWith("0")) {
      phoneNumber = "234" + phoneNumber.slice(1);
    } else if (!phoneNumber.startsWith("234")) {
      phoneNumber = "234" + phoneNumber;
    }
    const payload = {
      to: phoneNumber,
      from: "PrepNaija",
      sms: request.message,
      type: "plain",
      channel: "generic",
      api_key: TERMII_API_KEY
    };
    const response = await axios.post(`${TERMII_BASE_URL}/sms/send`, payload, {
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 1e4
      // 10 seconds timeout
    });
    if (response.data && response.data.message_id) {
      return {
        success: true,
        messageId: response.data.message_id
      };
    } else {
      return {
        success: false,
        error: response.data?.message || "Failed to send SMS"
      };
    }
  } catch (error) {
    console.error("Error sending SMS:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || "SMS service unavailable"
    };
  }
}

// server/routes.ts
async function registerRoutes(app2) {
  await setupAuth(app2);
  setTimeout(async () => {
    try {
      await questionService.seedInitialQuestions();
    } catch (error) {
      console.error("Failed to seed questions:", error);
    }
  }, 1e3);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const profile = await storage.getProfile(userId);
      res.json({
        ...user,
        profile
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/profile/setup", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
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
  app2.put("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.updateProfile(userId, req.body);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.get("/api/questions/random/:subject/:count", isAuthenticated, async (req, res) => {
    try {
      const { subject, count } = req.params;
      const questions2 = await questionService.getQuestionsForQuiz(subject, parseInt(count));
      res.json(questions2);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });
  app2.post("/api/quiz/submit", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertQuizSessionSchema.parse({
        ...req.body,
        userId
      });
      const session = await storage.createQuizSession(sessionData);
      const progressData = insertUserProgressSchema.parse({
        userId,
        subject: sessionData.subject,
        topic: sessionData.subject,
        // Use subject as topic for now
        questionsAttempted: sessionData.totalQuestions,
        questionsCorrect: sessionData.correctAnswers,
        energyPoints: sessionData.correctAnswers * 10
        // 10 points per correct answer
      });
      await storage.upsertUserProgress(progressData);
      try {
        const profile = await storage.getProfile(userId);
        if (profile?.phone) {
          const score = parseFloat(sessionData.scorePercentage || "0");
          await sendQuizResults(profile.phone, profile.fullName || "Student", score, sessionData.subject);
        }
      } catch (smsError) {
        console.error("Failed to send SMS:", smsError);
      }
      res.json(session);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });
  app2.get("/api/quiz/history", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = await storage.getQuizHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      res.status(500).json({ message: "Failed to fetch quiz history" });
    }
  });
  app2.get("/api/progress", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });
  app2.post("/api/explain", isAuthenticated, async (req, res) => {
    try {
      const explanation = await generateExplanation(req.body);
      res.json(explanation);
    } catch (error) {
      console.error("Error generating explanation:", error);
      res.status(500).json({ message: "Failed to generate explanation" });
    }
  });
  app2.post("/api/sms/reminder", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfile(userId);
      if (!profile?.phone) {
        return res.status(400).json({ message: "Phone number not found" });
      }
      const result = await sendStudyReminder(profile.phone, profile.fullName || "Student");
      await storage.createSmsNotification({
        userId,
        phoneNumber: profile.phone,
        message: `Study reminder sent`,
        status: result.success ? "sent" : "failed"
      });
      res.json(result);
    } catch (error) {
      console.error("Error sending reminder:", error);
      res.status(500).json({ message: "Failed to send reminder" });
    }
  });
  app2.get("/api/achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const achievements2 = await storage.getUserAchievements(userId);
      res.json(achievements2);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
