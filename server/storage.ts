import { db } from "./db";
import {
  users,
  profiles,
  questions,
  quizSessions,
  userProgress,
  smsNotifications,
  achievements,
  type User,
  type UpsertUser,
  type Profile,
  type InsertProfile,
  type Question,
  type InsertQuestion,
  type QuizSession,
  type InsertQuizSession,
  type UserProgress,
  type InsertUserProgress,
  type SmsNotification,
  type Achievement,
} from "@shared/schema";

import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(userId: string, user: UpsertUser): Promise<User>;
  getProfile(userId: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile>;
  getRandomQuestions(subject: string, count: number, examType?: string): Promise<Question[]>;
  getAllQuestions(): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  createQuizSession(session: InsertQuizSession): Promise<QuizSession>;
  getQuizHistory(userId: string): Promise<QuizSession[]>;
  getUserProgress(userId: string): Promise<UserProgress[]>;
  upsertUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  createSmsNotification(notification: Omit<SmsNotification, "id" | "sentAt">): Promise<SmsNotification>;
  getUserAchievements(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: Omit<Achievement, "id" | "earnedAt">): Promise<Achievement>;
  // New filtered fetch
  getFilteredRandomQuestions(params: {
    subject: string;
    count: number;
    examType?: string;
    difficulty?: string;
    topics?: string[];
    excludeIds?: string[];
  }): Promise<Question[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userId: string, userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ ...userData, id: userId })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId));
    return profile;
  }

  async createProfile(profileData: InsertProfile): Promise<Profile> {
    const [profile] = await db
      .insert(profiles)
      .values(profileData)
      .returning();
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<InsertProfile>): Promise<Profile> {
    const [profile] = await db
      .update(profiles)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profiles.id, userId))
      .returning();
    return profile;
  }

  async getRandomQuestions(subject: string, count: number, examType?: string): Promise<Question[]> {
    if (examType) {
      return await db
        .select()
        .from(questions)
        .where(and(eq(questions.subject, subject), eq(questions.examType, examType)))
        .orderBy(sql`RANDOM()`)
        .limit(count);
    } else {
      return await db
        .select()
        .from(questions)
        .where(eq(questions.subject, subject))
        .orderBy(sql`RANDOM()`)
        .limit(count);
    }
  }

  async getAllQuestions(): Promise<Question[]> {
    return await db.select().from(questions);
  }

  async createQuestion(questionData: InsertQuestion): Promise<Question> {
    const [question] = await db.insert(questions).values(questionData).returning();
    return question;
  }

  async createQuizSession(sessionData: InsertQuizSession): Promise<QuizSession> {
    const [session] = await db.insert(quizSessions).values(sessionData).returning();
    return session;
  }

  async getQuizHistory(userId: string): Promise<QuizSession[]> {
    return await db
      .select()
      .from(quizSessions)
      .where(eq(quizSessions.userId, userId))
      .orderBy(desc(quizSessions.completedAt));
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async upsertUserProgress(progressData: InsertUserProgress): Promise<UserProgress> {
    const existing = await db
      .select()
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, progressData.userId!),
          eq(userProgress.subject, progressData.subject),
          eq(userProgress.topic, progressData.topic || "")
        )
      );

    if (existing.length > 0) {
      const [updated] = await db
        .update(userProgress)
        .set({ ...progressData, lastPracticed: new Date() })
        .where(eq(userProgress.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(userProgress).values(progressData).returning();
      return created;
    }
  }

  async createSmsNotification(notificationData: Omit<SmsNotification, "id" | "sentAt">): Promise<SmsNotification> {
    const [notification] = await db.insert(smsNotifications).values(notificationData).returning();
    return notification;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.earnedAt));
  }

  async createAchievement(achievementData: Omit<Achievement, "id" | "earnedAt">): Promise<Achievement> {
    const [achievement] = await db.insert(achievements).values(achievementData).returning();
    return achievement;
  }

  async getFilteredRandomQuestions(params: {
    subject: string;
    count: number;
    examType?: string;
    difficulty?: string;
    topics?: string[];
    excludeIds?: string[];
  }): Promise<Question[]> {
    const { subject, count, examType, difficulty, topics, excludeIds } = params;

    // Build dynamic conditions
    const conditions: any[] = [eq(questions.subject, subject)];
    if (examType) conditions.push(eq(questions.examType, examType));
    if (difficulty) conditions.push(eq(questions.difficulty, difficulty));

    // Drizzle doesn't support array-contains; topics are plain text, match equality if provided
    // We accept first topic match OR any match; for simplicity use single topic or ignore
    // If topics provided, we filter client-side after selection to keep server simple

    let baseQuery = db
      .select()
      .from(questions)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(sql`RANDOM()`)
      .limit(Math.max(count * 2, count));

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
}

export const storage = new DatabaseStorage();
