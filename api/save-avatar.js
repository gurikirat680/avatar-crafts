import fetch from 'node-fetch';

export default async function handler(req, res) {
  // ✅ CORS HEADERS
  res.setHeader("Access-Control-Allow-Origin", "https://www.lilliputcrafts.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { customerId, avatarUrl } = req.body;

  if (!customerId || !avatarUrl) {
    return res.status(400).json({ error: 'Missing customerId or avatarUrl' });
  }

  try {
    const shop = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const apiVersion = process.env.SHOPIFY_API_VERSION;

    const metafieldData = {
      metafield: {
        namespace: "custom",
        key: "avatar_url",
        type: "url",
        value: avatarUrl
      }
    };

    const response = await fetch(`https://${shop}/admin/api/${apiVersion}/customers/${customerId}/metafields.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify(metafieldData)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Shopify Error:', result);
      throw new Error(result.errors || 'Shopify API error');
    }

    return res.status(200).json({ success: true, metafield: result.metafield });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
