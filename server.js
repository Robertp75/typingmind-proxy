import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json({ limit: '2mb' }));

app.post('/v1/chat/completions', async (req, res) => {
  const upstream = await fetch('https://your-http-streamable-endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + process.env.API_KEY,
    },
    body: JSON.stringify(req.body),
  });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  for await (const chunk of upstream.body) {
    res.write(`data: ${chunk.toString()}\n\n`);
  }
  res.end();
});

app.listen(3050, () => {
  console.log("🚀 Proxy listening on port 3050");
});
