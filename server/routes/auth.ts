// server/routes/auth.ts
import { supabase } from "../supabaseClient";
import type { Express } from "express";

export function setupAuthRoutes(app: Express) {
  // Login: Email + Password
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      console.log(`🔐 Login attempt for: ${email}`);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log(`❌ Login failed: ${error.message}`);
        return res.status(401).json({ error: error.message });
      }

      if (!data.session) {
        console.log(`❌ No session created for: ${email}`);
        return res.status(401).json({ error: "Authentication failed - no session created" });
      }

      console.log(`✅ Login successful for: ${email}`);
      
      // Return both user and session info
      return res.json({ 
        user: data.user,
        session: data.session,
        access_token: data.session?.access_token
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ error: "Internal server error during login" });
    }
  });

  // Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: "Email, password, first name, and last name are required" });
      }

      console.log(`🔏 Register attempt for: ${email}`);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          // For development, you can add email confirmation skip
          emailRedirectTo: process.env.NODE_ENV === 'development' 
            ? `http://localhost:5174/auth/callback` 
            : `${process.env.FRONTEND_URL || 'https://your-domain.com'}/auth/callback`
        },
      });

      if (error) {
        console.log(`❌ Registration failed: ${error.message}`);
        return res.status(400).json({ error: error.message });
      }

      console.log(`✅ Registration successful for: ${email}`);

      // Return additional info about confirmation requirement
      return res.json({ 
        user: data.user,
        message: data.user?.email_confirmed_at ? 
          "Account created successfully!" : 
          "Please check your email and click the confirmation link to complete your registration."
      });
    } catch (err) {
      console.error('Registration error:', err);
      return res.status(500).json({ error: "Internal server error during registration" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
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

  // Email confirmation callback
  app.get("/api/auth/callback", async (req, res) => {
    const { token_hash, type, next } = req.query;

    if (type === 'email_change' || type === 'signup') {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token_hash as string,
        type: type as any,
      });

      if (error) {
        return res.redirect(`http://localhost:5173/auth/error?message=${encodeURIComponent(error.message)}`);
      }

      // Redirect to success page or dashboard
      return res.redirect(`http://localhost:5173/auth/confirmed`);
    }

    return res.redirect('http://localhost:5173/');
  });

  // Test user creation (development only)
  if (process.env.NODE_ENV === 'development') {
    app.post("/api/auth/create-test-user", async (req, res) => {
      const { email, password, firstName, lastName } = req.body;
      
      try {
        // Use Supabase admin to create user without email confirmation
        const { data, error } = await supabase.auth.admin.createUser({
          email,
          password,
          user_metadata: {
            first_name: firstName,
            last_name: lastName
          },
          email_confirm: true // Auto-confirm email
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

  // Logout (optional: just destroy token on frontend)
  app.post("/api/auth/logout", (_req, res) => {
    // Supabase: logout = destroy token on frontend
    return res.json({ success: true });
  });
}