-- Fix database schema step by step

-- First, let's add the missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url varchar;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();

-- Add email unique constraint
ALTER TABLE users ADD CONSTRAINT IF NOT EXISTS users_email_unique UNIQUE(email);

-- Fix profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS selected_subjects text[];
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS target_exam text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();

-- Fix achievements table
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS user_id text;
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS earned_at timestamp DEFAULT now();

-- Fix questions table - this is the problematic one
-- Add new columns first
ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_text text;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS correct_answer text;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now();

-- Copy data from old columns to new ones if they exist
UPDATE questions SET question_text = question WHERE question_text IS NULL AND question IS NOT NULL;
UPDATE questions SET correct_answer = correctanswer WHERE correct_answer IS NULL AND correctanswer IS NOT NULL;

-- Set default year if needed
ALTER TABLE questions ALTER COLUMN year SET DEFAULT 2025;

-- Fix user_progress mastery_level default
ALTER TABLE user_progress ALTER COLUMN mastery_level SET DEFAULT '0.00';

-- Now drop old columns (be careful!)
-- ALTER TABLE users DROP COLUMN IF EXISTS firstname;
-- ALTER TABLE users DROP COLUMN IF EXISTS lastname;
-- ALTER TABLE users DROP COLUMN IF EXISTS createdat;
-- ALTER TABLE users DROP COLUMN IF EXISTS updatedat;

-- ALTER TABLE profiles DROP COLUMN IF EXISTS fullname;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS selectedsubjects;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS targetexam;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS createdat;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS updatedat;

-- ALTER TABLE achievements DROP COLUMN IF EXISTS userid;
-- ALTER TABLE achievements DROP COLUMN IF EXISTS earnedat;

-- ALTER TABLE questions DROP COLUMN IF EXISTS question;
-- ALTER TABLE questions DROP COLUMN IF EXISTS correctanswer;
-- ALTER TABLE questions DROP COLUMN IF EXISTS createdat;
-- ALTER TABLE questions DROP COLUMN IF EXISTS option_a;
-- ALTER TABLE questions DROP COLUMN IF EXISTS option_b;
-- ALTER TABLE questions DROP COLUMN IF EXISTS option_c;
-- ALTER TABLE questions DROP COLUMN IF EXISTS option_d;
-- ALTER TABLE questions DROP COLUMN IF EXISTS difficulty_level;

-- Create index on sessions expire if it doesn't exist
CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions USING btree (expire);

-- Add foreign key constraints if they don't exist
-- Note: These might fail if referential integrity is not maintained
-- ALTER TABLE quiz_sessions ADD CONSTRAINT IF NOT EXISTS quiz_sessions_user_id_profiles_id_fk 
--   FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE no action ON UPDATE no action;

-- ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS profiles_id_users_id_fk 
--   FOREIGN KEY (id) REFERENCES users(id) ON DELETE no action ON UPDATE no action;

-- ALTER TABLE achievements ADD CONSTRAINT IF NOT EXISTS achievements_user_id_profiles_id_fk 
--   FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE no action ON UPDATE no action;

-- ALTER TABLE sms_notifications ADD CONSTRAINT IF NOT EXISTS sms_notifications_user_id_profiles_id_fk 
--   FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE no action ON UPDATE no action;

-- ALTER TABLE user_progress ADD CONSTRAINT IF NOT EXISTS user_progress_user_id_profiles_id_fk 
--   FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE no action ON UPDATE no action;
