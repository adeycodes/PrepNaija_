import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Sessions (only if you need Replit-style auth sessions)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`uuid_generate_v4()`),
  email: varchar("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("createdat").defaultNow(),
  updatedAt: timestamp("updatedat").defaultNow(),
});

// Profiles table
export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().references(() => users.id),
  phone: text("phone"),
  fullName: text("full_name"),
  selectedSubjects: text("selected_subjects").array(),
  targetExam: text("target_exam"),
  createdAt: timestamp("createdat").defaultNow(),
  updatedAt: timestamp("updatedat").defaultNow(),
});

// Questions
export const questions = pgTable("questions", {
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
  examType: text("exam_type").default('JAMB').notNull(),
  year: integer("year").default(new Date().getFullYear()),
});

// Quiz sessions
export const quizSessions = pgTable("quiz_sessions", {
  id: varchar("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: varchar("user_id").references(() => profiles.id),
  subject: text("subject").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  wrongAnswers: integer("wrong_answers").notNull(),
  scorePercentage: decimal("score_percentage", { precision: 5, scale: 2 }),
  timeSpent: integer("time_spent"),
  questionsAnswered: jsonb("questions_answered"),
  completedAt: timestamp("completed_at").defaultNow(),
});

// User progress
export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: varchar("user_id").references(() => profiles.id),
  subject: text("subject").notNull(),
  topic: text("topic"),
  questionsAttempted: integer("questions_attempted").default(0),
  questionsCorrect: integer("questions_correct").default(0),
  masteryLevel: decimal("mastery_level", { precision: 3, scale: 2 }).default("0.00"),
  lastPracticed: timestamp("last_practiced").defaultNow(),
  energyPoints: integer("energy_points").default(0),
});

// SMS notifications
export const smsNotifications = pgTable("sms_notifications", {
  id: varchar("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: varchar("user_id").references(() => profiles.id),
  phoneNumber: text("phone_number").notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending"),
  sentAt: timestamp("sent_at").defaultNow(),
});

// Achievements
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`uuid_generate_v4()`),
  userId: text("user_id").notNull().references(() => profiles.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuizSessionSchema = createInsertSchema(quizSessions).omit({
  id: true,
  completedAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastPracticed: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type QuizSession = typeof quizSessions.$inferSelect;
export type InsertQuizSession = z.infer<typeof insertQuizSessionSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type SmsNotification = typeof smsNotifications.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
