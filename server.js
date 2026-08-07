const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';

// Reverse proxy: forward /supabase/* → local Supabase instance
// The browser's Supabase client sends requests here instead of directly
// to localhost:54321 (which is only reachable from within the Pi).
app.use('/supabase', createProxyMiddleware({
  target: SUPABASE_URL,
  changeOrigin: true,
  pathRewrite: { '^/supabase': '' },
}));

// Serve the React production build
app.use(express.static(path.join(__dirname, 'build')));

// Catch-all: serve index.html for client-side routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
  console.log(`[server] Proxying /supabase → ${SUPABASE_URL}`);
});
