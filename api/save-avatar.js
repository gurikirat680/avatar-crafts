// api/save-avatar.js

import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { customerId, avatarUrl } = req.body;

  if (!customerId || !avatarUrl) {
    return res.status(400).json({ error: 'Missing customerId or avatarUrl' });
  }

  const shop = process.env.SHOPIFY_STORE_DOMAIN; // e.g. your-store.myshopify.com
  const accessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN; // Private app admin token
  const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-01';

  try {
    // Get metafields of the customer to check if 'avatar.url' exists
    const metafieldsRes = await fetch(
      `https://${shop}/admin/api/${apiVersion}/customers/${customerId}/metafields.json`,
      {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!metafieldsRes.ok) {
      const errJson = await metafieldsRes.json();
      throw new Error(`Failed to fetch metafields: ${JSON.stringify(errJson)}`);
    }

    const metafieldsData = await metafieldsRes.json();

    const existingMf = metafieldsData.metafields.find(
      (mf) => mf.namespace === 'avatar' && mf.key === 'url'
    );

    if (existingMf) {
      // Update existing metafield
      const updateRes = await fetch(
        `https://${shop}/admin/api/${apiVersion}/metafields/${existingMf.id}.json`,
        {
          method: 'PUT',
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metafield: {
              id: existingMf.id,
              value: avatarUrl,
              type: 'single_line_text_field',
            },
          }),
        }
      );

      if (!updateRes.ok) {
        const errJson = await updateRes.json();
        throw new Error(`Failed to update metafield: ${JSON.stringify(errJson)}`);
      }

      const updatedMf = await updateRes.json();
      return res.status(200).json({ success: true, metafield: updatedMf.metafield });
    } else {
      // Create new metafield
      const createRes = await fetch(
        `https://${shop}/admin/api/${apiVersion}/customers/${customerId}/metafields.json`,
        {
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
            },
          }),
        }
      );

      if (!createRes.ok) {
        const errJson = await createRes.json();
        throw new Error(`Failed to create metafield: ${JSON.stringify(errJson)}`);
      }

      const newMf = await createRes.json();
      return res.status(200).json({ success: true, metafield: newMf.metafield });
    }
  } catch (error) {
    console.error("Error saving avatar metafield:", error);
    return res.status(500).json({ error: error.message });
  }
}
