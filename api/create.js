import { createClient } from 'redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const shortId = Math.random().toString(36).substring(2, 8);
  
  // Инициализируем клиента для каждого запроса с таймаутом
  const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: { connectTimeout: 10000 }
  });

  redisClient.on('error', (err) => console.error('Redis Client Error', err));

  try {
    await redisClient.connect();

    const linkData = {
      originalUrl: originalUrl,
      clicks: 0,
      createdAt: new Date().toISOString()
    };

    await redisClient.set(`link:${shortId}`, JSON.stringify(linkData));

    // Обязательно закрываем соединение перед ответом
    await redisClient.quit();

    return res.status(200).json({ success: true, shortId });
  } catch (error) {
    // Безопасно закрываем соединение, если оно было открыто
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
    return res.status(500).json({ error: error.message });
  }
}