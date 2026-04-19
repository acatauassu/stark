const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../database');
const { requireAuth } = require('../middleware/auth');

// Multer — armazenar skill.md em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 512 * 1024 }, // 512KB max
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.md') || file.mimetype === 'text/markdown' || file.mimetype === 'text/plain') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos .md são aceitos'));
    }
  }
});

// POST /api/users/upload-ap — upload da skill.md do Agente Principal
router.post('/upload-ap', requireAuth, upload.single('skill'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }

  const content = req.file.buffer.toString('utf-8');

  // Extrair nome do agente do frontmatter ou primeira linha
  let agentName = 'Agente Principal';
  const nameMatch = content.match(/name:\s*["']?([^"'\n]+)["']?/i);
  if (nameMatch) agentName = nameMatch[1].trim();
  else {
    const firstLine = content.split('\n').find(l => l.startsWith('#'));
    if (firstLine) agentName = firstLine.replace(/^#+\s*/, '').trim().substring(0, 60);
  }

  db.prepare(`
    UPDATE users SET ap_system_prompt = ?, ap_skill_name = ? WHERE id = ?
  `).run(content, agentName, req.user.id);

  res.json({ message: 'Agente Principal ativado com sucesso', agentName });
});

// DELETE /api/users/ap — remover AP
router.delete('/ap', requireAuth, (req, res) => {
  db.prepare('UPDATE users SET ap_system_prompt = NULL, ap_skill_name = NULL WHERE id = ?').run(req.user.id);
  res.json({ message: 'Agente Principal removido' });
});

// GET /api/users/ap — obter system prompt do AP (para uso no cockpit)
router.get('/ap', requireAuth, (req, res) => {
  const user = db.prepare('SELECT ap_system_prompt, ap_skill_name FROM users WHERE id = ?').get(req.user.id);
  if (!user || !user.ap_system_prompt) {
    return res.status(404).json({ error: 'Agente Principal não configurado' });
  }
  res.json({ systemPrompt: user.ap_system_prompt, agentName: user.ap_skill_name });
});

module.exports = router;
