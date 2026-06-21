export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const username = (req.query.username || '').trim();
  if (!username) return res.status(400).json({ error: 'Username required' });

  try {
    const usersRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
    });
    if (!usersRes.ok) return res.status(502).json({ error: 'Roblox API unavailable' });

    const usersData = await usersRes.json();
    if (!usersData.data || usersData.data.length === 0)
      return res.status(404).json({ error: 'User not found' });

    const userId = usersData.data[0].id;
    const profileRes = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    if (!profileRes.ok) return res.status(502).json({ error: 'Failed to fetch profile' });

    const profile = await profileRes.json();
    const ageInDays = Math.floor((Date.now() - new Date(profile.created).getTime()) / 86400000);
    const allowed = ageInDays >= 80;

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: allowed ? '✅ Verificação Aprovada' : '❌ Verificação Negada',
            color: allowed ? 0x22c55e : 0xef4444,
            fields: [
              { name: 'Usuário', value: profile.name, inline: true },
              { name: 'Dias de conta', value: String(ageInDays), inline: true },
              { name: 'Status', value: allowed ? 'Aprovado' : 'Negado (< 80 dias)', inline: true },
            ],
            timestamp: new Date().toISOString(),
          }],
        }),
      }).catch(() => {});
    }

    return res.json({ allowed, ageInDays, username: profile.name });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
