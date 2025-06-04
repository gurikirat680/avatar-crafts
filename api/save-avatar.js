// Force Node.js runtime
export const config = {
  runtime: 'nodejs',
};

import fetch from 'node-fetch';

export default async function handler(req, res) {
  // ✅ CORS headers
  res.setHeader('Access-Control-Allow-Origin', 'https://www.lilliputcrafts.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Preflight request (CORS check)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { customerId, avatarUrl } = req.body;

    if (!customerId || !avatarUrl) {
      return res.status(400).json({ error: 'Missing customerId or avatarUrl' });
    }

    const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-01';

    const metafieldPayload = {
      metafield: {
        namespace: 'custom',
        key: 'avatar_url',
        type: 'url',
        value: avatarUrl,
      },
    };

    const shopifyUrl = `https://${storeDomain}/admin/api/${apiVersion}/customers/${customerId}/metafields.json`;

    const shopifyResponse = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metafieldPayload),
    });

    if (!shopifyResponse.ok) {
      const errorDetails = await shopifyResponse.text();
      return res.status(shopifyResponse.status).json({ error: 'Shopify API error', details: errorDetails });
    }

    const data = await shopifyResponse.json();
    return res.status(200).json({ message: 'Avatar URL saved', metafield: data.metafield });
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}
