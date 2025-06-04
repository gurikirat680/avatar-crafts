// api/save-avatar.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { customerId, avatarUrl } = req.body;

  if (!customerId || !avatarUrl) {
    return res.status(400).json({ error: 'Missing customerId or avatarUrl' });
  }

  try {
    const shop = process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

    const metafieldPayload = {
      metafield: {
        namespace: 'avatar',
        key: 'url',
        type: 'single_line_text_field',
        value: avatarUrl,
      },
    };

    const response = await fetch(`https://${shop}/admin/api/2024-01/customers/${customerId}/metafields.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metafieldPayload),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const result = await response.json();
    return res.status(200).json({ success: true, metafield: result.metafield });
  } catch (err) {
    console.error('❌ Backend error:', err);
    return res.status(500).json({ error: 'Failed to save metafield', details: err.message });
  }
}
