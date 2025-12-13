// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
var connectDb = async () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log("\u2705 Connected to Supabase DB");
  return drizzle(client);
};
var db = await connectDb();

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
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("createdat").defaultNow(),
  updatedAt: timestamp("updatedat").defaultNow()
});
var profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().references(() => users.id),
  phone: text("phone"),
  fullName: text("full_name"),
  selectedSubjects: text("selected_subjects").array(),
  targetExam: text("target_exam"),
  createdAt: timestamp("createdat").defaultNow(),
  updatedAt: timestamp("updatedat").defaultNow()
});
var questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`uuid_generate_v4()`),
  subject: text("subject").notNull(),
  topic: text("topic"),
  questionText: text("question").notNull(),
  options: jsonb("options").notNull(),
  correctAnswer: text("correctanswer").notNull(),
  difficulty: text("difficulty"),
  explanation: text("explanation"),
  createdAt: timestamp("createdat").defaultNow(),
  updatedAt: timestamp("updatedat").defaultNow(),
  examType: text("exam_type").default("JAMB").notNull(),
  year: integer("year").default((/* @__PURE__ */ new Date()).getFullYear())
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
  masteryLevel: decimal("mastery_level", { precision: 3, scale: 2 }).default("0.00"),
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
  userId: text("user_id").notNull().references(() => profiles.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  earnedAt: timestamp("earned_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertQuizSessionSchema = createInsertSchema(quizSessions).omit({
  id: true,
  completedAt: true
});
var insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastPracticed: true
});

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
    const [profile] = await db.insert(profiles).values(profileData).returning();
    return profile;
  }
  async updateProfile(userId, updates) {
    const [profile] = await db.update(profiles).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(profiles.id, userId)).returning();
    return profile;
  }
  async getRandomQuestions(subject, count, examType) {
    if (examType) {
      return await db.select().from(questions).where(and(eq(questions.subject, subject), eq(questions.examType, examType))).orderBy(sql2`RANDOM()`).limit(count);
    } else {
      return await db.select().from(questions).where(eq(questions.subject, subject)).orderBy(sql2`RANDOM()`).limit(count);
    }
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
  async getFilteredRandomQuestions(params) {
    const { subject, count, examType, difficulty, topics, excludeIds } = params;
    const conditions = [eq(questions.subject, subject)];
    if (examType) conditions.push(eq(questions.examType, examType));
    if (difficulty) conditions.push(eq(questions.difficulty, difficulty));
    let baseQuery = db.select().from(questions).where(conditions.length > 1 ? and(...conditions) : conditions[0]).orderBy(sql2`RANDOM()`).limit(Math.max(count * 2, count));
    let rows = await baseQuery;
    if (excludeIds && excludeIds.length > 0) {
      const set = new Set(excludeIds.map((id) => id.toString()));
      rows = rows.filter((q) => !set.has(q.id.toString()));
    }
    if (topics && topics.length > 0) {
      const topicSet = new Set(topics.map((t) => t.toLowerCase()));
      rows = rows.filter((q) => q.topic ? topicSet.has(q.topic.toLowerCase()) : false);
    }
    return rows.slice(0, count);
  }
};
var storage = new DatabaseStorage();

// server/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl) {
  throw new Error("SUPABASE_URL environment variable is required");
}
if (!supabaseAnonKey) {
  throw new Error("SUPABASE_ANON_KEY environment variable is required");
}
if (!supabaseUrl.includes(".supabase.co")) {
  console.warn("\u26A0\uFE0F  SUPABASE_URL should use format: https://your-project.supabase.co");
  console.warn(`   Current URL: ${supabaseUrl}`);
}
if (process.env.NODE_ENV === "development") {
  console.log("\u{1F527} Supabase client configured:");
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`);
}
var supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    // Don't persist sessions on server
    autoRefreshToken: false
    // Don't auto-refresh tokens on server
  },
  global: {
    fetch: (url, options = {}) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15e3);
      return fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          "Connection": "keep-alive"
        }
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    }
  }
});

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

// server/routes/auth.ts
function setupAuthRoutes(app2) {
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }
      console.log(`\u{1F510} Login attempt for: ${email}`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        console.log(`\u274C Login failed: ${error.message}`);
        return res.status(401).json({ error: error.message });
      }
      if (!data.session) {
        console.log(`\u274C No session created for: ${email}`);
        return res.status(401).json({ error: "Authentication failed - no session created" });
      }
      console.log(`\u2705 Login successful for: ${email}`);
      return res.json({
        user: data.user,
        session: data.session,
        access_token: data.session?.access_token
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: "Internal server error during login" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "Email, password, first name, and last name are required" });
      }
      console.log(`\u{1F50F} Register attempt for: ${email}`);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          },
          // For development, you can add email confirmation skip
          emailRedirectTo: process.env.NODE_ENV === "development" ? `http://localhost:5174/auth/callback` : `${process.env.FRONTEND_URL || "https://your-domain.com"}/auth/callback`
        }
      });
      if (error) {
        console.log(`\u274C Registration failed: ${error.message}`);
        return res.status(400).json({ error: error.message });
      }
      console.log(`\u2705 Registration successful for: ${email}`);
      return res.json({
        user: data.user,
        message: data.user?.email_confirmed_at ? "Account created successfully!" : "Please check your email and click the confirmation link to complete your registration."
      });
    } catch (err) {
      console.error("Registration error:", err);
      return res.status(500).json({ error: "Internal server error during registration" });
    }
  });
  app2.get("/api/auth/me", async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token" });
    }
    const { data } = await supabase.auth.getUser(token);
    if (!data?.user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    return res.json({ user: data.user });
  });
  app2.get("/api/auth/callback", async (req, res) => {
    const { token_hash, type, next } = req.query;
    if (type === "email_change" || type === "signup") {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type
      });
      if (error) {
        return res.redirect(`http://localhost:5173/auth/error?message=${encodeURIComponent(error.message)}`);
      }
      return res.redirect(`http://localhost:5173/auth/confirmed`);
    }
    return res.redirect("http://localhost:5173/");
  });
  if (process.env.NODE_ENV === "development") {
    app2.post("/api/auth/create-test-user", async (req, res) => {
      const { email, password, firstName, lastName } = req.body;
      try {
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          user_metadata: {
            first_name: firstName,
            last_name: lastName
          },
          email_confirm: true
          // Auto-confirm email
        });
        if (error) {
          return res.status(400).json({ error: error.message });
        }
        return res.json({
          user: data.user,
          message: "Test user created successfully! You can now login."
        });
      } catch (error) {
        return res.status(500).json({ error: "Failed to create test user" });
      }
    });
  }
  app2.post("/api/auth/logout", (_req, res) => {
    return res.json({ success: true });
  });
}

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

// server/services/alocService.ts
import axios from "axios";
var ALOC_API_BASE = "https://questions.aloc.com.ng/api/v2";
var ALOC_ACCESS_TOKEN = process.env.ALOC_ACCESS_TOKEN || "";
var EXAM_TYPE_MAPPING = {
  "JAMB": "utme",
  "WAEC": "wassce",
  "NECO": "neco"
};
var SUBJECT_MAPPING = {
  "Mathematics": "mathematics",
  "English": "english",
  "Physics": "physics",
  "Chemistry": "chemistry",
  "Biology": "biology"
};
var ALOCService = class {
  baseHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...ALOC_ACCESS_TOKEN && { "AccessToken": ALOC_ACCESS_TOKEN }
  };
  /**
   * Fetch questions from ALOC API
   */
  async fetchQuestions(subject, count = 20, examType = "JAMB", year) {
    try {
      const alocSubject = SUBJECT_MAPPING[subject];
      const alocExamType = EXAM_TYPE_MAPPING[examType];
      if (!alocSubject) {
        throw new Error(`Subject ${subject} not supported by ALOC API`);
      }
      const params = new URLSearchParams({
        subject: alocSubject,
        ...alocExamType && { type: alocExamType },
        ...year && { year: year.toString() }
      });
      let endpoint = "";
      if (count === 1) {
        endpoint = `/q?${params}`;
      } else if (count <= 40) {
        endpoint = `/q/${count}?${params}`;
      } else {
        endpoint = `/m?${params}`;
      }
      const response = await axios.get(`${ALOC_API_BASE}${endpoint}`, {
        headers: this.baseHeaders,
        timeout: 1e4
        // 10 second timeout
      });
      if (response.data.status === false) {
        throw new Error(response.data.message || "ALOC API returned error");
      }
      let questions2 = [];
      if (Array.isArray(response.data.data)) {
        questions2 = response.data.data;
      } else if (response.data.data) {
        questions2 = [response.data.data];
      } else {
        questions2 = [];
      }
      return questions2.slice(0, count);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
          throw new Error("ALOC API is currently unavailable");
        }
        throw new Error(`ALOC API error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }
  /**
   * Convert ALOC question format to our database format
   */
  convertToOurFormat(alocQuestion, subject, examType) {
    return {
      subject,
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
      examType,
      year: parseInt(alocQuestion.examyear) || (/* @__PURE__ */ new Date()).getFullYear()
    };
  }
  /**
   * Extract topic from question text (simple heuristic)
   */
  extractTopic(questionText) {
    const text2 = questionText.toLowerCase();
    if (text2.includes("log") || text2.includes("logarithm")) return "Logarithms";
    if (text2.includes("ratio") || text2.includes("proportion")) return "Ratio and Proportion";
    if (text2.includes("algebra") || text2.includes("equation")) return "Algebra";
    if (text2.includes("geometry") || text2.includes("triangle") || text2.includes("circle")) return "Geometry";
    if (text2.includes("grammar") || text2.includes("tense") || text2.includes("verb")) return "Grammar";
    if (text2.includes("vocabulary") || text2.includes("meaning") || text2.includes("synonym")) return "Vocabulary";
    if (text2.includes("comprehension") || text2.includes("passage")) return "Comprehension";
    if (text2.includes("motion") || text2.includes("speed") || text2.includes("velocity")) return "Motion";
    if (text2.includes("force") || text2.includes("newton")) return "Forces";
    if (text2.includes("energy") || text2.includes("work") || text2.includes("power")) return "Energy";
    if (text2.includes("wave") || text2.includes("sound") || text2.includes("light")) return "Waves";
    if (text2.includes("organic") || text2.includes("carbon") || text2.includes("hydrocarbon")) return "Organic Chemistry";
    if (text2.includes("acid") || text2.includes("base") || text2.includes("salt")) return "Acids and Bases";
    if (text2.includes("periodic") || text2.includes("element")) return "Periodic Table";
    if (text2.includes("cell") || text2.includes("organelle")) return "Cell Biology";
    if (text2.includes("plant") || text2.includes("photosynthesis")) return "Plant Biology";
    if (text2.includes("human") || text2.includes("anatomy")) return "Human Biology";
    if (text2.includes("evolution") || text2.includes("genetics")) return "Evolution and Genetics";
    return "General";
  }
  /**
   * Estimate difficulty based on question complexity (simple heuristic)
   */
  estimateDifficulty(questionText) {
    const text2 = questionText.toLowerCase();
    const complexWords = ["calculate", "determine", "evaluate", "analyze", "derive", "prove"];
    const mediumWords = ["find", "solve", "identify", "explain"];
    if (complexWords.some((word) => text2.includes(word))) return "hard";
    if (mediumWords.some((word) => text2.includes(word))) return "medium";
    return "easy";
  }
  /**
   * Test ALOC API connection
   */
  async testConnection() {
    try {
      const response = await axios.get(`${ALOC_API_BASE}/q?subject=mathematics`, {
        headers: this.baseHeaders,
        timeout: 5e3
      });
      return response.status === 200 && response.data.status !== false;
    } catch (error) {
      console.error("ALOC API connection test failed:", error);
      return false;
    }
  }
  /**
   * Get available subjects from ALOC API
   */
  async getSubjects() {
    return Object.keys(SUBJECT_MAPPING);
  }
  /**
   * Get supported exam types
   */
  getExamTypes() {
    return Object.keys(EXAM_TYPE_MAPPING);
  }
  /**
   * Seed questions for specific year range (2015-2025)
   */
  async seedQuestionsForYearRange(subject, examType, startYear = 2015, endYear = 2025, questionsPerYear = 10) {
    const results = {
      total: 0,
      successful: 0,
      errors: []
    };
    for (let year = startYear; year <= endYear; year++) {
      try {
        console.log(`Seeding ${subject} ${examType} questions for year ${year}...`);
        const questions2 = await this.fetchQuestions(subject, questionsPerYear, examType, year);
        results.total += questions2.length;
        for (const question of questions2) {
          try {
            const convertedQuestion = this.convertToOurFormat(question, subject, examType);
            convertedQuestion.year = year;
            results.successful++;
          } catch (conversionError) {
            results.errors.push(`Failed to convert question for ${subject} ${examType} ${year}: ${conversionError}`);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 3e3));
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
  async seedComprehensiveQuestions(startYear = 2015, endYear = 2025) {
    const subjects = Object.keys(SUBJECT_MAPPING);
    const examTypes = Object.keys(EXAM_TYPE_MAPPING);
    const results = {
      totalAttempted: 0,
      totalSuccessful: 0,
      totalErrors: 0,
      bySubject: {},
      errors: []
    };
    console.log(`
\u{1F3AF} Starting comprehensive question seeding for years ${startYear}-${endYear}`);
    console.log(`\u{1F4DA} Subjects: ${subjects.join(", ")}`);
    console.log(`\u{1F4DD} Exam Types: ${examTypes.join(", ")}`);
    for (const subject of subjects) {
      results.bySubject[subject] = {};
      for (const examType of examTypes) {
        console.log(`
\u{1F4D6} Processing ${subject} - ${examType}...`);
        try {
          const seedResult = await this.seedQuestionsForYearRange(
            subject,
            examType,
            startYear,
            endYear,
            5
            // 5 questions per year per subject per exam type
          );
          results.bySubject[subject][examType] = seedResult;
          results.totalAttempted += seedResult.total;
          results.totalSuccessful += seedResult.successful;
          results.totalErrors += seedResult.errors.length;
          results.errors.push(...seedResult.errors);
          console.log(`\u2705 ${subject} ${examType}: ${seedResult.successful}/${seedResult.total} questions seeded`);
        } catch (error) {
          const errorMsg = `Failed to seed ${subject} ${examType}: ${error}`;
          console.error(`\u274C ${errorMsg}`);
          results.errors.push(errorMsg);
        }
        await new Promise((resolve) => setTimeout(resolve, 5e3));
      }
    }
    console.log(`
\u{1F389} Comprehensive seeding completed!`);
    console.log(`\u{1F4CA} Total: ${results.totalSuccessful}/${results.totalAttempted} questions seeded successfully`);
    console.log(`\u274C Errors: ${results.totalErrors}`);
    return results;
  }
  /**
   * Get questions prioritizing recent years (2020-2025)
   */
  async fetchRecentQuestions(subject, count = 20, examType = "JAMB") {
    try {
      console.log(`Fetching any available ${subject} ${examType} questions...`);
      const questions2 = await this.fetchQuestions(subject, count, examType);
      if (questions2.length > 0) {
        console.log(`Found ${questions2.length} ${subject} ${examType} questions`);
        return questions2.slice(0, count);
      }
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
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
  async getQuestionsByYear(subject, examType, year) {
    return await this.fetchQuestions(subject, 40, examType, year);
  }
  /**
   * Analyze available questions by year
   */
  async analyzeQuestionCoverage(subject, examType, startYear = 2015, endYear = 2025) {
    const coverage = {};
    for (let year = startYear; year <= endYear; year++) {
      try {
        const questions2 = await this.fetchQuestions(subject, 1, examType, year);
        coverage[year] = questions2.length > 0 ? 1 : 0;
      } catch (error) {
        coverage[year] = 0;
      }
    }
    return coverage;
  }
};
var alocService = new ALOCService();

// server/services/questionService.ts
var QuestionService = class {
  async getQuestionsForQuiz(subject, count = 20, examType = "JAMB") {
    try {
      let questions2 = [];
      try {
        console.log(`Fetching ${count} recent ${subject} questions (${examType}) from ALOC API...`);
        const alocQuestions = await alocService.fetchRecentQuestions(subject, count, examType);
        if (alocQuestions.length > 0) {
          for (const alocQ of alocQuestions) {
            const convertedQuestion = alocService.convertToOurFormat(alocQ, subject, examType);
            try {
              const savedQuestion = await storage.createQuestion(convertedQuestion);
              questions2.push(savedQuestion);
            } catch (saveError) {
              console.log("Skipping duplicate question from ALOC API");
            }
          }
          console.log(`Successfully fetched ${questions2.length} questions from ALOC API`);
          return questions2.slice(0, count);
        }
      } catch (alocError) {
        console.log("ALOC API unavailable, falling back to local questions:", alocError);
      }
      questions2 = await storage.getRandomQuestions(subject, count, examType);
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
  async getFilteredQuestions(params) {
    const { subject, count, examType, difficulty, topics, excludeIds } = params;
    let base = await storage.getFilteredRandomQuestions({
      subject,
      count,
      examType,
      difficulty,
      topics,
      excludeIds
    });
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
  async generateAdditionalQuestions(baseQuestion, count) {
    const generated = [];
    for (let i = 0; i < Math.min(count, 5); i++) {
      try {
        const variation = await generateQuestionVariation(baseQuestion);
        const newQuestion = {
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
    if (existingQuestions.length >= 100) {
      console.log(`Questions already seeded (${existingQuestions.length} total)`);
      return;
    }
    console.log("\u{1F680} Starting comprehensive question seeding from ALOC API (2015-2025)...");
    try {
      console.log("\u{1F50D} Testing ALOC API connection...");
      const isConnected = await alocService.testConnection();
      if (isConnected) {
        console.log("\u2705 ALOC API is accessible! Fetching sample questions...");
        const subjects = ["Mathematics", "English", "Physics", "Chemistry", "Biology"];
        const examTypes = ["JAMB", "WAEC", "NECO"];
        let totalFetched = 0;
        for (const subject of subjects) {
          for (const examType of examTypes) {
            try {
              console.log(`\u{1F4D6} Fetching ${subject} ${examType} questions...`);
              const questions2 = await alocService.fetchRecentQuestions(subject, 3, examType);
              for (const alocQ of questions2) {
                try {
                  const convertedQuestion = alocService.convertToOurFormat(alocQ, subject, examType);
                  await storage.createQuestion(convertedQuestion);
                  totalFetched++;
                } catch (saveError) {
                  console.log("Skipping duplicate question");
                }
              }
              await new Promise((resolve) => setTimeout(resolve, 2e3));
            } catch (error) {
              console.log(`\u26A0\uFE0F Could not fetch ${subject} ${examType}: ${error}`);
            }
          }
        }
        if (totalFetched > 0) {
          console.log(`\u{1F389} Successfully fetched ${totalFetched} questions from ALOC API`);
          return;
        }
      }
    } catch (alocError) {
      console.log("\u26A0\uFE0F  ALOC API not available, falling back to local seeding:", alocError);
    }
    console.log("\u{1F4DD} Seeding fallback local questions...");
    const initialQuestions = [
      // Mathematics
      {
        subject: "Mathematics",
        topic: "Logarithms",
        questionText: "If log\u2081\u20802 = 0.3010, find log\u2081\u20808",
        options: {
          A: "0.9030",
          B: "0.9020",
          C: "0.9010",
          D: "0.9000"
        },
        correctAnswer: "A",
        difficulty: "hard",
        explanation: "log\u2081\u20808 = log\u2081\u2080(2\xB3) = 3log\u2081\u20802 = 3(0.3010) = 0.9030",
        examType: "JAMB",
        year: 2024
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
        year: 2024
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
        year: 2024
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
        year: 2024
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
        year: 2024
      },
      // Chemistry
      {
        subject: "Chemistry",
        topic: "Organic Chemistry",
        questionText: "What is the molecular formula of glucose?",
        options: {
          A: "C\u2086H\u2081\u2082O\u2086",
          B: "C\u2086H\u2081\u2080O\u2085",
          C: "C\u2085H\u2081\u2082O\u2086",
          D: "C\u2086H\u2081\u2082O\u2085"
        },
        correctAnswer: "A",
        difficulty: "easy",
        explanation: "Glucose is a simple sugar with the molecular formula C\u2086H\u2081\u2082O\u2086, containing 6 carbon atoms, 12 hydrogen atoms, and 6 oxygen atoms",
        examType: "JAMB",
        year: 2024
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
        year: 2024
      }
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
};
var questionService = new QuestionService();

// server/services/smsService.ts
import axios2 from "axios";
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
    const response = await axios2.post(`${TERMII_BASE_URL}/sms/send`, payload, {
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
  setupAuthRoutes(app2);
  setTimeout(async () => {
    try {
      await questionService.seedInitialQuestions();
    } catch (error) {
      console.error("Failed to seed questions:", error);
    }
  }, 1e3);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
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
  app2.put("/api/profile", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
      const profile = await storage.updateProfile(userId, req.body);
      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.get("/api/questions/random/:subject/:count", async (req, res) => {
    try {
      const { subject, count } = req.params;
      const { examType } = req.query;
      const questions2 = await questionService.getQuestionsForQuiz(
        subject,
        parseInt(count),
        examType || "JAMB"
      );
      res.json(questions2);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });
  app2.get("/api/quiz/generate", async (req, res) => {
    try {
      const subject = req.query.subject || "";
      const count = parseInt(req.query.count || "20");
      const examType = req.query.examType || "JAMB";
      const difficulty = req.query.difficulty || void 0;
      const topicsParam = req.query.topics || "";
      const excludeParam = req.query.excludeIds || "";
      if (!subject) {
        return res.status(400).json({ message: "subject is required" });
      }
      const topics = topicsParam ? topicsParam.split(",").map((t) => t.trim()).filter(Boolean) : void 0;
      const excludeIds = excludeParam ? excludeParam.split(",").map((t) => t.trim()).filter(Boolean) : void 0;
      const questions2 = await questionService.getFilteredQuestions({
        subject,
        count,
        examType,
        difficulty,
        topics,
        excludeIds
      });
      res.json(questions2);
    } catch (error) {
      console.error("Error generating filtered quiz:", error);
      res.status(500).json({ message: "Failed to generate quiz" });
    }
  });
  app2.post("/api/quiz/submit", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
      const history = await storage.getQuizHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      res.status(500).json({ message: "Failed to fetch quiz history" });
    }
  });
  app2.get("/api/progress", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      const achievements2 = await storage.getUserAchievements(userId);
      res.json(achievements2);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });
  app2.get("/api/aloc/test", async (req, res) => {
    try {
      const isConnected = await alocService.testConnection();
      if (isConnected) {
        const questions2 = await alocService.fetchQuestions("Mathematics", 1, "JAMB");
        res.json({
          status: "connected",
          message: "ALOC API is working correctly",
          sampleQuestion: questions2[0] || null,
          totalQuestions: questions2.length
        });
      } else {
        res.json({
          status: "disconnected",
          message: "ALOC API is not accessible"
        });
      }
    } catch (error) {
      console.error("ALOC API test failed:", error);
      res.status(500).json({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/aloc/seed-comprehensive", async (req, res) => {
    try {
      const { startYear = 2015, endYear = 2025 } = req.body;
      console.log(`\u{1F680} Starting comprehensive ALOC seeding (${startYear}-${endYear})...`);
      const results = await alocService.seedComprehensiveQuestions(startYear, endYear);
      res.json({
        success: true,
        message: `Comprehensive seeding completed for years ${startYear}-${endYear}`,
        results: {
          totalAttempted: results.totalAttempted,
          totalSuccessful: results.totalSuccessful,
          totalErrors: results.totalErrors,
          bySubject: results.bySubject,
          successRate: results.totalAttempted > 0 ? (results.totalSuccessful / results.totalAttempted * 100).toFixed(2) + "%" : "0%"
        }
      });
    } catch (error) {
      console.error("Comprehensive seeding failed:", error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Comprehensive seeding failed"
      });
    }
  });
  app2.get("/api/aloc/coverage/:subject/:examType", async (req, res) => {
    try {
      const { subject, examType } = req.params;
      const { startYear = 2015, endYear = 2025 } = req.query;
      const coverage = await alocService.analyzeQuestionCoverage(
        subject,
        examType,
        parseInt(startYear),
        parseInt(endYear)
      );
      const availableYears = Object.keys(coverage).filter((year) => coverage[parseInt(year)] > 0);
      const totalYears = Object.keys(coverage).length;
      const coveragePercentage = (availableYears.length / totalYears * 100).toFixed(2);
      res.json({
        subject,
        examType,
        yearRange: `${startYear}-${endYear}`,
        coverage,
        availableYears: availableYears.map((year) => parseInt(year)),
        coveragePercentage: coveragePercentage + "%",
        totalYearsChecked: totalYears,
        yearsWithQuestions: availableYears.length
      });
    } catch (error) {
      console.error("Coverage analysis failed:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Coverage analysis failed"
      });
    }
  });
  app2.get("/api/aloc/recent/:subject/:examType/:count", async (req, res) => {
    try {
      const { subject, examType, count } = req.params;
      const questions2 = await alocService.fetchRecentQuestions(
        subject,
        parseInt(count),
        examType
      );
      res.json({
        subject,
        examType,
        requested: parseInt(count),
        received: questions2.length,
        questions: questions2.map((q) => ({
          id: q.id,
          question: q.question.substring(0, 100) + "...",
          year: q.examyear,
          hasOptions: !!q.option,
          hasAnswer: !!q.answer,
          hasSolution: !!q.solution
        }))
      });
    } catch (error) {
      console.error("Recent questions fetch failed:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to fetch recent questions"
      });
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
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
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

// server/routes/quiz.ts
function setupQuizRoutes(app2) {
  app2.post("/api/quiz/submit", async (req, res) => {
    try {
      const {
        subject,
        examType,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        timeSpent,
        questionsAnswered
      } = req.body;
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : void 0;
      let userId = null;
      if (token) {
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (!userError && user) {
          userId = user.id;
        }
      }
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          userId = session.user.id;
        }
      }
      if (!userId) {
        console.error("Authentication failed: no token and no supabase session");
        return res.status(401).json({ error: "Not authenticated" });
      }
      console.log("Submitting quiz for user:", userId);
      console.log("Quiz data:", {
        subject,
        examType,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        timeSpent,
        questionsCount: questionsAnswered?.length || 0
      });
      const { data: quizSession, error: insertError } = await supabase.from("quiz_sessions").insert([
        {
          user_id: userId,
          subject,
          exam_type: examType,
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          wrong_answers: wrongAnswers,
          score_percentage: correctAnswers / totalQuestions * 100,
          time_spent: timeSpent,
          questions_answered: questionsAnswered
        }
      ]).select("id").single();
      if (insertError) {
        console.error("Error inserting quiz session:", insertError);
        return res.status(500).json({ error: insertError.message });
      }
      if (!quizSession || !quizSession.id) {
        console.error("No quiz session ID returned after insert");
        return res.status(500).json({ error: "Failed to create quiz session" });
      }
      console.log("Quiz session created with ID:", quizSession.id);
      for (const qa of questionsAnswered) {
        const { error: progressError } = await supabase.rpc("update_user_progress", {
          p_user_id: userId,
          p_subject: subject,
          p_question_id: qa.questionId,
          p_is_correct: qa.isCorrect,
          p_topic: null
          // You might want to include topic if available
        });
        if (progressError) {
          console.error("Error updating user progress:", progressError);
        }
      }
      console.log("Sending response with session ID:", quizSession.id);
      const responseData = {
        success: true,
        sessionId: quizSession.id,
        id: quizSession.id,
        // Add this line to match frontend expectations
        score: correctAnswers / totalQuestions * 100
      };
      console.log("Full response data:", responseData);
      return res.json(responseData);
    } catch (error) {
      console.error("Error in quiz submission:", error);
      return res.status(500).json({
        error: "Internal server error during quiz submission",
        details: error?.message || "Unknown error"
      });
    }
  });
  app2.get("/api/quiz/history", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : void 0;
      let userId = null;
      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user?.id) userId = user.id;
      }
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) userId = session.user.id;
      }
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const { data, error } = await supabase.from("quiz_sessions").select("*").eq("user_id", userId).order("completed_at", { ascending: false });
      if (error) {
        throw error;
      }
      const formattedData = data.map((session) => ({
        id: session.id,
        subject: session.subject,
        examType: session.exam_type,
        scorePercentage: session.score_percentage,
        correctAnswers: session.correct_answers,
        wrongAnswers: session.wrong_answers,
        timeSpent: session.time_spent,
        totalQuestions: session.total_questions,
        questionsAnswered: session.questions_answered || [],
        completedAt: session.completed_at
      }));
      return res.json(formattedData);
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      return res.status(500).json({ error: "Failed to fetch quiz history" });
    }
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
  setupQuizRoutes(app);
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
