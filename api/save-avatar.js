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
  const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-01';

  try {
    // Step 1: Fetch metafields for the customer
    const metafieldsRes = await fetch(`https://${shop}/admin/api/${apiVersion}/customers/${customerId}/metafields.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      }
    });

    if (!metafieldsRes.ok) {
      const errorData = await metafieldsRes.json();
      throw new Error(`Failed to fetch metafields: ${JSON.stringify(errorData)}`);
    }

    const metafieldsData = await metafieldsRes.json();

    // Step 2: Check if avatar metafield exists
    const avatarMf = metafieldsData.metafields.find(mf => mf.namespace === 'avatar' && mf.key === 'url');

    if (avatarMf) {
      // Step 3a: Update existing metafield
      const updateRes = await fetch(`https://${shop}/admin/api/${apiVersion}/metafields/${avatarMf.id}.json`, {
        method: 'PUT',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metafield: {
            id: avatarMf.id,
            value: avatarUrl,
            type: 'single_line_text_field'
          }
        }),
      });

      if (!updateRes.ok) {
        const errorData = await updateRes.json();
        throw new Error(`Failed to update metafield: ${JSON.stringify(errorData)}`);
      }

      const updatedMf = await updateRes.json();
      return res.status(200).json({ success: true, metafield: updatedMf.metafield });

    } else {
      // Step 3b: Create new metafield
      const createRes = await fetch(`https://${shop}/admin/api/${apiVersion}/customers/${customerId}/metafields.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metafield: {
            namespace: 'avatar',
            key: 'url',
            value: avatarUrl,
            type: 'single_line_text_field',
          }
        }),
      });

      if (!createRes.ok) {
        const errorData = await createRes.json();
        throw new Error(`Failed to create metafield: ${JSON.stringify(errorData)}`);
      }

      const newMf = await createRes.json();
      return res.status(200).json({ success: true, metafield: newMf.metafield });
    }
  } catch (err) {
    console.error("Error updating metafield:", err.message);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
