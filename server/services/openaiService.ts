import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "your-api-key"
});

export interface ExplanationRequest {
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: string;
  subject: string;
  userAnswer: string;
}

export interface ExplanationResponse {
  explanation: string;
  keyPoints: string[];
  studyTips: string[];
}

export async function generateExplanation(request: ExplanationRequest): Promise<ExplanationResponse> {
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
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      explanation: result.explanation || "Explanation not available",
      keyPoints: result.keyPoints || [],
      studyTips: result.studyTips || [],
    };
  } catch (error) {
    console.error("Error generating explanation:", error);
    throw new Error("Failed to generate explanation. Please try again.");
  }
}

export async function generateQuestionVariation(baseQuestion: any): Promise<any> {
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
      max_tokens: 1000,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error("Error generating question variation:", error);
    throw new Error("Failed to generate question variation");
  }
}
