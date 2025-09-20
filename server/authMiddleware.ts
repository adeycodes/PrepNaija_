// server/authMiddleware.ts
import { supabase } from "./supabaseClient";
import type { Request, Response, NextFunction } from "express";

// ✅ Middleware: isAuthenticated
export const isAuthenticated = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
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

// ✅ Export setupAuth (required by registerRoutes.ts)
export const setupAuth = async (app: any) => {
  console.log("Supabase auth setup complete");
};