import { kv } from '@vercel/kv';

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
    await kv.set(`link:${shortId}`, {
      originalUrl: originalUrl,
      clicks: 0,
      createdAt: new Date().toISOString()
    });

    return res.status(200).json({ success: true, shortId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}