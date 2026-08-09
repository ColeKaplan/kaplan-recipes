require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3001;

const supabase = createClient(
  process.env.SUPABASE_URL || 'http://localhost:8001',
  process.env.SUPABASE_ANON_KEY || ''
);

app.use(express.json({ limit: '10mb' }));
const upload = multer({ storage: multer.memoryStorage() });

// ═══════════════════════════════════════════════════════════════════════════
// RECIPES
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/recipes — popular feed or search
app.get('/api/recipes', async (req, res) => {
  try {
    const { popular, q, mealType, page = '0', pageSize = '20' } = req.query;
    const pageNum = parseInt(page, 10);
    const size = parseInt(pageSize, 10);

    if (popular === 'true') {
      const from = (pageNum - 1) * size;
      const to = from + size - 1;
      const { data, error } = await supabase
        .from('recipes')
        .select('id, title, image_url, ready_in_minutes, servings, meal_type, aggregate_rating, rating_count')
        .order('aggregate_rating', { ascending: false })
        .range(from, to);
      if (error) throw error;
      return res.json(data || []);
    }

    let query = supabase
      .from('recipes')
      .select('id, title, image_url, ready_in_minutes, servings, meal_type, aggregate_rating, rating_count')
      .order('created_at', { ascending: false });

    if (q && q.trim() !== '') query = query.ilike('title', `%${q}%`);
    if (mealType && mealType.trim() !== '') query = query.eq('meal_type', mealType);

    const from = pageNum * size;
    const to = from + size - 1;
    const { data, error } = await query.range(from, to);
    if (error) throw error;
    return res.json(data || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/recipes/:id — single recipe with ingredients + instructions
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [recipeRes, ingredientsRes, instructionsRes] = await Promise.all([
      supabase.from('recipes').select('*').eq('id', id).single(),
      supabase.from('ingredients').select('*').eq('recipe_id', id).order('order_index', { ascending: true }),
      supabase.from('instructions').select('*').eq('recipe_id', id).order('step_number', { ascending: true }),
    ]);
    if (recipeRes.error) throw recipeRes.error;
    if (!recipeRes.data) return res.status(404).json({ error: 'Recipe not found' });
    if (ingredientsRes.error) throw ingredientsRes.error;
    if (instructionsRes.error) throw instructionsRes.error;
    return res.json({
      recipe: recipeRes.data,
      ingredients: ingredientsRes.data || [],
      instructions: instructionsRes.data || [],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/recipes — create recipe + ingredients + instructions
app.post('/api/recipes', async (req, res) => {
  try {
    const { recipeData, ingredients, instructions, userId } = req.body;
    const { data: recipe, error: recipeErr } = await supabase
      .from('recipes')
      .insert({ ...recipeData, user_id: userId || null })
      .select()
      .single();
    if (recipeErr) throw recipeErr;
    if (!recipe) throw new Error('Failed to create recipe');

    if (ingredients && ingredients.length > 0) {
      const { error } = await supabase.from('ingredients').insert(
        ingredients.map((ing, i) => ({ ...ing, recipe_id: recipe.id, order_index: i }))
      );
      if (error) {
        await supabase.from('recipes').delete().eq('id', recipe.id);
        throw error;
      }
    }
    if (instructions && instructions.length > 0) {
      const { error } = await supabase.from('instructions').insert(
        instructions.map((inst) => ({ ...inst, recipe_id: recipe.id }))
      );
      if (error) {
        await supabase.from('ingredients').delete().eq('recipe_id', recipe.id);
        await supabase.from('recipes').delete().eq('id', recipe.id);
        throw error;
      }
    }
    return res.status(201).json({ id: recipe.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/recipes/:id — full update (recipe + replace ingredients/instructions)
app.put('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { recipeData, ingredients, instructions } = req.body;

    const { data: recipe, error: recipeErr } = await supabase
      .from('recipes').update(recipeData).eq('id', id).select().single();
    if (recipeErr) throw recipeErr;
    if (!recipe) throw new Error('Failed to update recipe');

    await Promise.all([
      supabase.from('ingredients').delete().eq('recipe_id', id),
      supabase.from('instructions').delete().eq('recipe_id', id),
    ]);

    if (ingredients && ingredients.length > 0) {
      const { error } = await supabase.from('ingredients').insert(
        ingredients.map((ing, i) => ({ ...ing, recipe_id: id, order_index: i }))
      );
      if (error) throw error;
    }
    if (instructions && instructions.length > 0) {
      const { error } = await supabase.from('instructions').insert(
        instructions.map((inst) => ({ ...inst, recipe_id: id }))
      );
      if (error) throw error;
    }
    return res.json({ id: recipe.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PATCH /api/recipes/:id — partial update (e.g. rating)
app.patch('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: recipe, error } = await supabase
      .from('recipes').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    return res.json({ id: recipe.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/recipes/:id — delete with cascading cleanup
app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: recipe } = await supabase
      .from('recipes').select('images, image_url').eq('id', id).single();

    await Promise.all([
      supabase.from('ingredients').delete().eq('recipe_id', id),
      supabase.from('instructions').delete().eq('recipe_id', id),
      supabase.from('recipe_comments').delete().eq('recipe_id', id),
    ]);
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (error) throw error;

    // Clean up storage images
    const urls = [];
    if (recipe?.images && Array.isArray(recipe.images)) urls.push(...recipe.images);
    if (recipe?.image_url && !urls.includes(recipe.image_url)) urls.push(recipe.image_url);
    if (urls.length > 0) {
      const paths = urls.map(extractFilePath).filter(Boolean);
      if (paths.length > 0) await supabase.storage.from('recipe-images').remove(paths);
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// COMMENTS
// ═══════════════════════════════════════════════════════════════════════════

app.get('/api/comments', async (req, res) => {
  try {
    const { recipeId } = req.query;
    if (!recipeId) return res.status(400).json({ error: 'recipeId required' });
    const { data, error } = await supabase
      .from('recipe_comments').select('*').eq('recipe_id', recipeId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return res.json(data || []);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/comments', async (req, res) => {
  try {
    const { recipe_id, comment_text, author_name, parent_comment_id } = req.body;
    if (!recipe_id || !comment_text) return res.status(400).json({ error: 'recipe_id and comment_text required' });
    const { error } = await supabase.from('recipe_comments').insert({
      recipe_id, comment_text, author_name: author_name || null, parent_comment_id: parent_comment_id || null,
    });
    if (error) throw error;
    return res.status(201).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/comments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await supabase.from('recipe_comments').delete().eq('parent_comment_id', id);
    const { error } = await supabase.from('recipe_comments').delete().eq('id', id);
    if (error) throw error;
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// IMAGES
// ═══════════════════════════════════════════════════════════════════════════

function extractFilePath(url) {
  try {
    const parts = new URL(url).pathname.split('/');
    const idx = parts.indexOf('public');
    if (idx === -1 || idx >= parts.length - 2) return null;
    return parts.slice(idx + 2).join('/');
  } catch { return null; }
}

app.post('/api/images/upload', upload.array('images'), async (req, res) => {
  try {
    const files = req.files;
    if (!files || files.length === 0) return res.status(400).json({ error: 'No files' });
    const urls = [];
    for (const file of files) {
      const ext = file.originalname.split('.').pop();
      const name = `${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('recipe-images').upload(name, file.buffer, { contentType: file.mimetype });
      if (error) { console.error('Upload error:', error); continue; }
      const { data: { publicUrl } } = supabase.storage.from('recipe-images').getPublicUrl(name);
      urls.push(publicUrl);
    }
    return res.json({ urls });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/images/delete', async (req, res) => {
  try {
    const { urls } = req.body;
    if (!urls || urls.length === 0) return res.json({ deleted: 0 });
    const paths = urls.map(extractFilePath).filter(Boolean);
    if (paths.length === 0) return res.json({ deleted: 0 });
    const { error } = await supabase.storage.from('recipe-images').remove(paths);
    if (error) throw error;
    return res.json({ deleted: paths.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ error: error.message });
    return res.json({
      user: { id: data.user?.id, email: data.user?.email },
      access_token: data.session?.access_token,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/user', async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.json({ user: null });
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.json({ user: null });
    return res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// STATIC FILES + CATCH-ALL
// ═══════════════════════════════════════════════════════════════════════════

app.use(express.static(path.join(__dirname, 'build')));
app.get('/{*splat}', (_req, res) => res.sendFile(path.join(__dirname, 'build', 'index.html')));

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
});
