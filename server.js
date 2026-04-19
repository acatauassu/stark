const express = require('express');
const path = require('path');
const cors = require('cors');

// Init DB before routes
require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));

// Proxy endpoint for Claude API (keeps API key server-side)
app.post('/api/claude', require('./middleware/auth').requireAuth, async (req, res) => {
  const { messages, systemPrompt, stream } = req.body;

  const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
  if (!CLAUDE_API_KEY) {
    return res.status(500).json({ error: 'API key não configurada no servidor' });
  }

  const body = {
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt || 'Você é um assistente executivo de alto nível.',
    messages: messages || [],
    stream: true
  };

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    // Stream SSE response to client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      res.write(chunk);
    }
    res.end();
  } catch (err) {
    console.error('[Claude Proxy]', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Erro ao conectar com Claude API' });
    }
  }
});

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Rota não encontrada' });
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[WIN STARK] Servidor rodando na porta ${PORT}`);
  console.log(`[WIN STARK] Acesse: http://localhost:${PORT}`);
});
