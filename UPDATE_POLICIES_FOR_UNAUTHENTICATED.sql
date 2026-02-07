-- SQL script to update RLS policies to allow unauthenticated recipe creation
-- Run this in your Supabase SQL Editor if you've already set up the database

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Users can insert their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can insert ingredients for their recipes" ON ingredients;
DROP POLICY IF EXISTS "Users can insert instructions for their recipes" ON instructions;

-- Create new policies that allow anyone (including unauthenticated users) to insert

-- Recipes: Allow anyone to insert recipes
CREATE POLICY "Anyone can insert recipes"
  ON recipes FOR INSERT
  WITH CHECK (true);

-- Ingredients: Allow anyone to insert ingredients
CREATE POLICY "Anyone can insert ingredients"
  ON ingredients FOR INSERT
  WITH CHECK (true);

-- Instructions: Allow anyone to insert instructions
CREATE POLICY "Anyone can insert instructions"
  ON instructions FOR INSERT
  WITH CHECK (true);

-- Optional: Update UPDATE and DELETE policies to allow updates/deletes for recipes with null user_id
-- (Uncomment these if you want anyone to be able to update/delete recipes they created while unauthenticated)

-- DROP POLICY IF EXISTS "Users can update their own recipes" ON recipes;
-- DROP POLICY IF EXISTS "Users can delete their own recipes" ON recipes;
-- 
-- CREATE POLICY "Users can update their own recipes"
--   ON recipes FOR UPDATE
--   USING (auth.uid() = user_id OR user_id IS NULL);
-- 
-- CREATE POLICY "Users can delete their own recipes"
--   ON recipes FOR DELETE
--   USING (auth.uid() = user_id OR user_id IS NULL);
