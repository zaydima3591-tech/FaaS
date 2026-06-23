import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { id } = req.query;
  try {
    const linkData = await redis.get(`link:${id}`);
    if (!linkData) return res.status(404).json({ error: 'Link not found' });
    
    linkData.clicks += 1;
    await redis.set(`link:${id}`, linkData);
    return res.redirect(308, linkData.originalUrl);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}