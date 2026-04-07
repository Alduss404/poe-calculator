export default async function handler(req, res) {
  const league = req.query.league || 'Settlers';
  const url = `https://poe.ninja/api/data/currencyoverview?league=${encodeURIComponent(league)}&type=Currency`;

  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'poe-calculator/1.0' },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `poe.ninja returned ${upstream.status}` });
    }

    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
