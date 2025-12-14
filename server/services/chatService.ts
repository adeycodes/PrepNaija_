// services/chatService.ts
// Uses the same Groq API pattern as your explanation service

export interface ChatRequest {
  message: string;
  mode?: 'general' | 'teach' | 'solve' | 'explain';
  subject?: string;
}

export interface ChatResponse {
  response: string;
  success: boolean;
  isFallback?: boolean;
}

export async function generateChatResponse(request: ChatRequest): Promise<ChatResponse> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  console.log('[ChatService] 💬 Starting chat request...');
  console.log('[ChatService] Mode:', request.mode);
  console.log('[ChatService] Message:', request.message.substring(0, 100));
  
  if (!GROQ_API_KEY) {
    console.log('[ChatService] ⚠️ No GROQ_API_KEY found, using fallback');
    return {
      response: `I'd be happy to help with "${request.message}". For best results, review your textbook and practice past questions.`,
      success: false,
      isFallback: true
    };
  }
  
  // Different system prompts based on mode
  let systemPrompt = 'You are a helpful Nigerian exam assistant. Answer questions clearly and helpfully. Keep responses concise (200-300 words).';
  
  switch (request.mode) {
    case 'teach':
      systemPrompt = `You are a friendly Nigerian ${request.subject || 'JAMB'} teacher. 
      Teach topics in simple, engaging language with examples students can relate to. 
      Keep it SHORT and CLEAR (under 250 words). Use Nigerian examples when possible.`;
      break;
      
    case 'solve':
      systemPrompt = 'You are a Nigerian exam tutor. Help solve academic problems step-by-step. Show your reasoning clearly. Break down complex problems.';
      break;
      
    case 'explain':
      systemPrompt = 'You are a patient Nigerian tutor. Explain concepts clearly with examples. Break down complex ideas into simple parts. Make it easy to understand.';
      break;
  }
  
  try {
    console.log('[ChatService] 📡 Calling Groq API...');
    
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
            content: systemPrompt
          },
          {
            role: 'user',
            content: request.message
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ChatService] ❌ Groq API error:', response.status, errorText);
      return generateChatFallback(request);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse || aiResponse.length < 50) {
      console.log('[ChatService] ⚠️ Response too short, using fallback');
      return generateChatFallback(request);
    }
    
    console.log('[ChatService] ✅ SUCCESS! Response length:', aiResponse.length);
    
    return {
      response: aiResponse.trim(),
      success: true
    };

  } catch (error: any) {
    console.error('[ChatService] ❌ Exception:', error.message);
    return generateChatFallback(request);
  }
}

function generateChatFallback(request: ChatRequest): ChatResponse {
  const { message, mode, subject } = request;
  
  let fallbackResponse = `I understand you're asking about "${message}". `;
  
  if (mode === 'teach') {
    fallbackResponse += `To learn about this topic, review your ${subject || ''} textbook, watch tutorial videos, and practice with past exam questions. `;
    fallbackResponse += `Understanding the fundamentals is key to mastering ${subject || 'this subject'}.`;
  } else if (mode === 'solve') {
    fallbackResponse += `To solve this, break it down step-by-step. Identify what's being asked, apply the right formula or method, and check your work carefully. `;
    fallbackResponse += `Practice similar problems to improve your skills.`;
  } else {
    fallbackResponse += `For detailed help, consult your study materials or ask your teacher. `;
    fallbackResponse += `Regular practice and reviewing concepts will help you understand better.`;
  }
  
  return {
    response: fallbackResponse,
    success: false,
    isFallback: true
  };
}

// Optional: Add conversation history support
export async function generateChatWithHistory(
  request: ChatRequest,
  history: Array<{role: 'user' | 'assistant', content: string}>
): Promise<ChatResponse> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  
  if (!GROQ_API_KEY) {
    return generateChatFallback(request);
  }
  
  const messages = [
    {
      role: 'system' as const,
      content: 'You are a helpful Nigerian exam tutor. Answer questions based on the conversation history.'
    },
    ...history.slice(-6), // Keep last 3 exchanges (6 messages)
    {
      role: 'user' as const,
      content: request.message
    }
  ];
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 600,
      })
    });

    if (!response.ok) {
      return generateChatFallback(request);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    if (!aiResponse) {
      return generateChatFallback(request);
    }
    
    return {
      response: aiResponse.trim(),
      success: true
    };

  } catch (error) {
    return generateChatFallback(request);
  }
}