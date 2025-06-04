// File: api/save-avatar.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerId, avatarUrl } = req.body;

  if (!customerId || !avatarUrl) {
    return res.status(400).json({ error: 'Missing customerId or avatarUrl' });
  }

  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || '2024-01';

  const url = `https://${domain}/admin/api/${version}/customers/${customerId}.json`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: {
          id: customerId,
          note: `Avatar URL: ${avatarUrl}`,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Shopify API error:', data);
      return res.status(500).json({ error: 'Failed to update customer note' });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Unexpected server error' });
  }
}
