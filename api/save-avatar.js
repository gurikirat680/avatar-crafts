// api/save-avatar.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { customerId, avatarUrl } = req.body;

  if (!customerId || !avatarUrl) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const { SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_ACCESS_TOKEN, SHOPIFY_API_VERSION } = process.env;

  const shopifyUrl = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/customers/${customerId}/metafields.json`;

  try {
    const response = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ADMIN_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        metafield: {
          namespace: 'avatar',
          key: 'url',
          type: 'url',
          value: avatarUrl,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: errorData.errors || 'Shopify request failed' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

