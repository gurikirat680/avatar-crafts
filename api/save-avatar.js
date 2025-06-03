import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { customerId, avatarUrl } = req.body;

  if (!customerId || !avatarUrl) {
    return res.status(400).json({ error: 'Missing customerId or avatarUrl' });
  }

  const shop = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;

  try {
    const response = await fetch(`https://${shop}/admin/api/2024-01/customers/${customerId}.json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify({
        customer: {
          id: customerId,
          note: avatarUrl
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Shopify Error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    return res.status(200).json({ success: true, customer: result.customer });
  } catch (err) {
    console.error("Error updating customer:", err.message);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
