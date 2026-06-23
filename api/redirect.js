import { createClient } from 'redis';

let redisClient;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL
    });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
    await redisClient.connect();
  }
  return redisClient;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Parameter id is required' });
  }

  try {
    const redis = await getRedisClient();
    const data = await redis.get(`link:${id}`);

    if (!data) {
      return res.status(404).json({ error: 'Link not found' });
    }

    const linkData = JSON.parse(data);
    linkData.clicks += 1;
    await redis.set(`link:${id}`, JSON.stringify(linkData));

    return res.redirect(308, linkData.originalUrl);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}