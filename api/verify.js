export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const username = (req.query.username || '').trim();
  if (!username) return res.status(400).json({ error: 'Username required' });

  try {
    const ip =
      (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
      req.socket?.remoteAddress || 'unknown';

    let country = 'Unknown', city = '';
    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (geoRes.ok) { const g = await geoRes.json(); country = g.country_name || 'Unknown'; city = g.city || ''; }
    } catch {}

    const usersRes = await fetch('https://users.roblox.com/v1/usernames/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: false }),
    });
    if (!usersRes.ok) return res.status(502).json({ error: 'Roblox API unavailable' });
    const usersData = await usersRes.json();
    if (!usersData.data || usersData.data.length === 0) return res.status(404).json({ error: 'User not found' });

    const userId = usersData.data[0].id;
    const profileRes = await fetch(`https://users.roblox.com/v1/users/${userId}`);
    if (!profileRes.ok) return res.status(502).json({ error: 'Failed to fetch profile' });
    const profile = await profileRes.json();

    const created   = new Date(profile.created);
    const ageInDays = Math.floor((Date.now() - created.getTime()) / 86400000);
    const allowed   = ageInDays >= 80;
    const createdStr = created.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const location  = city ? `${city}, ${country}` : country;

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
              { name: '👤 Usuário',      value: profile.name,    inline: true },
              { name: '🆔 User ID',      value: String(userId),  inline: true },
              { name: '📅 Conta criada', value: createdStr,      inline: true },
              { name: '⏳ Dias de conta',value: String(ageInDays),inline: true },
              { name: '🌍 Localização', value: location,         inline: true },
              { name: '🖥️ IP',          value: ip,               inline: true },
              { name: 'Status', value: allowed ? '✅ Aprovado' : '❌ Negado (< 80 dias)', inline: false },
            ],
            thumbnail: { url: `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=150&height=150&format=png` },
            timestamp: new Date().toISOString(),
          }],
        }),
      }).catch(() => {});
    }

    return res.json({ allowed, ageInDays, username: profile.name, userId, created: createdStr, country, city });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
