export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const username = (req.query.username || '').trim();
  if (!username) return res.status(400).json({ error: 'Username required' });

  try {
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';

    let country = 'Unknown', city = '', region = '';
    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (geoRes.ok) {
        const g = await geoRes.json();
        country = g.country_name || 'Unknown';
        city    = g.city        || '';
        region  = g.region      || '';
      }
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

    const [profileRes, avatarRes] = await Promise.all([
      fetch(`https://users.roblox.com/v1/users/${userId}`),
      fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`),
    ]);
    if (!profileRes.ok) return res.status(502).json({ error: 'Failed to fetch profile' });

    const profile = await profileRes.json();

    let avatarUrl = `https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=420&height=420&format=png`;
    try {
      if (avatarRes.ok) {
        const ad = await avatarRes.json();
        if (ad.data?.[0]?.imageUrl) avatarUrl = ad.data[0].imageUrl;
      }
    } catch {}

    const created    = new Date(profile.created);
    const ageInDays  = Math.floor((Date.now() - created.getTime()) / 86400000);
    const allowed    = ageInDays >= 80;
    const createdStr = created.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const location   = [...new Set([city, region, country].filter(Boolean))].join(', ');

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      const desc = profile.description?.trim();
      const embedDesc = [
        `**Usuário:** [${profile.name}](https://www.roblox.com/users/${userId}/profile)`,
        `**Display Name:** ${profile.displayName || profile.name}`,
        desc ? `\n📝 *"${desc.slice(0, 200)}${desc.length > 200 ? '…' : ''}"`* : '',
      ].filter(Boolean).join('\n');

      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title: allowed
              ? `✅ Verificação Aprovada — ${profile.name}`
              : `❌ Verificação Negada — ${profile.name}`,
            url: `https://www.roblox.com/users/${userId}/profile`,
            color: allowed ? 0x22c55e : 0xef4444,
            description: embedDesc,
            thumbnail: { url: avatarUrl },
            fields: [
              { name: '🆔 User ID',      value: `\`${userId}\``,           inline: true },
              { name: '📅 Conta criada', value: createdStr,                    inline: true },
              { name: '⏳ Dias de conta',value: `**${ageInDays}** dias`,      inline: true },
              { name: '🖥️ IP',           value: `\`${ip}\``,              inline: true },
              { name: '🌍 Localização',  value: location || 'Desconhecida',    inline: true },
              { name: '🔒 Status', value: allowed
                ? '✅ **Aprovado** (≥ 80 dias)'
                : `❌ **Negado** — conta com apenas **${ageInDays}** dias`,   inline: true },
              { name: '🔗 Perfil', value: `[Ver no Roblox](https://www.roblox.com/users/${userId}/profile)`, inline: false },
            ],
            footer: { text: 'Roblox Condo • Verificação de Conta' },
            timestamp: new Date().toISOString(),
          }],
        }),
      }).catch(() => {});
    }

    return res.json({ allowed, ageInDays, username: profile.name, displayName: profile.displayName,
      userId, created: createdStr, country, city, avatarUrl });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
