import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).send('ID is required');
  }

  try {
    const linkData = await kv.get(`link:${id}`);

    if (!linkData) {
      return res.status(404).send('Not found');
    }

    linkData.clicks += 1;
    await kv.set(`link:${id}`, linkData);

    return res.redirect(302, linkData.originalUrl);
  } catch (error) {
    return res.status(500).send('Internal server error');
  }
}