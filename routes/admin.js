const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../database');
const { requireAdmin } = require('../middleware/auth');

// Gerar senha aleatória legível
function generatePassword() {
  const words = ['Stark', 'Win', 'Nexus', 'Iron', 'Jarvis', 'Core', 'Apex', 'Prime'];
  const nums = Math.floor(100 + Math.random() * 900);
  const symbols = ['@', '#', '!'];
  const word = words[Math.floor(Math.random() * words.length)];
  const sym = symbols[Math.floor(Math.random() * symbols.length)];
  return `${word}${nums}${sym}`;
}

// GET /api/admin/users — lista todos os CEOs
router.get('/users', requireAdmin, (req, res) => {
  const users = db.prepare(`
    SELECT id, email, name, role, ap_skill_name, created_at,
      CASE WHEN ap_system_prompt IS NOT NULL THEN 1 ELSE 0 END as has_ap
    FROM users
    WHERE role = 'ceo'
    ORDER BY created_at DESC
  `).all();
  res.json(users);
});

// POST /api/admin/users — cadastrar novo CEO
router.post('/users', requireAdmin, (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email e nome são obrigatórios' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Email já cadastrado' });
  }

  // Verificar limite de 10 CEOs por turma (total de CEOs)
  const count = db.prepare("SELECT COUNT(*) as cnt FROM users WHERE role = 'ceo'").get();
  if (count.cnt >= 10) {
    return res.status(400).json({ error: 'Limite de 10 CEOs por turma atingido' });
  }

  const password = generatePassword();
  const hash = bcrypt.hashSync(password, 10);

  const result = db.prepare(`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (?, ?, ?, 'ceo')
  `).run(email.trim().toLowerCase(), hash, name.trim());

  res.status(201).json({
    id: result.lastInsertRowid,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    password // mostrado apenas uma vez
  });
});

// DELETE /api/admin/users/:id — remover CEO
router.delete('/users/:id', requireAdmin, (req, res) => {
  const user = db.prepare("SELECT id, role FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  if (user.role === 'admin') return res.status(403).json({ error: 'Não é possível remover o admin' });

  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'CEO removido com sucesso' });
});

// POST /api/admin/users/:id/reset-password — resetar senha
router.post('/users/:id/reset-password', requireAdmin, (req, res) => {
  const user = db.prepare("SELECT id, role FROM users WHERE id = ?").get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  if (user.role === 'admin') return res.status(403).json({ error: 'Use /auth/change-password para o admin' });

  const password = generatePassword();
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.params.id);
  res.json({ password });
});

module.exports = router;
