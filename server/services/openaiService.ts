// GUARANTEED WORKING AI EXPLANATIONS
// Uses Groq API - FREE, FAST, UNLIMITED (for now)

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
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  console.log('[AI] 🚀 Starting explanation generation...');
  console.log('[AI] Question:', request.questionText.substring(0, 100));
  console.log('[AI] Subject:', request.subject);
  console.log('[AI] Correct:', request.correctAnswer, 'User:', request.userAnswer);
  
  // If no API key, use enhanced fallback
  if (!GROQ_API_KEY) {
    console.log('[AI] ⚠️ No GROQ_API_KEY found, using fallback');
    return generateEnhancedFallback(request);
  }
  
  const isWrong = request.userAnswer !== request.correctAnswer;
  
  const prompt = `You are an expert Nigerian exam tutor. Explain this ${request.subject} question clearly.

QUESTION: ${request.questionText}

OPTIONS:
A) ${request.options.A}
B) ${request.options.B}
C) ${request.options.C}
D) ${request.options.D}

CORRECT ANSWER: ${request.correctAnswer}
STUDENT'S ANSWER: ${request.userAnswer}

Provide a detailed, helpful explanation (200-300 words) that:
1. Explains specifically WHY ${request.correctAnswer} is the correct answer
2. ${isWrong ? `Explains why ${request.userAnswer} is incorrect` : 'Highlights the key concept'}
3. Provides context and examples relevant to Nigerian students
4. Gives practical study advice

Be specific, educational, and encouraging. Use simple language.`;

  try {
    console.log('[AI] 📡 Calling Groq API...');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful, patient exam tutor who explains concepts clearly.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI] ❌ Groq API error:', response.status, errorText);
      return generateEnhancedFallback(request);
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content;

    if (!explanation || explanation.length < 100) {
      console.log('[AI] ⚠️ Response too short, using fallback');
      return generateEnhancedFallback(request);
    }

    console.log('[AI] ✅ SUCCESS! Got AI explanation:', explanation.length, 'chars');

    return {
      explanation: explanation.trim(),
      keyPoints: extractKeyPoints(explanation, request),
      studyTips: generateStudyTips(request),
    };

  } catch (error: any) {
    console.error('[AI] ❌ Exception:', error.message);
    return generateEnhancedFallback(request);
  }
}

function extractKeyPoints(explanation: string, request: ExplanationRequest): string[] {
  const points: string[] = [];
  
  const sentences = explanation
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 30 && s.length < 200);
  
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (lower.includes('correct') || lower.includes('because') || 
        lower.includes('important') || lower.includes(request.correctAnswer.toLowerCase())) {
      points.push(sentence);
      if (points.length >= 3) break;
    }
  }
  
  if (points.length < 3) {
    points.push(...sentences.slice(0, 3 - points.length));
  }
  
  if (points.length === 0) {
    points.push(`The correct answer is ${request.correctAnswer}`);
    points.push(`This tests ${request.subject} understanding`);
    points.push(`Practice similar questions to improve`);
  }
  
  return points.slice(0, 3);
}

function generateStudyTips(request: ExplanationRequest): string[] {
  return [
    `Master the fundamentals of ${request.subject}`,
    `Practice regularly with past exam questions`,
    `Learn from your mistakes and review concepts`,
  ];
}

function generateEnhancedFallback(request: ExplanationRequest): ExplanationResponse {
  const isCorrect = request.userAnswer === request.correctAnswer;
  const correctOpt = request.options[request.correctAnswer as keyof typeof request.options];
  const userOpt = request.options[request.userAnswer as keyof typeof request.options];
  
  let explanation = `## ${isCorrect ? '✅ Correct Answer!' : '📚 Learning from Mistakes'}\n\n`;
  explanation += `**Answer: ${request.correctAnswer}) ${correctOpt}**\n\n`;
  
  if (!isCorrect) {
    explanation += `You selected: **${request.userAnswer}) ${userOpt}**\n\n`;
  }
  
  explanation += `### Why This is ${isCorrect ? 'Correct' : 'the Right Answer'}\n\n`;
  
  const subject = request.subject.toLowerCase();
  const questionText = request.questionText.toLowerCase();
  
  // Mathematics-specific explanations
  if (subject.includes('math')) {
    explanation += `This is a ${request.subject} problem that requires careful calculation and understanding of mathematical principles.\n\n`;
    explanation += `**${correctOpt}** is the correct answer because it represents the accurate result when you:\n`;
    explanation += `- Apply the correct formula or method\n`;
    explanation += `- Follow the proper order of operations\n`;
    explanation += `- Avoid common calculation errors\n\n`;
    
    if (!isCorrect) {
      explanation += `**Why your answer was incorrect:**\n`;
      explanation += `Your selection of **${userOpt}** suggests there may have been:\n`;
      explanation += `- A miscalculation in one of the steps\n`;
      explanation += `- Confusion about which formula to use\n`;
      explanation += `- A sign error or operational mistake\n\n`;
    }
    
    explanation += `**How to solve similar problems:**\n`;
    explanation += `1. Read the question carefully and identify what's being asked\n`;
    explanation += `2. Write down the relevant formula or approach\n`;
    explanation += `3. Substitute values carefully and work step-by-step\n`;
    explanation += `4. Double-check your calculations before selecting an answer\n`;
  }
  
  // English-specific explanations
  else if (subject.includes('english')) {
    explanation += `In ${request.subject}, this question tests your understanding of vocabulary, grammar, or comprehension.\n\n`;
    explanation += `**${correctOpt}** is correct because it:\n`;
    explanation += `- Best fits the context of the sentence or passage\n`;
    explanation += `- Follows proper grammatical rules\n`;
    explanation += `- Accurately conveys the intended meaning\n\n`;
    
    if (!isCorrect) {
      explanation += `**Why your answer was incorrect:**\n`;
      explanation += `The option you chose (**${userOpt}**) doesn't work as well because:\n`;
      explanation += `- It may have a different meaning or usage\n`;
      explanation += `- It doesn't fit the grammatical structure\n`;
      explanation += `- It's not the most appropriate choice in this context\n\n`;
    }
    
    explanation += `**Study tips for English:**\n`;
    explanation += `- Read widely to expand your vocabulary\n`;
    explanation += `- Pay attention to how words are used in context\n`;
    explanation += `- Practice grammar rules regularly\n`;
    explanation += `- Learn common word patterns and collocations\n`;
  }
  
  // Biology-specific explanations
  else if (subject.includes('biology')) {
    explanation += `This ${request.subject} question tests your knowledge of biological structures, functions, or processes.\n\n`;
    explanation += `**${correctOpt}** is the correct answer because:\n`;
    explanation += `- It accurately describes the biological function or structure being asked about\n`;
    explanation += `- It's based on established scientific understanding\n`;
    explanation += `- It distinguishes the correct component from similar but different ones\n\n`;
    
    if (!isCorrect) {
      explanation += `**Why your answer was incorrect:**\n`;
      explanation += `**${userOpt}** is related but serves a different function or represents a different structure.\n\n`;
    }
    
    explanation += `**Study approach:**\n`;
    explanation += `- Understand the specific functions of each biological component\n`;
    explanation += `- Use diagrams to visualize structures and their relationships\n`;
    explanation += `- Focus on the differences between similar-sounding terms\n`;
    explanation += `- Connect structure to function in biological systems\n`;
  }
  
  // General fallback for other subjects
  else {
    explanation += `Based on ${request.subject} principles, **${correctOpt}** is the most accurate answer.\n\n`;
    explanation += `This question tests your understanding of core concepts in ${request.subject}. `;
    explanation += `The correct answer requires you to apply your knowledge of the subject matter accurately.\n\n`;
    
    if (!isCorrect) {
      explanation += `Your selection wasn't quite right this time, but reviewing this concept will help you master it.\n\n`;
    }
    
    explanation += `**Key takeaway:** Focus on understanding the fundamental principles rather than just memorizing answers.\n`;
  }
  
  explanation += `\n### 💡 Moving Forward\n\n`;
  explanation += `${isCorrect ? '**Great job!** Keep practicing to maintain your strong performance.' : '**Don\'t worry!** Mistakes are valuable learning opportunities.'}\n\n`;
  explanation += `Continue practicing similar questions, review your class notes, and make sure you understand the underlying concepts thoroughly.\n`;
  
  const keyPoints = [
    `The correct answer is ${request.correctAnswer}: ${correctOpt}`,
    isCorrect ? 'You got it right! Well done!' : `Understanding why ${request.correctAnswer} is correct helps you improve`,
    `Master ${request.subject} fundamentals through consistent practice`,
  ];
  
  const studyTips = [
    `Review ${request.subject} concepts systematically`,
    `Practice with past questions regularly`,
    `Understand principles, don't just memorize answers`,
  ];
  
  return { explanation, keyPoints, studyTips };
}

export async function generateQuestionVariation(baseQuestion: any): Promise<any> {
  throw new Error("Question variation not implemented");
}