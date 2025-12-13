// WORKING FREE AI EXPLANATIONS - NO API KEY NEEDED!

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
  // Validate request
  console.log('[AI] ✅ Received request:', {
    question: request.questionText.substring(0, 50) + '...',
    subject: request.subject,
    correctAnswer: request.correctAnswer,
    userAnswer: request.userAnswer
  });
  
  if (!request.questionText || !request.correctAnswer || !request.options) {
    console.error('[AI] ❌ Invalid request!');
    throw new Error('Invalid request: missing required fields');
  }
  
  // Try multiple AI services
  console.log('[AI] Trying AI services...');
  
  // Service 1: HuggingFace (Best quality)
  try {
    console.log('[AI] Trying HuggingFace...');
    const hfResult = await tryHuggingFace(request);
    if (hfResult) {
      console.log('[AI] ✅ SUCCESS with HuggingFace!');
      return hfResult;
    }
  } catch (error) {
    console.log('[AI] HuggingFace failed:', error);
  }
  
  // Service 2: Free GPT-like API
  try {
    console.log('[AI] Trying free GPT API...');
    const gptResult = await tryFreeGPT(request);
    if (gptResult) {
      console.log('[AI] ✅ SUCCESS with Free GPT!');
      return gptResult;
    }
  } catch (error) {
    console.log('[AI] Free GPT failed:', error);
  }
  
  // Service 3: Another free option
  try {
    console.log('[AI] Trying Replicate API...');
    const replicateResult = await tryReplicate(request);
    if (replicateResult) {
      console.log('[AI] ✅ SUCCESS with Replicate!');
      return replicateResult;
    }
  } catch (error) {
    console.log('[AI] Replicate failed:', error);
  }
  
  console.log('[AI] ⚠️ All AI services failed, using enhanced fallback');
  return generateEnhancedFallback(request);
}

// Try HuggingFace Inference API (Free, no key)
async function tryHuggingFace(request: ExplanationRequest): Promise<ExplanationResponse | null> {
  const isWrong = request.userAnswer !== request.correctAnswer;
  
  const systemPrompt = `You are an expert Nigerian exam tutor. Your job is to explain exam questions clearly and help students understand concepts.`;
  
  const userPrompt = `Explain this ${request.subject} exam question to a student:

QUESTION: ${request.questionText}

OPTIONS:
A) ${request.options.A}
B) ${request.options.B}
C) ${request.options.C}
D) ${request.options.D}

CORRECT ANSWER: ${request.correctAnswer}
STUDENT'S ANSWER: ${request.userAnswer}

Please provide a detailed explanation that:
1. Explains WHY option ${request.correctAnswer} is correct (be specific about the concept)
2. ${isWrong ? `Explains WHY option ${request.userAnswer} is wrong` : 'Highlights the key concept being tested'}
3. Provides helpful context or examples
4. Gives practical study advice

Write in a friendly, encouraging tone. Be specific and educational.`;

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 600,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true,
            return_full_text: false,
            repetition_penalty: 1.15,
          },
          options: {
            wait_for_model: true,
            use_cache: false,
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log('[HuggingFace] HTTP error:', response.status);
      return null;
    }

    const data = await response.json();
    
    // Handle loading state
    if (data.error && data.error.includes('loading')) {
      console.log('[HuggingFace] Model is loading, estimated time:', data.estimated_time);
      
      if (data.estimated_time && data.estimated_time < 60) {
        // Wait and retry once if loading time is reasonable
        await new Promise(resolve => setTimeout(resolve, (data.estimated_time + 2) * 1000));
        console.log('[HuggingFace] Retrying after model load...');
        return tryHuggingFace(request); // Recursive retry
      }
      return null;
    }
    
    // Handle other errors
    if (data.error) {
      console.log('[HuggingFace] API error:', data.error);
      return null;
    }
    
    // Extract text
    let explanation = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      explanation = data[0].generated_text.trim();
    } else if (data.generated_text) {
      explanation = data.generated_text.trim();
    }

    // Validate quality
    if (!explanation || explanation.length < 200) {
      console.log('[HuggingFace] Response too short:', explanation?.length || 0, 'chars');
      return null;
    }

    // Clean up
    explanation = cleanupAIResponse(explanation);

    console.log('[HuggingFace] Got quality response:', explanation.length, 'chars');

    return {
      explanation: explanation,
      keyPoints: extractKeyPoints(explanation, request),
      studyTips: generateStudyTips(request),
    };
    
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('[HuggingFace] Request timeout');
    } else {
      console.log('[HuggingFace] Exception:', error.message);
    }
    return null;
  }
}

// Try Free GPT API (Alternative)
async function tryFreeGPT(request: ExplanationRequest): Promise<ExplanationResponse | null> {
  try {
    const prompt = `As a tutor, explain why option ${request.correctAnswer} is correct for this question: "${request.questionText}". The options are: A) ${request.options.A}, B) ${request.options.B}, C) ${request.options.C}, D) ${request.options.D}. The student chose ${request.userAnswer}. Provide a clear, detailed explanation.`;

    const response = await fetch('https://api.pawan.krd/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful exam tutor.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500
      })
    });

    if (response.ok) {
      const data = await response.json();
      const explanation = data.choices?.[0]?.message?.content;
      
      if (explanation && explanation.length > 200) {
        return {
          explanation: cleanupAIResponse(explanation),
          keyPoints: extractKeyPoints(explanation, request),
          studyTips: generateStudyTips(request),
        };
      }
    }
    
    return null;
  } catch (error) {
    console.log('[FreeGPT] Failed');
    return null;
  }
}

// Try Replicate API
async function tryReplicate(request: ExplanationRequest): Promise<ExplanationResponse | null> {
  try {
    const prompt = `Question: ${request.questionText}\nOptions: A) ${request.options.A}, B) ${request.options.B}, C) ${request.options.C}, D) ${request.options.D}\nCorrect: ${request.correctAnswer}\nStudent chose: ${request.userAnswer}\n\nExplain why ${request.correctAnswer} is correct and help the student understand.`;

    const response = await fetch('https://replicate.com/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'meta/llama-2-7b-chat',
        input: { prompt: prompt, max_tokens: 500 }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const explanation = data.output?.join('');
      
      if (explanation && explanation.length > 200) {
        return {
          explanation: cleanupAIResponse(explanation),
          keyPoints: extractKeyPoints(explanation, request),
          studyTips: generateStudyTips(request),
        };
      }
    }
    
    return null;
  } catch (error) {
    console.log('[Replicate] Failed');
    return null;
  }
}

function cleanupAIResponse(text: string): string {
  // Remove prompt echoes
  text = text.replace(/^(You are|As a|Question:|Options:|Correct Answer:|Please explain|Explanation:)/gi, '');
  // Remove excessive whitespace
  text = text.replace(/\n{3,}/g, '\n\n');
  // Remove incomplete sentences at the end
  const sentences = text.split(/[.!?]+/);
  if (sentences[sentences.length - 1].trim().length < 20) {
    sentences.pop();
  }
  text = sentences.join('. ').trim();
  if (!text.endsWith('.') && !text.endsWith('!') && !text.endsWith('?')) {
    text += '.';
  }
  return text;
}

function extractKeyPoints(explanation: string, request: ExplanationRequest): string[] {
  const points: string[] = [];
  
  const sentences = explanation
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 40 && s.length < 250);
  
  // Prioritize informative sentences
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (lower.includes('because') || lower.includes('correct') || 
        lower.includes('important') || lower.includes('key') ||
        lower.includes(request.correctAnswer.toLowerCase())) {
      points.push(sentence);
      if (points.length >= 3) break;
    }
  }
  
  if (points.length < 3) {
    points.push(...sentences.slice(0, 3 - points.length));
  }
  
  if (points.length === 0) {
    const correctOpt = request.options[request.correctAnswer as keyof typeof request.options];
    points.push(`The correct answer is ${request.correctAnswer}: ${correctOpt}`);
    points.push(`This tests your understanding of ${request.subject}`);
    points.push(`Review this concept to strengthen your knowledge`);
  }
  
  return points.slice(0, 3);
}

function generateStudyTips(request: ExplanationRequest): string[] {
  return [
    `Focus on mastering ${request.subject} fundamentals thoroughly`,
    `Practice regularly with past exam questions`,
    `Review your mistakes to understand where you went wrong`,
  ];
}

function generateEnhancedFallback(request: ExplanationRequest): ExplanationResponse {
  const isCorrect = request.userAnswer === request.correctAnswer;
  const correctOpt = request.options[request.correctAnswer as keyof typeof request.options];
  const userOpt = request.options[request.userAnswer as keyof typeof request.options];
  
  let explanation = `## ${isCorrect ? '✅ Correct!' : '📚 Learning Opportunity'}\n\n`;
  explanation += `**Correct Answer: ${request.correctAnswer}) ${correctOpt}**\n\n`;
  
  if (!isCorrect) {
    explanation += `**Your Answer: ${request.userAnswer}) ${userOpt}**\n\n`;
  }
  
  explanation += `### Detailed Explanation\n\n`;
  
  const subject = request.subject.toLowerCase();
  const questionLower = request.questionText.toLowerCase();
  
  // Subject-specific explanations
  if (subject.includes('english') || subject.includes('literature')) {
    if (questionLower.includes('synonym') || questionLower.includes('similar meaning')) {
      explanation += `This question tests your vocabulary and understanding of word meanings. `;
      explanation += `**${correctOpt}** is the correct answer because it has the closest meaning to the word in question.\n\n`;
      
      if (!isCorrect) {
        explanation += `Your choice **${userOpt}** has a different meaning or usage. `;
        explanation += `To improve: Read the sentence context carefully and consider how each word would fit. `;
        explanation += `Build your vocabulary by reading widely and noting how words are used in different contexts.\n\n`;
      }
    } else if (questionLower.includes('antonym') || questionLower.includes('opposite')) {
      explanation += `This tests your understanding of opposite meanings. `;
      explanation += `**${correctOpt}** is correct because it means the opposite of the given word.\n\n`;
    } else if (questionLower.includes('grammar') || questionLower.includes('tense') || questionLower.includes('verb')) {
      explanation += `This is a grammar question testing proper ${request.subject} usage. `;
      explanation += `**${correctOpt}** follows the correct grammatical rules.\n\n`;
      
      if (!isCorrect) {
        explanation += `Your answer violates standard grammar rules. Review tense usage, subject-verb agreement, and sentence structure.\n\n`;
      }
    } else {
      explanation += `In ${request.subject}, understanding context and meaning is crucial. `;
      explanation += `**${correctOpt}** is the most appropriate answer based on standard usage and context.\n\n`;
    }
  } 
  
  else if (subject.includes('math')) {
    explanation += `This ${request.subject} question requires applying mathematical principles correctly. `;
    explanation += `**${correctOpt}** is the result of proper calculation.\n\n`;
    
    if (!isCorrect) {
      explanation += `Your answer **${userOpt}** suggests a calculation error. Common mistakes include:\n`;
      explanation += `- Incorrect order of operations\n`;
      explanation += `- Sign errors (positive/negative)\n`;
      explanation += `- Misreading the question\n\n`;
      explanation += `Review the solution step-by-step and practice similar problems.\n\n`;
    }
  }
  
  else if (subject.includes('biology') || subject.includes('science')) {
    if (questionLower.includes('function') || questionLower.includes('role')) {
      explanation += `This question tests your understanding of biological functions and structures. `;
      explanation += `**${correctOpt}** correctly identifies the function or role being asked about.\n\n`;
    } else {
      explanation += `In ${request.subject}, understanding systems and their components is key. `;
      explanation += `**${correctOpt}** accurately describes the biological concept.\n\n`;
    }
    
    if (!isCorrect) {
      explanation += `Your answer confuses different structures or functions. Study diagrams and understand each component's specific role.\n\n`;
    }
  }
  
  else if (subject.includes('chemistry')) {
    explanation += `This ${request.subject} question tests chemical principles and reactions. `;
    explanation += `**${correctOpt}** follows the correct chemical behavior.\n\n`;
    
    if (!isCorrect) {
      explanation += `Review the periodic table, chemical equations, and reaction types to understand why ${correctOpt} is correct.\n\n`;
    }
  }
  
  else if (subject.includes('physics')) {
    explanation += `This ${request.subject} question applies physical laws and principles. `;
    explanation += `**${correctOpt}** correctly represents the physical relationship.\n\n`;
    
    if (!isCorrect) {
      explanation += `Review formulas, units, and the specific law being tested.\n\n`;
    }
  }
  
  else {
    explanation += `Based on ${request.subject} principles, **${correctOpt}** is the most accurate answer. `;
    explanation += `This tests your understanding of key concepts in this subject area.\n\n`;
    
    if (!isCorrect) {
      explanation += `Review the topic and practice similar questions to improve your understanding.\n\n`;
    }
  }
  
  explanation += `### 💡 Study Strategy\n\n`;
  explanation += `- **Understand the concept**: Don't just memorize answers\n`;
  explanation += `- **Practice regularly**: Consistent practice builds mastery\n`;
  explanation += `- **Learn from mistakes**: Each error is a learning opportunity\n`;
  explanation += `- **Review thoroughly**: Go back to your textbooks and notes\n`;
  
  const keyPoints = [
    `The correct answer is ${request.correctAnswer}: ${correctOpt}`,
    isCorrect ? 'Great job! You understood the concept correctly' : `Understanding why ${request.correctAnswer} is correct helps you master this topic`,
    `Focus on the fundamental principles of ${request.subject}`,
  ];
  
  const studyTips = [
    `Review ${request.subject} concepts systematically`,
    `Practice with past exam questions daily`,
    `Understand the "why" behind each answer`,
  ];
  
  return { explanation, keyPoints, studyTips };
}

export async function generateQuestionVariation(baseQuestion: any): Promise<any> {
  throw new Error("Question variation requires API key");
}