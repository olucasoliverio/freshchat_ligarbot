import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// ─── Config ─────────────────────────────────────────────────────────────────
const DOMAIN       = process.env.FRESHCHAT_DOMAIN;
const API_KEY      = process.env.FRESHCHAT_API_KEY;
const APP_SECRET   = process.env.APP_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;
// ─────────────────────────────────────────────────────────────────────────────

// CORS — só aceita requisições do frontend autorizado
app.use(cors({
  origin: FRONTEND_URL,
  methods: ["GET", "POST"],
}));

// ─── Status especiais ────────────────────────────────────────────────────────
const COFFEE_STATUS_ID = "4d37887b-e220-4533-9e69-a024dd81cfdb";

// ─── Agentes ─────────────────────────────────────────────────────────────────
const AGENTS = [
  // ── Ghosters ────────────────────────────────────────────────────────────────
  { team:"Ghosters"   ,name:"Caetano Córdova da Silva"    ,id:"f37470fa-3467-43a2-8ee1-461bfe86eb38", email:"caetano.cordova@nextfit.com.br" },
  { team:"Ghosters"   ,name:"Camilli Salvaro"             ,id:"c1848870-d518-48a1-ba42-aff26f23c3ba", email:"camilli.salvaro@nextfit.com.br" },
  { team:"Ghosters"   ,name:"Ezequiel Marcon"             ,id:"14f5eeb8-b8a9-4448-8878-43cd4dc34ead", email:"ezequiel.marcon@nextfit.com.br" },
  { team:"Ghosters"   ,name:"João Vitor Campos Policarpi" ,id:"24fadb48-536c-461d-b4d3-07061fbdd000", email:"joaovitor.policarpi@nextfit.com.br" },
  { team:"Ghosters"   ,name:"José Giassi"                 ,id:"ea53e545-c7d1-41e5-9ff0-aee9cf4b1abd", email:"joseluiz.giassi@nextfit.com.br" },
  { team:"Ghosters"   ,name:"Julia Graziela"              ,id:"e6a020b8-1496-4330-ba91-0b9d1657bc1f", email:"julia.graziela@nextfit.com.br" },
  { team:"Ghosters"   ,name:"Kauã Lucas"                  ,id:"ea48f912-ad7b-4721-b893-007971b441e6", email:"kaua.alves@nextfit.com.br" },
  { team:"Ghosters"   ,name:"Larissa Inacio"              ,id:"0681d394-26b8-432e-a7ea-d31fb5c7f943", email:"larissa.inacio@nextfit.com.br" },
  { team:"Ghosters"   ,name:"Mariani Oliveira Fernandes"  ,id:"a5118cef-0248-4c7e-af3e-614e5ae431cf", email:"mariani.oliveira@nextfit.com.br" },
  { team:"Ghosters"   ,name:"Vicenzo Souza Dias"          ,id:"307707f3-2cfa-44b1-b90f-a9916b5b80d1", email:"vicenzo.dias@nextfit.com.br" },
  { team:"Ghosters"   ,name:"Washington Pereira"          ,id:"d9030177-a4ee-40f6-83da-0fb45eb1b49c", email:"washington.pereira@nextfit.com.br" },

  // ── Furia ───────────────────────────────────────────────────────────────────
  { team:"Furia"      ,name:"Alessandro Tramontin Frigo"  ,id:"6a053407-0a0e-4e3f-a627-d5afb5dcc124", email:"alessandro.frigo@nextfit.com.br" },
  { team:"Furia"      ,name:"Augusto Zanette Vitali"      ,id:"57820fce-cb8c-48f3-973c-796ba072ef3c", email:"augusto.zanette@nextfit.com.br" },
  { team:"Furia"      ,name:"Camily Zanette Albano"       ,id:"519b1cc1-4980-4820-b707-83860085a35e", email:"camily.zanette@nextfit.com.br" },
  { team:"Furia"      ,name:"Cecília Rufino"              ,id:"f70372b8-3c2b-440e-a1e0-dbcd3b3665f0", email:"cecilia.rufino@nextfit.com.br" },
  { team:"Furia"      ,name:"Gustavo Belegante"           ,id:"96e8c7ca-f528-40d2-9a69-18386a99a9f6", email:"gustavo.belegante@nextfit.com.br" },
  { team:"Furia"      ,name:"Kahoan Orben"                ,id:"c6bd2f7d-06b7-4d66-9043-d64539c46854", email:"kahoan.orben@nextfit.com.br" },
  { team:"Furia"      ,name:"Letícia Silva"               ,id:"c2a6e5d2-0300-4866-96dd-cffd96bfe9f2", email:"leticia.silva@nextfit.com.br" },
  { team:"Furia"      ,name:"Maria Julia Talamini"        ,id:"a31feb18-f3df-41f3-b4a0-a7d3b04858a5", email:"mariajulia.talamini@nextfit.com.br" },
  { team:"Furia"      ,name:"Mauricio Soares de Lima"     ,id:"011450ed-dc6d-41cd-ad08-1af4cfa6be83", email:"mauricio.lima@nextfit.com.br" },
  { team:"Furia"      ,name:"Pedro De Farias Alexandre"   ,id:"1c6ab29c-c45f-4bd3-8eb1-c998a8986cff", email:"pedro.alexandre@nextfit.com.br" },
  { team:"Furia"      ,name:"Weslley Domingos"            ,id:"5f96d490-7da2-4c34-8164-e8e3eab03484", email:"weslley.domingos@nextfit.com.br" },

  // ── Equipamentos ────────────────────────────────────────────────────────────
  { team:"Equipamentos" ,name:"Arthur Rabello"              ,id:"f91bf427-38c5-4b61-bf4c-0f60850548b0", email:"arthur.rabello@nextfit.com.br" },
  { team:"Equipamentos" ,name:"Eduardo Santana"             ,id:"3c80faf5-5913-455d-be8a-6ba4f5212145", email:"eduardo.santana@nextfit.com.br" },
  { team:"Equipamentos" ,name:"Filipe Vonsnievski"          ,id:"a9cec6ff-2999-4878-b50c-dc7d2d747043", email:"filipe.vonsnievski@nextfit.com.br" },
  { team:"Equipamentos" ,name:"Gabriel Adão"                ,id:"3745a936-f1e2-43ad-bd7f-502a8c767ca7", email:"gabriel.adao@nextfit.com.br" },
  { team:"Equipamentos" ,name:"Gabriel Caetano"             ,id:"88cf1d19-33b8-4e03-8647-df3ff7f7de0e", email:"gabriel.caetano@nextfit.com.br" },
  { team:"Equipamentos" ,name:"Luan Limas"                  ,id:"203ec215-c157-4293-9c20-4cef6915f71c", email:"luan.limas@nextfit.com.br" },
  { team:"Equipamentos" ,name:"Pedro Henrique Honorato"     ,id:"93c4c71e-900a-414f-b005-b16d4a83bc22", email:"pedro.honorato@nextfit.com.br" },
  { team:"Equipamentos" ,name:"Rafael Bauer"                ,id:"8adfd0ef-63cf-4c05-b82b-e5ae9354a8ee", email:"rafael.bauer@nextfit.com.br" },
  { team:"Equipamentos" ,name:"Roniel Serafim"              ,id:"93dfd3fc-6b49-4d2f-a4d7-2774083fe41d", email:"roniel.serafim@nextfit.com.br" },
  { team:"Equipamentos" ,name:"Saymon Espindola"            ,id:"b8cddd8d-5444-4871-9891-3ed0ca0e607e", email:"saymon.espindola@nextfit.com.br" },
  { team:"Equipamentos" ,name:"Vitor Ribeiro"               ,id:"0ce4d422-a417-4ce4-924c-b3e5db6fab6f", email:"vitor.ribeiro@nextfit.com.br" },

  // ── Onboarding ──────────────────────────────────────────────────────────────
  { team:"Onboarding" ,name:"Gabriel Dutra"               ,id:"a777b953-37a7-4f24-8fe0-931a03ea9128", email:"gabriel.dutra@nextfit.com.br" },
  { team:"Onboarding" ,name:"Gabriel Silva"               ,id:"358a0c40-92ef-4356-8ab0-cf115d25074c", email:"gabriel.silva@nextfit.com.br" },
  { team:"Onboarding" ,name:"Gabriel Vieira"              ,id:"fc104b8a-f8ec-4332-9af2-325bf761b5c2", email:"gabriel.vieira@nextfit.com.br" },
  { team:"Onboarding" ,name:"Ingridy Morona"              ,id:"ead675d6-711a-4758-9345-d3b078149c8c", email:"ingridy.morona@nextfit.com.br" },
  { team:"Onboarding" ,name:"Kauã Frassetto"              ,id:"01da2031-767a-4ca2-9050-d950e95917e0", email:"kaua.frassetto@nextfit.com.br" },
  { team:"Onboarding" ,name:"Lorraini Vieira"             ,id:"79751dc3-0bda-4148-afde-5ad5d0c7ed89", email:"lorraini.vieira@nextfit.com.br" },
  { team:"Onboarding" ,name:"Luan Cardoso"                ,id:"6c009fe8-fbf9-44e6-9767-dd2e982c4b44", email:"luan.cardoso@nextfit.com.br" },
];

const ALLOWED_IDS = new Set(AGENTS.map(a => a.id));

// ─── Rate limiting simples em memória ────────────────────────────────────────
const rateLimitMap = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX       = 10;

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

app.get("/agents", requireSecret, (req, res) => {
  if (isRateLimited(req.ip)) return res.status(429).json({ error: "Muitas requisições." });
  res.json(AGENTS.map(({ id, name, team, email }) => ({ id, name, team, email })));
});

app.post("/set-available", requireSecret, async (req, res) => {
  if (isRateLimited(req.ip)) return res.status(429).json({ error: "Muitas requisições." });

  const { agent_ids } = req.body;

  if (!Array.isArray(agent_ids) || agent_ids.length === 0) {
    return res.status(400).json({ error: "agent_ids deve ser um array não vazio." });
  }

  const invalid = agent_ids.filter(id => !ALLOWED_IDS.has(id));
  if (invalid.length > 0) {
    return res.status(400).json({ error: "IDs não autorizados.", ids: invalid });
  }

  const results = await Promise.all(
    agent_ids.map(async (id) => {
      const baseUrl = `https://${DOMAIN}.freshchat.com/v2/agents/${id}`;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      };

      try {
        // 1. Checa status atual do agente — se falhar, NÃO prossegue
        const getRes = await fetch(baseUrl, { headers });
        if (!getRes.ok) {
          return { agent_id: id, status: "error", message: `GET falhou: ${getRes.status}`, http_status: getRes.status };
        }

        const agentData = await getRes.json();
        const currentStatusId = agentData?.agent_status?.id;

        if (currentStatusId === COFFEE_STATUS_ID) {
          return { agent_id: id, status: "coffee" };
        }

        // 2. Não está no café — seta como disponível
        const patchRes = await fetch(baseUrl, {
          method: "PATCH",
          headers,
          body: JSON.stringify({ availability_status: "AVAILABLE" }),
        });

        return {
          agent_id: id,
          status: patchRes.ok ? "ok" : patchRes.status === 409 ? "offline" : "error",
          http_status: patchRes.status,
        };

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
});