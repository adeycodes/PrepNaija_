-- Fix column naming inconsistencies
-- Rename createdat to created_at and updatedat to updated_at

-- Questions table
ALTER TABLE questions 
RENAME COLUMN createdat TO created_at;

ALTER TABLE questions 
RENAME COLUMN updatedat TO updated_at;

-- Users table (if needed)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'createdat'
    ) THEN
        ALTER TABLE users RENAME COLUMN createdat TO created_at;
    END IF;
END$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'updatedat'
    ) THEN
        ALTER TABLE users RENAME COLUMN updatedat TO updated_at;
    END IF;
END$$;

-- Profiles table (if needed)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'createdat'
    ) THEN
        ALTER TABLE profiles RENAME COLUMN createdat TO created_at;
    END IF;
END$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'updatedat'
    ) THEN
        ALTER TABLE profiles RENAME COLUMN updatedat TO updated_at;
    END IF;
END$$;
