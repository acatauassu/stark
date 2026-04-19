# WIN STARK — Executive AI Cockpit v2.0

Plataforma multi-usuario com autenticacao JWT, painel admin e Agente Principal por CEO.

## Stack

- Node.js + Express
- SQLite (better-sqlite3)
- JWT Authentication
- Claude Sonnet 4.6 via proxy server-side

## Variaveis de ambiente (Render)

```
CLAUDE_API_KEY=sk-ant-api03-...
JWT_SECRET=sua-chave-secreta-aqui
ADMIN_EMAIL=admin@winstark.com.br
ADMIN_PASSWORD=SuaSenhaAdmin123!
```

## Deploy no Render

1. Crie um Web Service (nao Static Site)
2. Build Command: npm install
3. Start Command: node server.js
4. Configure as variaveis de ambiente acima

---

WIN STARK Business -- We Inspire Next
