export const SUBJECTS = ["Mathematics", "English", "Physics", "Chemistry", "Biology"];

export const EXAM_TYPES = ["JAMB", "WAEC", "NECO"];

export const QUIZ_CONFIG = {
  questionsPerSession: 20,
  timeLimit: 30, // minutes
  passingScore: 60, // percentage
  masteryThreshold: 80, // percentage for mastery
};

export const POINTS_SYSTEM = {
  correctAnswer: 10,
  quizCompletion: 50,
  topicMastery: 100,
  dailyStreak: 200,
};

export const CACHE_CONFIG = {
  questionsPerSubject: 50,
  maxCacheAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

export const SUBJECT_ICONS = {
  Mathematics: "Calculator",
  English: "Book",
  Physics: "Zap",
  Chemistry: "FlaskConical",
  Biology: "Leaf",
} as const;

export const SUBJECT_COLORS = {
  Mathematics: "bg-blue-500",
  English: "bg-green-500",
  Physics: "bg-purple-500",
  Chemistry: "bg-orange-500",
  Biology: "bg-teal-500",
} as const;

export const ACHIEVEMENT_TYPES = {
  FIRST_QUIZ: "first_quiz",
  SUBJECT_MASTERY: "subject_mastery",
  STREAK_WARRIOR: "streak_warrior",
  QUESTION_CRUSHER: "question_crusher",
  PERFECT_SCORE: "perfect_score",
} as const;

export const SMS_TEMPLATES = {
  STUDY_REMINDER: (name: string) => 
    `Hi ${name}! 📚 Ready for your daily practice? Complete 10 questions today and earn energy points! - PrepNaija`,
  QUIZ_RESULTS: (name: string, score: number, subject: string) => 
    `🎉 Great job ${name}! You scored ${score}% in ${subject}. Keep practicing to improve further! - PrepNaija`,
  MASTERY_ACHIEVED: (name: string, subject: string) => 
    `🏆 Congratulations ${name}! You've achieved mastery in ${subject}! Time to celebrate and move to the next challenge! - PrepNaija`,
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your internet connection and try again.",
  UNAUTHORIZED: "Your session has expired. Please log in again.",
  QUIZ_LOAD_ERROR: "Failed to load quiz questions. Please try again.",
  SUBMIT_ERROR: "Failed to submit quiz. Your answers have been saved locally.",
  EXPLANATION_ERROR: "Failed to load explanation. Please try again.",
  SMS_ERROR: "Failed to send SMS reminder. Please check your phone number.",
  OFFLINE_ERROR: "This feature requires an internet connection.",
};

export const SUCCESS_MESSAGES = {
  QUIZ_SUBMITTED: "Quiz submitted successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
  SMS_SENT: "Study reminder sent successfully!",
  QUESTIONS_CACHED: "Questions cached for offline use!",
  ACHIEVEMENT_UNLOCKED: "New achievement unlocked!",
};
