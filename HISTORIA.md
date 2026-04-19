# Como o WIN STARK foi criado
### Histórico completo de construção — da ideia ao produto

> Documento gerado para uso didático na imersão WIN Business School.  
> Registra cada decisão, cada problema e cada solução tomada na construção do **WIN STARK Executive AI Cockpit**.

---

## Parte 1 — Narrativa: o making-of cronológico

### Capítulo 1 — O problema e a visão

Tudo começou com uma pergunta simples: **como um executivo que não sabe programar pode ter um assistente de IA personalizado, funcionando 24h, acessível no celular, sem depender de ninguém?**

A resposta foi o WIN STARK — um cockpit web que coloca o poder do Claude (IA da Anthropic) diretamente nas mãos de executivos, organizado em cinco diretorias especializadas:

| Diretoria | Função |
|---|---|
| **Agente Principal** | Assistente personalizado com a dor de negócio do CEO |
| **Agenda Executiva** | Organiza semana, prioridades e briefings |
| **Tarefas & Follow-up** | Transforma decisões em ações com dono e prazo |
| **Informação & Inteligência** | Filtra o excesso e entrega o que importa |
| **Reuniões & Decisões** | Prepara pauta, sintetiza e documenta |

---

### Capítulo 2 — A arquitetura decidida em minutos

Antes de escrever uma linha de código, três decisões de arquitetura foram tomadas:

**1. Stack mínimo e direto**
- Node.js + Express no backend (simples, sem frameworks pesados)
- SQLite como banco de dados (arquivo único, sem servidor de banco)
- HTML/CSS/JS puro no frontend (sem React, sem build tools — zero complexidade de deploy)
- Claude Sonnet 4.6 via API da Anthropic com SSE (streaming em tempo real)

**2. Deploy no Render**
- Plataforma escolhida pela simplicidade: push no GitHub → deploy automático
- Persistent Disk no Render para o SQLite sobreviver a redeploys (`/data/stark.db`)
- Variáveis de ambiente para segredos (chave da Anthropic, JWT secret)

**3. Autenticação própria**
- JWT com 7 dias de validade
- Dois perfis: `admin` (gerencia CEOs) e `user` (usa o cockpit)
- Validação do token contra o servidor a cada acesso à página principal

---

### Capítulo 3 — Construindo o backend

O servidor foi construído em camadas:

```
server.js              ← ponto de entrada, Express + middlewares
routes/
  auth.js              ← /api/auth/login, /api/auth/me
  admin.js             ← /api/admin/users (CRUD de CEOs)
  users.js             ← /api/users/ap (Agente Principal por usuário)
  chat.js              ← /api/chat/stream (SSE proxy para Claude)
db.js                  ← inicialização SQLite, criação das tabelas
public/                ← arquivos estáticos servidos pelo Express
```

A rota mais importante foi `/api/chat/stream`. Ela recebe o histórico de mensagens do frontend, monta o contexto (system prompt + mensagens), chama a API da Anthropic com `stream: true` e re-transmite os chunks para o browser via **Server-Sent Events**. Isso permite que a resposta apareça palavra por palavra, em tempo real — exatamente como o ChatGPT faz.

**Decisão crítica:** o Agente Principal de cada CEO fica salvo no banco de dados como um `system_prompt` personalizado. O CEO faz upload de um arquivo `skill.md` que descreve sua dor de negócio, e esse conteúdo vira o "cérebro" do agente dele.

---

### Capítulo 4 — As três páginas do cockpit

O produto tem exatamente três páginas HTML:

#### `login.html`
A porta de entrada. Formulário de e-mail + senha, autenticação via API, redirecionamento por perfil (`admin` vai para `/admin.html`, `user` vai para `/`).

#### `admin.html`
O painel do gestor da plataforma. Lista todos os CEOs cadastrados, permite criar novos usuários com senha gerada automaticamente, exibe estatísticas básicas. Só acessível a usuários com `role: admin`.

#### `index.html` — o cockpit
A página principal. Contém:
- Header com logo, abas das diretorias e avatar do usuário
- Sidebar com upload do `skill.md` e histórico de conversas
- Área de mensagens com streaming em tempo real
- Input flutuante com suporte a anexos (PDF, Word, Excel, PowerPoint, texto)

---

### Capítulo 5 — O sistema de design

Na segunda fase do projeto, o cockpit ganhou uma identidade visual própria. Um arquivo `design-system.css` foi criado com uma paleta **pastel executivo**:

```
Peach  #F4C8C0  →  Agenda Executiva
Sage   #CDDFB0  →  Tarefas & Follow-up  
Sky    #C8DCE8  →  Informação & Inteligência
Lilac  #E8D4E8  →  Reuniões & Decisões
Blue   #2B6CB0  →  Agente Principal (destaque)
```

O sistema tem dois temas — claro e escuro — alternados por um botão no header. A preferência fica salva no `localStorage` e é aplicada antes do body renderizar (evita o "flash" de tema errado).

**Fontes:**
- `DM Sans` — sans-serif moderno para todo o corpo
- `Instrument Serif` — serif editorial para os headings do cockpit

---

### Capítulo 6 — O redesign editorial

Com o design system aplicado, veio uma refatoração visual profunda da `index.html`. Inspirado em interfaces editoriais modernas, o cockpit ganhou:

- **Abas pill** com bolinhas coloridas por diretoria (sem ícones SVG pesados)
- **Tela de boas-vindas** com saudação em Instrument Serif: *"Olá, Tony. o que vamos resolver hoje?"*
- **Cards de sugestão** com header (dot + label + seta), texto e hover elevado
- **Input flutuante** com border-radius 16px, botão de envio arredondado
- **Bolhas de mensagem** com bordas arredondadas diferenciadas (usuário vs. assistente)
- **Agent bar removida** — informação desnecessária eliminada

---

### Capítulo 7 — Funcionalidades de UX progressivas

Após o redesign visual, várias melhorias de experiência foram adicionadas incrementalmente:

**Sidebar colapsável**
- Botão hamburguer no header
- Desktop: colapsa com animação, preferência salva no localStorage
- Mobile: flutua sobre o conteúdo com overlay semitransparente

**Header responsivo**
- Mobile: esconde "Win Stark" e badge "Business", exibe só o `W`
- Libera espaço para as abas das diretorias em telas pequenas

**Avatar de iniciais**
- Nome completo substituído por badge circular (Tony Stark → `TS`)
- Tooltip com nome completo ao passar o mouse

**Agente Principal em destaque**
- Primeiro na ordem das abas
- Tab com cor azul, font-weight 600 e glow na bolinha
- Área de conteúdo com gradiente azul suave quando ativo

**Footer institucional**
- Fixo no rodapé das 3 páginas
- © WIN Business School — WIN STARK PROJECT — Todos os direitos reservados
- Adapta para 2 linhas em mobile automaticamente

---

### Capítulo 8 — Problemas encontrados e soluções

| Problema | Causa | Solução |
|---|---|---|
| Flash de tema errado | CSS carregado depois do body | Script inline no `<head>` lê localStorage antes de renderizar |
| Artefato visual no iOS | `box-shadow` da sidebar vaza quando `translateX(-100%)` | Shadow zerada no estado oculto, aplicada só ao abrir |
| Toast criando artefato | `translateX(120%)` deixa elemento fora da tela com borda azul visível | Substituído por `opacity: 0` + `pointer-events: none` |
| Input `file` com artefato | `display:none` no iOS Safari renderiza elemento invisível | Substituído por `clip + opacity + position: absolute` |
| Sidebar shadow em mobile | `backdrop-filter` no overlay causava rendering fantasma | `backdrop-filter` removido do overlay |
| Texto do footer truncando | Font-size fixo em tela pequena | Media query com font-size menor + `line-height` para quebra em 2 linhas |
| Acentuação incorreta | Texto escrito sem UTF-8 no código | Script Python de revisão ortográfica completa em lote |

---

## Parte 2 — Referência técnica por camadas

### Camada 1 — Infraestrutura

```
Plataforma:    Render.com (Web Service + Persistent Disk)
Repositório:   GitHub (auto-deploy via push na branch main)
Banco:         SQLite em /data/stark.db (persistido no disco)
Runtime:       Node.js 18+
```

**Variáveis de ambiente necessárias no Render:**
```
ANTHROPIC_API_KEY   Chave da API Anthropic
JWT_SECRET          String aleatória para assinar tokens
DB_PATH             /data/stark.db
PORT                (automático no Render)
```

---

### Camada 2 — Backend (Node.js + Express)

**Endpoints:**

| Método | Rota | Função | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Autentica e retorna JWT | Pública |
| GET | `/api/auth/me` | Valida token e retorna usuário | JWT |
| GET | `/api/admin/users` | Lista todos os CEOs | Admin |
| POST | `/api/admin/users` | Cria novo CEO | Admin |
| DELETE | `/api/admin/users/:id` | Remove CEO | Admin |
| GET | `/api/users/ap` | Retorna Agente Principal do usuário | JWT |
| POST | `/api/users/ap` | Salva/atualiza Agente Principal | JWT |
| DELETE | `/api/users/ap` | Remove Agente Principal | JWT |
| POST | `/api/chat/stream` | Streaming SSE para Claude | JWT |

**Esquema do banco:**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user',        -- 'user' ou 'admin'
  agent_name TEXT,                 -- nome do Agente Principal
  agent_system TEXT,               -- system prompt do skill.md
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### Camada 3 — Frontend (HTML/CSS/JS puro)

**Estrutura de estado no browser:**
```javascript
localStorage:
  ws_token    JWT do usuário logado
  ws_user     JSON com dados do usuário
  ws_theme    'light' | 'dark'
  ws_sidebar  '1' (aberta) | '0' (fechada)

Memória (variáveis JS):
  currentAgent      ID do agente ativo
  conversations     { agentId: [{ id, firstMsg, messages[] }] }
  currentConvId     { agentId: convId }
  isStreaming       boolean (bloqueia envio durante resposta)
  apSystemPrompt    system prompt do Agente Principal
```

**Fluxo de uma mensagem:**
```
1. Usuário digita e pressiona Enter
2. JS valida (agente selecionado? AP configurado se necessário?)
3. Mensagem adicionada ao histórico local
4. Fetch POST /api/chat/stream com { messages, agentId, systemPrompt }
5. ReadableStream lido chunk por chunk (SSE)
6. Cada chunk de texto adicionado ao DOM em tempo real
7. Ao final: resposta salva no histórico local
```

---

### Camada 4 — Sistema de design (CSS Custom Properties)

```css
/* Variáveis principais */
--color-bg        Fundo da página
--color-card      Fundo de cards
--color-ink       Texto principal
--color-line      Bordas
--color-accent    Azul de ação (#2B6CB0)

/* Pastel por agente */
--color-peach     Agenda / AP         #F4C8C0
--color-sage      Tarefas             #CDDFB0
--color-sky       Inteligência        #C8DCE8
--color-lilac     Reuniões            #E8D4E8

/* Tipografia */
--font-sans       DM Sans
--font-serif      Instrument Serif (headings editoriais)
```

**Tema escuro:** ativado via `data-theme="dark"` no `<html>`, todas as variáveis sobrescritas. Script inline no `<head>` aplica o tema antes do primeiro render.

---

### Camada 5 — O Agente Principal (AP)

O AP é o diferencial da plataforma para cada CEO. Funciona assim:

1. CEO cria um arquivo `skill.md` descrevendo sua dor de negócio principal
2. Faz upload pelo cockpit (área de drag-and-drop na sidebar)
3. O conteúdo é enviado ao backend e salvo como `agent_system` no banco
4. A cada mensagem no chat do AP, esse texto vira o `system prompt` enviado ao Claude
5. O Claude responde com o contexto e a persona definidos pelo CEO

**Estrutura recomendada do skill.md:**
```markdown
# [Nome do Agente]

Você é [persona]. Sua missão é [objetivo].

## Contexto do negócio
[Descrição da empresa, mercado, desafios]

## Suas competências
- [competência 1]
- [competência 2]

## Tom e estilo
[Como deve se comunicar]
```

---

### Camada 6 — Segurança

- Senhas armazenadas com `bcrypt` (hash irreversível)
- JWT assinado com segredo do ambiente, expiração 7 dias
- Token validado no servidor a cada acesso (`/api/auth/me`)
- Rotas admin verificam `role === 'admin'` no middleware
- CORS configurado para aceitar apenas origens do domínio do Render
- Variáveis sensíveis nunca no código, sempre em variáveis de ambiente

---

## Linha do tempo resumida

```
Sessão 1  →  Plugin WIN STARK criado (5 skills das diretorias)
Sessão 2  →  Backend Node.js + Express + SQLite estruturado
Sessão 3  →  Rotas de auth, admin e usuários implementadas
Sessão 4  →  Frontend: login.html, admin.html, index.html
Sessão 5  →  Deploy no Render, Persistent Disk configurado
Sessão 6  →  Tag v1.0, zip do código, documentação técnica .docx
Sessão 7  →  Design system (paleta pastel, light/dark toggle)
Sessão 8  →  Redesign editorial (serif, pill tabs, suggestion cards)
Sessão 9  →  Sidebar colapsável, responsividade mobile
Sessão 10 →  Header compacto mobile, footer institucional 3 páginas
Sessão 11 →  AP primeiro + destaque azul, fundo azul na área AP
Sessão 12 →  Avatar iniciais, artefato iOS corrigido, footer mobile
Sessão 13 →  Revisão ortográfica completa, este documento
```

---

## Lições aprendidas

1. **Stack mínimo vence.** Node + SQLite + HTML puro deployou em minutos. Complexidade zero de infraestrutura.

2. **Design system primeiro.** Sem variáveis CSS desde o início, cada ajuste visual virou um problema. Com o sistema, trocar tema escuro/claro é uma linha.

3. **Mobile é cidadão de primeira classe.** Cada decisão de layout testada no iOS antes de considerar pronta.

4. **Streaming muda a percepção.** A mesma resposta com e sem SSE parece muito mais lenta sem streaming. Vale o esforço de implementar.

5. **O Agente Principal é o produto real.** As diretorias genéricas são úteis, mas o que faz o CEO voltar todo dia é o agente treinado com a dor específica do negócio dele.

6. **Itere em público.** Cada sessão terminou com um deploy real. O CEO testou no próprio celular e trouxe feedback real — não hipotético.

---

*WIN Business School · WIN STARK PROJECT*  
*Documento gerado como material didático — v1.0*
