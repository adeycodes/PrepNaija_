// server/routes/quiz.ts
import { supabase } from "../supabaseClient";
import type { Express } from "express";

export function setupQuizRoutes(app: Express) {
  // Submit quiz results
  app.post("/api/quiz/submit", async (req, res) => {
    try {
      const {
        subject,
        examType,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        timeSpent,
        questionsAnswered,
      } = req.body;

      // Authenticate using Bearer token; fallback to server session if available
      const authHeader = req.headers.authorization as string | undefined;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

      let userId: string | null = null;
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
        console.error('Authentication failed: no token and no supabase session');
        return res.status(401).json({ error: 'Not authenticated' });
      }

      console.log('Submitting quiz for user:', userId);
      console.log('Quiz data:', {
        subject,
        examType,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        timeSpent,
        questionsCount: questionsAnswered?.length || 0
      });

      // Insert the quiz session into the database
      const { data: quizSession, error: insertError } = await supabase
        .from('quiz_sessions')
        .insert([
          {
            user_id: userId,
            subject,
            exam_type: examType,
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            wrong_answers: wrongAnswers,
            score_percentage: (correctAnswers / totalQuestions) * 100,
            time_spent: timeSpent,
            questions_answered: questionsAnswered,
          },
        ])
        .select('id')
        .single();

      if (insertError) {
        console.error('Error inserting quiz session:', insertError);
        return res.status(500).json({ error: insertError.message });
      }

      if (!quizSession || !quizSession.id) {
        console.error('No quiz session ID returned after insert');
        return res.status(500).json({ error: 'Failed to create quiz session' });
      }

      console.log('Quiz session created with ID:', quizSession.id);

      // Update user progress for each question
      for (const qa of questionsAnswered) {
        const { error: progressError } = await supabase.rpc('update_user_progress', {
          p_user_id: userId,
          p_subject: subject,
          p_question_id: qa.questionId,
          p_is_correct: qa.isCorrect,
          p_topic: null, // You might want to include topic if available
        });

        if (progressError) {
          console.error('Error updating user progress:', progressError);
          // Don't fail the whole request for progress update errors
        }
      }

      // Return the session ID to the client
      console.log('Sending response with session ID:', quizSession.id);
      const responseData = {
        success: true,
        sessionId: quizSession.id,
        id: quizSession.id, // Add this line to match frontend expectations
        score: (correctAnswers / totalQuestions) * 100,
      };
      console.log('Full response data:', responseData);
      return res.json(responseData);
    } catch (error: any) {
      console.error('Error in quiz submission:', error);
      return res.status(500).json({ 
        error: 'Internal server error during quiz submission',
        details: error?.message || 'Unknown error' 
      });
    }
  });

  // Get quiz history for the current user
  app.get("/api/quiz/history", async (req, res) => {
    try {
      // Authenticate using Bearer token; fallback to server session
      const authHeader = req.headers.authorization as string | undefined;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
      let userId: string | null = null;
      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user?.id) userId = user.id;
      }
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) userId = session.user.id;
      }
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { data, error } = await supabase
        .from('quiz_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform the data to match the expected format
      const formattedData = data.map(session => ({
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
      console.error('Error fetching quiz history:', error);
      return res.status(500).json({ error: 'Failed to fetch quiz history' });
    }
  });
}
