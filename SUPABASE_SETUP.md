# Supabase Database Setup

## Table Structure

Run these SQL commands in your Supabase SQL Editor to create the necessary tables.

### 1. Enable UUID extension (if not already enabled)
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 2. Create Recipes Table
```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  ready_in_minutes INTEGER DEFAULT 0,
  servings INTEGER DEFAULT 1,
  image_url TEXT,
  meal_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_meal_type ON recipes(meal_type);
CREATE INDEX idx_recipes_title ON recipes(title);
CREATE INDEX idx_recipes_created_at ON recipes(created_at DESC);
```

### 3. Create Ingredients Table
```sql
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL,
  unit TEXT,
  original TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_ingredients_recipe_id ON ingredients(recipe_id);
```

### 4. Create Instructions Table
```sql
CREATE TABLE instructions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_text TEXT NOT NULL,
  instruction_group TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, step_number)
);

-- Create index for faster lookups
CREATE INDEX idx_instructions_recipe_id ON instructions(recipe_id);
```

### 5. Create Updated At Trigger Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
```

### 6. Create Trigger for Recipes Table
```sql
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Row Level Security (RLS) Policies

### Enable RLS on Recipes
```sql
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructions ENABLE ROW LEVEL SECURITY;
```

### Recipes Policies
```sql
-- Allow anyone to read recipes (public access)
CREATE POLICY "Recipes are viewable by everyone"
  ON recipes FOR SELECT
  USING (true);

-- Allow anyone (authenticated or not) to insert recipes
CREATE POLICY "Anyone can insert recipes"
  ON recipes FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own recipes (or allow anyone if you want)
CREATE POLICY "Users can update their own recipes"
  ON recipes FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to delete their own recipes (or allow anyone if you want)
CREATE POLICY "Users can delete their own recipes"
  ON recipes FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);
```

### Ingredients Policies
```sql
-- Allow anyone to read ingredients
CREATE POLICY "Ingredients are viewable by everyone"
  ON ingredients FOR SELECT
  USING (true);

-- Allow anyone to insert ingredients for any recipe
CREATE POLICY "Anyone can insert ingredients"
  ON ingredients FOR INSERT
  WITH CHECK (true);

-- Allow users to update ingredients for their recipes
CREATE POLICY "Users can update ingredients for their recipes"
  ON ingredients FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Allow users to delete ingredients for their recipes
CREATE POLICY "Users can delete ingredients for their recipes"
  ON ingredients FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = ingredients.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );
```

### Instructions Policies
```sql
-- Allow anyone to read instructions
CREATE POLICY "Instructions are viewable by everyone"
  ON instructions FOR SELECT
  USING (true);

-- Allow anyone to insert instructions for any recipe
CREATE POLICY "Anyone can insert instructions"
  ON instructions FOR INSERT
  WITH CHECK (true);

-- Allow users to update instructions for their recipes
CREATE POLICY "Users can update instructions for their recipes"
  ON instructions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = instructions.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );

-- Allow users to delete instructions for their recipes
CREATE POLICY "Users can delete instructions for their recipes"
  ON instructions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM recipes
      WHERE recipes.id = instructions.recipe_id
      AND recipes.user_id = auth.uid()
    )
  );
```

## Storage Bucket for Recipe Images (Optional)

If you want to store recipe images in Supabase Storage:

1. Go to Storage in Supabase dashboard
2. Create a new bucket called `recipe-images`
3. Set it to public
4. Add policy:
```sql
-- Allow anyone to read images
CREATE POLICY "Recipe images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'recipe-images');

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload recipe images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'recipe-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to update their own images
CREATE POLICY "Users can update their recipe images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'recipe-images' 
    AND auth.role() = 'authenticated'
  );

-- Allow users to delete their own images
CREATE POLICY "Users can delete their recipe images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'recipe-images' 
    AND auth.role() = 'authenticated'
  );
```

## Environment Variables

Create a `.env` file in your project root:

```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project settings → API.
