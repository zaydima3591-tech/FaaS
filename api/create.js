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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const shortId = Math.random().toString(36).substring(2, 8);

  try {
    const redis = await getRedisClient();

    const linkData = {
      originalUrl: originalUrl,
      clicks: 0,
      createdAt: new Date().toISOString()
    };

    await redis.set(`link:${shortId}`, JSON.stringify(linkData));

    return res.status(200).json({ success: true, shortId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}