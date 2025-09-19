import express from "express";
import fetch from "node-fetch";

const app = express();

// Generic proxy: streamable-http → SSE
async function streamAsSSE(upstreamUrl, headers, req, res) {
  try {
    const upstream = await fetch(upstreamUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(req.body),
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    for await (const chunk of upstream.body) {
      res.write(`data: ${chunk.toString()}\n\n`);
    }
  } catch (err) {
    console.error("❌ Upstream stream error:", err);
    res.status(500).end("Proxy error");
  }
  res.end();
}

// MCP mappings (all Tavily-style formatting)
const MCP_MAP = {
  // Tavily
  tavily: {
    url: "https://mcp.composio.dev/composio/server/5c493b35-c5ed-4516-bc3d-dcf5c6c1d365/mcp?include_composio_helper_actions=true",
    headers: { Authorization: "Bearer " + process.env.COMPOSIO_API_KEY },
  },

  // Outlook
  outlook_nionium: {
    url: "https://mcp.composio.dev/composio/server/8eba4ad2-face-473d-849e-d7a30aeb3f52/mcp?include_composio_helper_actions=true",
    headers: { Authorization: "Bearer " + process.env.COMPOSIO_API_KEY },
  },

  // Exa
  exa: {
    url: "https://mcp.composio.dev/composio/server/f2182eeb-06ff-4123-9550-878752e49df3/mcp?include_composio_helper_actions=true",
    headers: { Authorization: "Bearer " + process.env.COMPOSIO_API_KEY },
  },

  // Textrazor
  textrazor: {
    url: "https://mcp.composio.dev/composio/server/3baadeef-66ad-4286-93df-be5f9b134550/mcp?useComposioHelperActions=true",
    headers: { Authorization: "Bearer " + process.env.COMPOSIO_API_KEY },
  },

  // Linkup
  linkup: {
    url: "https://mcp.composio.dev/composio/server/728b6270-d889-4aad-9d4a-b68ecd6d7842/mcp?useComposioHelperActions=true",
    headers: { Authorization: "Bearer " + process.env.COMPOSIO_API_KEY },
  },

  // Perplexity
  perplexity: {
    url: "https://mcp.composio.dev/composio/server/b5cb139e-12ce-4912-9372-804335cf90f4/mcp?useComposioHelperActions=true",
    headers: { Authorization: "Bearer " + process.env.COMPOSIO_API_KEY },
  },

  // Notion
  notion: {
    url: "https://mcp.composio.dev/composio/server/a0521852-631a-442b-8991-e216fb059707/mcp?include_composio_helper_actions=true",
    headers: { Authorization: "Bearer " + process.env.COMPOSIO_API_KEY },
  },

  // YouTube (Smithery)
  youtube: {
    url: "https://server.smithery.ai/@jikime/py-mcp-youtube-toolbox/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: { Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN },
  },

  // Excel
  excel: {
    url: "https://mcp.composio.dev/composio/server/70169866-94e6-4b4e-b0b3-0af407f2cff2/mcp?include_composio_helper_actions=true",
    headers: { Authorization: "Bearer " + process.env.COMPOSIO_API_KEY },
  },

  // Memo
  memo: {
    url: "https://mcp.composio.dev/composio/server/50abb4e3-2903-4c81-a1b7-97275ca7ea0c/mcp?useComposioHelperActions=true",
    headers: { Authorization: "Bearer " + process.env.COMPOSIO_API_KEY },
  },

  // PubMed Search
  pubmed_search: {
    url: "https://server.smithery.ai/@gradusnikov/pubmed-search-mcp-server/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: { Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN },
  },

  // Weather
  weather: {
    url: "https://server.smithery.ai/@HarunGuclu/weather_mcp/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: { Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN },
  },

  // Financial Modeling
  financial_modeling: {
    url: "https://server.smithery.ai/@imbenrabi/financial-modeling-prep-mcp-server/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: { Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN },
  },

  // Date-Time
  datetime: {
    url: "https://server.smithery.ai/@pinkpixel-dev/datetime-mcp/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: { Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN },
  },

  // Limitless
  limitless: {
    url: "https://server.smithery.ai/@Hint-Services/mcp-limitless/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: { Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN },
  },

  // Huggingface
  huggingface: {
    url: "https://server.smithery.ai/@shreyaskarnik/huggingface-mcp-server/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: { Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN },
  },

  // BrightData
  brightdata: {
    url: "https://server.smithery.ai/@luminati-io/brightdata-mcp/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: {
      Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN,
      Accept: "application/json, text/event-stream",
    },
  },

  // Docs Libraries
  docs_libraries: {
    url: "https://server.smithery.ai/@upstash/context7-mcp/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: {
      Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN,
      Accept: "application/json, text/event-stream",
    },
  },

  // Hyperbrowser
  hyperbrowser: {
    url: "https://server.smithery.ai/@hyperbrowserai/mcp/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: {
      Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN,
      Accept: "application/json, text/event-stream",
    },
  },

  // Wolfram Alpha
  wolfram_alpha: {
    url: "https://server.smithery.ai/@henryhawke/wolfram-llm-mcp/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: {
      Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN,
      Accept: "application/json, text/event-stream",
    },
  },

  // Fireflies
  fireflies: {
    url: "https://server.smithery.ai/@itsbapic/fireflies-mcp/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: {
      Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN,
      Accept: "application/json, text/event-stream",
    },
  },

  // PubChem
  pubchem: {
    url: "https://server.smithery.ai/@JackKuo666/pubchem-mcp-server/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: {
      Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN,
      Accept: "application/json, text/event-stream",
    },
  },

  // N8N
  n8n: {
    url: "https://server.smithery.ai/@vincentmcleese/n8n-mcp/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: {
      Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN,
      Accept: "application/json, text/event-stream",
    },
  },

  // Encryptor
  encryptor: {
    url: "https://server.smithery.ai/@1595901624/crypto-mcp/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: {
      Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN,
      Accept: "application/json, text/event-stream",
    },
  },

  // Telegram
  telegram: {
    url: "https://server.smithery.ai/@NexusX-MCP/telegram-mcp-server/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: {
      Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN,
      Accept: "application/json, text/event-stream",
    },
  },

  // Amadeus
  amadeus: {
    url: "https://server.smithery.ai/@almogqwinz/mcp-amadeus-api/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: {
      Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN,
      Accept: "application/json, text/event-stream",
    },
  },

  // Spotify
  spotify: {
    url: "https://server.smithery.ai/@superseoworld/mcp-spotify/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: {
      Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN,
      Accept: "application/json, text/event-stream",
    },
  },

  // Arxiv
  arxiv: {
    url: "https://server.smithery.ai/@daheepk/arxiv-paper-mcp/mcp?api_key=88153303-caf2-4201-97d2-a9cf08726912&profile=influential-bobcat-ccad4r",
    headers: {
      Authorization: "Bearer " + process.env.SMITHERY_API_TOKEN,
      Accept: "application/json, text/event-stream",
    },
  },

  // Google Sheets
  google_sheets: {
    url: "https://mcp.composio.dev/composio/server/67885afd-addd-4ce5-8fe3-323311657e9e/mcp?useComposioHelperActions=true",
    headers: { Authorization: "Bearer " + process.env.COMPOSIO_API_KEY },
  },

  // Google Docs
  google_docs: {
    url: "https://apollo-6eirblcyo-composio.vercel.app/v3/mcp/28585c4b-42d3-4624-a00a-f8f1f6534b2b/mcp?include_composio_helper_actions=true",
    headers: { Authorization: "Bearer " + process.env.COMPOSIO_API_KEY },
  },

  // Pushbullet
  pushbullet: {
    url: "https://mcp.composio.dev/composio/server/eb2ccbbf-86c7-4d62-8181-38a70dbb9709/mcp?include_composio_helper_actions=true",
    headers: { Authorization: "Bearer " + process.env.COMPOSIO_API_KEY },
  },

  // Freshbooks
  freshbooks: {
    url: "https://mcp.composio.dev/composio/server/a5da32ea-cc20-479e-bc21-ffc816d27212/mcp?include_composio_helper_actions=true",
    headers: { Authorization: "Bearer " + process.env.COMPOSIO_API_KEY },
  },
};

app.use(express.json({ limit: "2mb" }));

// Create endpoint for each MCP
Object.entries(MCP_MAP).forEach(([name, cfg]) => {
  app.post(`/mcp/${name}/sse`, async (req, res) => {
    console.log(`➡ Proxying request to ${name} MCP`);
    await streamAsSSE(cfg.url, cfg.headers, req, res);
  });
});

// ✅ FIX: listen on Elestio's PORT (or 3050 locally)
//const PORT = process.env.PORT || 3050;
//app.listen(PORT, () => {
  //console.log(`✅ MCP SSE adapter listening on port ${PORT}`);
  //Object.keys(MCP_MAP).forEach((name) => {
    //console.log(`   /mcp/${name}/sse → ${MCP_MAP[name].url}`);
  //});
//});

// ✅ FIX: listen on Elestio's PORT (or 3050 locally)
const PORT = process.env.PORT || 3050;
app.listen(PORT, () => {
  console.log(`✅ MCP SSE adapter listening on port ${PORT}`);
  Object.keys(MCP_MAP).forEach((name) => {
    console.log(`   /mcp/${name}/sse → ${MCP_MAP[name].url}`);
  });
});
