import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// ─── Config ─────────────────────────────────────────────────────────────────
const DOMAIN       = process.env.FRESHCHAT_DOMAIN 
const API_KEY      = process.env.FRESHCHAT_API_KEY
const APP_SECRET   = process.env.APP_SECRET
const FRONTEND_URL = process.env.FRONTEND_URL
// ─────────────────────────────────────────────────────────────────────────────

// CORS — só aceita requisições do frontend autorizado
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST"],
}));

// ─── Agentes ──────────────────────────────
const AGENTS = [
  // ── Ghosters ────────────────────────────────────────────────────────────────
  { team:"Ghosters",   name:"Ezequiel Marcon",             id:"14f5eeb8-b8a9-4448-8878-43cd4dc34ead", email:"ezequiel.marcon@nextfit.com.br"      },
  { team:"Ghosters",   name:"João Vitor Campos Policarpi", id:"24fadb48-536c-461d-b4d3-07061fbdd000", email:"joaovitor.policarpi@nextfit.com.br"   },
  { team:"Ghosters",   name:"José Giassi",                 id:"ea53e545-c7d1-41e5-9ff0-aee9cf4b1abd", email:"joseluiz.giassi@nextfit.com.br"       },
  { team:"Ghosters",   name:"Julia Graziela",              id:"e6a020b8-1496-4330-ba91-0b9d1657bc1f", email:"julia.graziela@nextfit.com.br"        },
  { team:"Ghosters",   name:"Larissa Inacio",              id:"0681d394-26b8-432e-a7ea-d31fb5c7f943", email:"larissa.inacio@nextfit.com.br"        },
  { team:"Ghosters",   name:"Lucas Oliverio",              id:"6a621815-43a4-4770-acdf-f9fc36aadcfc", email:"lucas.oliverio@nextfit.com.br"        },
  { team:"Ghosters",   name:"Mariani Oliveira Fernandes",  id:"a5118cef-0248-4c7e-af3e-614e5ae431cf", email:"mariani.oliveira@nextfit.com.br"      },
  { team:"Ghosters",   name:"Vicenzo Souza Dias",          id:"307707f3-2cfa-44b1-b90f-a9916b5b80d1", email:"vicenzo.dias@nextfit.com.br"          },
  { team:"Ghosters",   name:"Washington Pereira",          id:"d9030177-a4ee-40f6-83da-0fb45eb1b49c", email:"washington.pereira@nextfit.com.br"    },

  // ── Furia ────────────────────────────────────────────────────────────────────
  { team:"Furia",      name:"Augusto Zanette Vitali",      id:"57820fce-cb8c-48f3-973c-796ba072ef3c", email:"augusto.zanette@nextfit.com.br"       },
  { team:"Furia",      name:"Camily Zanette Albano",       id:"519b1cc1-4980-4820-b707-83860085a35e", email:"camily.zanette@nextfit.com.br"        },
  { team:"Furia",      name:"Cecília Rufino",              id:"f70372b8-3c2b-440e-a1e0-dbcd3b3665f0", email:"cecilia.rufino@nextfit.com.br"        },
  { team:"Furia",      name:"Gustavo Belegante",           id:"96e8c7ca-f528-40d2-9a69-18386a99a9f6", email:"gustavo.belegante@nextfit.com.br"     },
  { team:"Furia",      name:"Kahoan Orben",                id:"c6bd2f7d-06b7-4d66-9043-d64539c46854", email:"kahoan.orben@nextfit.com.br"          },
  { team:"Furia",      name:"Letícia Silva",               id:"c2a6e5d2-0300-4866-96dd-cffd96bfe9f2", email:"leticia.silva@nextfit.com.br"         },
  { team:"Furia",      name:"Maria Julia Talamini",        id:"a31feb18-f3df-41f3-b4a0-a7d3b04858a5", email:"mariajulia.talamini@nextfit.com.br"   },
  { team:"Furia",      name:"Weslley Domingos",            id:"5f96d490-7da2-4c34-8164-e8e3eab03484", email:"weslley.domingos@nextfit.com.br"      },

  // ── Onboarding ───────────────────────────────────────────────────────────────
  { team:"Onboarding", name:"Gabriel Dutra",               id:"a777b953-37a7-4f24-8fe0-931a03ea9128", email:"gabriel.dutra@nextfit.com.br"         },
  { team:"Onboarding", name:"Gabriel Silva",               id:"358a0c40-92ef-4356-8ab0-cf115d25074c", email:"gabriel.silva@nextfit.com.br"         },
  { team:"Onboarding", name:"Gabriel Vieira",              id:"fc104b8a-f8ec-4332-9af2-325bf761b5c2", email:"gabriel.vieira@nextfit.com.br"        },
  { team:"Onboarding", name:"Ingridy Morona",              id:"ead675d6-711a-4758-9345-d3b078149c8c", email:"ingridy.morona@nextfit.com.br"        },
  { team:"Onboarding", name:"Kauã Frassetto",              id:"01da2031-767a-4ca2-9050-d950e95917e0", email:"kaua.frassetto@nextfit.com.br"        },
  { team:"Onboarding", name:"Lorraini Vieira",             id:"79751dc3-0bda-4148-afde-5ad5d0c7ed89", email:"lorraini.vieira@nextfit.com.br"       },
  { team:"Onboarding", name:"Luan Cardoso",                id:"6c009fe8-fbf9-44e6-9767-dd2e982c4b44", email:"luan.cardoso@nextfit.com.br"          },
];

const ALLOWED_IDS = new Set(AGENTS.map(a => a.id));

// ─── Rate limiting simples em memória ────────────────────────────────────────
const rateLimitMap = new Map();
const RATE_WINDOW_MS = 60_000; // 1 minuto
const RATE_MAX       = 10;     // máx 10 chamadas por IP por minuto

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };
  if (now - entry.start > RATE_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }
  if (entry.count >= RATE_MAX) return true;
  entry.count++;
  rateLimitMap.set(ip, entry);
  return false;
}

// ─── Middleware de autenticação ───────────────────────────────────────────────
function requireSecret(req, res, next) {
  const token = req.headers["x-app-secret"];
  if (!token || token !== APP_SECRET) {
    return res.status(401).json({ error: "Não autorizado." });
  }
  next();
}

// ─── Rotas ───────────────────────────────────────────────────────────────────

// Lista de agentes — o front não tem mais nada hardcoded
app.get("/agents", requireSecret, (req, res) => {
  if (isRateLimited(req.ip)) return res.status(429).json({ error: "Muitas requisições." });
  res.json(AGENTS.map(({ id, name, team, email }) => ({ id, name, team, email })));
});

// Executa os PATCHs
app.post("/set-available", requireSecret, async (req, res) => {
  if (isRateLimited(req.ip)) return res.status(429).json({ error: "Muitas requisições." });

  const { agent_ids } = req.body;

  if (!Array.isArray(agent_ids) || agent_ids.length === 0) {
    return res.status(400).json({ error: "agent_ids deve ser um array não vazio." });
  }

  // Rejeita IDs que não estejam na lista autorizada
  const invalid = agent_ids.filter(id => !ALLOWED_IDS.has(id));
  if (invalid.length > 0) {
    return res.status(400).json({ error: "IDs não autorizados.", ids: invalid });
  }

  const results = await Promise.all(
    agent_ids.map(async (id) => {
      const url = `https://${DOMAIN}.freshchat.com/v2/agents/${id}`;
      try {
        const response = await fetch(url, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({ availability_status: "AVAILABLE" }),
        });
        return { agent_id: id, status: response.ok ? "ok" : response.status === 409 ? "offline" : "error", http_status: response.status };
      } catch (err) {
        return { agent_id: id, status: "network_error", message: err.message };
      }
    })
  );

  return res.json({ results });
});

// Health check público
app.get("/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`   Domínio Freshchat : ${DOMAIN}.freshchat.com`);
  console.log(`   Frontend permitido: ${FRONTEND_URL}`);
  console.log(`   APP_SECRET        : ${APP_SECRET === "troque-essa-senha-antes-de-subir" ? "⚠️  PADRÃO — troque antes de subir!" : "✓ configurado"}`);
});