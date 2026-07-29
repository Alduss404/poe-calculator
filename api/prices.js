export default async function handler(req, res) {
  try {
    const leaguesResponse = await fetch('https://poe.ninja/poe1/api/economy/leagues', {
      headers: { 'User-Agent': 'poe-calculator/1.0' },
    });

    if (!leaguesResponse.ok) {
      return res.status(leaguesResponse.status).json({ error: `poe.ninja leagues returned ${leaguesResponse.status}` });
    }

    const leagues = await leaguesResponse.json();
    const currentLeague = Array.isArray(leagues) ? leagues[0] : null;
    const league = currentLeague?.id;

    if (!league) {
      return res.status(502).json({ error: 'poe.ninja returned no active economy leagues' });
    }

    const pricesUrl = `https://poe.ninja/poe1/api/economy/exchange/current/overview?league=${encodeURIComponent(league)}&type=Currency`;
    const pricesResponse = await fetch(pricesUrl, {
      headers: { 'User-Agent': 'poe-calculator/1.0' },
    });

    if (!pricesResponse.ok) {
      return res.status(pricesResponse.status).json({ error: `poe.ninja prices returned ${pricesResponse.status}` });
    }

    const data = await pricesResponse.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({ ...data, league: currentLeague });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
