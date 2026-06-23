import { createClient } from 'redis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Parameter id is required' });
  }

  const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: { connectTimeout: 10000 }
  });

  redisClient.on('error', (err) => console.error('Redis Client Error', err));

  try {
    await redisClient.connect();
    const data = await redisClient.get(`link:${id}`);

    if (!data) {
      await redisClient.quit();
      return res.status(404).json({ error: 'Link not found' });
    }

    const linkData = JSON.parse(data);
    linkData.clicks += 1;
    await redisClient.set(`link:${id}`, JSON.stringify(linkData));

    // Закрываем соединение перед редиректом
    await redisClient.quit();

    return res.redirect(308, linkData.originalUrl);
  } catch (error) {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
    return res.status(500).json({ error: error.message });
  }
}