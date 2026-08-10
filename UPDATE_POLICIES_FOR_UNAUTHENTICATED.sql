-- SQL script to fix RLS policies for recipes, ingredients, instructions, and comments
-- Run this in your Supabase SQL Editor

-- 1. DROP ALL OLD POLICIES
DROP POLICY IF EXISTS "Users can insert their own recipes" ON recipes;
DROP POLICY IF EXISTS "Anyone can insert recipes" ON recipes;
DROP POLICY IF EXISTS "Users can update their own recipes" ON recipes;
DROP POLICY IF EXISTS "Users can delete their own recipes" ON recipes;
DROP POLICY IF EXISTS "Recipes are viewable by everyone" ON recipes;

DROP POLICY IF EXISTS "Ingredients are viewable by everyone" ON ingredients;
DROP POLICY IF EXISTS "Users can insert ingredients for their recipes" ON ingredients;
DROP POLICY IF EXISTS "Anyone can insert ingredients" ON ingredients;
DROP POLICY IF EXISTS "Users can update ingredients for their recipes" ON ingredients;
DROP POLICY IF EXISTS "Users can delete ingredients for their recipes" ON ingredients;

DROP POLICY IF EXISTS "Instructions are viewable by everyone" ON instructions;
DROP POLICY IF EXISTS "Users can insert instructions for their recipes" ON instructions;
DROP POLICY IF EXISTS "Anyone can insert instructions" ON instructions;
DROP POLICY IF EXISTS "Users can update instructions for their recipes" ON instructions;
DROP POLICY IF EXISTS "Users can delete instructions for their recipes" ON instructions;

-- 2. RECIPES POLICIES
CREATE POLICY "Recipes are viewable by everyone"
  ON recipes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert recipes"
  ON recipes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update recipes"
  ON recipes FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete recipes"
  ON recipes FOR DELETE
  USING (true);

-- 3. INGREDIENTS POLICIES (Fixes ingredient duplication on edit!)
CREATE POLICY "Ingredients are viewable by everyone"
  ON ingredients FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert ingredients"
  ON ingredients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update ingredients"
  ON ingredients FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete ingredients"
  ON ingredients FOR DELETE
  USING (true);

-- 4. INSTRUCTIONS POLICIES
CREATE POLICY "Instructions are viewable by everyone"
  ON instructions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert instructions"
  ON instructions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update instructions"
  ON instructions FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete instructions"
  ON instructions FOR DELETE
  USING (true);
