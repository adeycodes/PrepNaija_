// server/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL environment variable is required');
}

if (!supabaseAnonKey) {
  throw new Error('SUPABASE_ANON_KEY environment variable is required');
}

// Validate URL format
if (!supabaseUrl.includes('.supabase.co')) {
  console.warn('⚠️  SUPABASE_URL should use format: https://your-project.supabase.co');
  console.warn(`   Current URL: ${supabaseUrl}`);
}

if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Supabase client configured:');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`);
}

// Create Supabase client with custom fetch options for better timeout handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist sessions on server
    autoRefreshToken: false, // Don't auto-refresh tokens on server
  },
  global: {
    fetch: (url, options = {}) => {
      // Add timeout and retry logic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      return fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'Connection': 'keep-alive',
        },
      }).finally(() => {
        clearTimeout(timeoutId);
      });
    },
  },
});
