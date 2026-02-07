# Setup Guide

## Prerequisites

1. Node.js installed on your computer
2. A Supabase account (free tier works fine)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once your project is created, go to **Settings** → **API**
3. Copy your **Project URL** and **anon/public key**

## Step 3: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Open the `SUPABASE_SETUP.md` file in this project
3. Copy and run all the SQL commands in order:
   - Enable UUID extension
   - Create recipes table
   - Create ingredients table
   - Create instructions table
   - Create triggers
   - Set up Row Level Security (RLS) policies

## Step 4: Configure Environment Variables

Create a `.env` file in the root of your project:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

Replace the values with your actual Supabase credentials from Step 2.

## Step 5: Start the Development Server

```bash
npm start
```

The application will open in your browser at `http://localhost:3000`

## Features

- ✅ View all recipes
- ✅ Search recipes by keyword
- ✅ Filter recipes by meal type
- ✅ View recipe details
- ✅ Create new recipes
- ✅ All data stored in Supabase

## Creating Your First Recipe

1. Click "Create Recipe" in the navigation bar
2. Fill in the recipe details:
   - Title (required)
   - Summary (optional)
   - Ready in minutes (required)
   - Servings (required)
   - Meal type (optional)
   - Image URL (optional)
   - Ingredients (add as many as needed)
   - Instructions (add steps as needed)
3. Click "Create Recipe"
4. You'll be redirected to view your new recipe!

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure you've created a `.env` file in the root directory
- Check that the variable names start with `REACT_APP_`
- Restart your development server after creating/updating `.env`

### Database connection errors
- Verify your Supabase URL and anon key are correct
- Make sure you've run all the SQL setup commands
- Check that Row Level Security policies are set up correctly

### Recipe creation fails
- Check the browser console for detailed error messages
- Verify your Supabase RLS policies allow inserts
- Make sure you're authenticated (if using auth)
