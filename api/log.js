export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return res.status(500).json({ error: 'Webhook not configured' });
  }
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text });
    }
    res.status(204).end();
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach Discord' });
  }
}
