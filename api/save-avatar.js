export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    // CORS preflight response
    res.setHeader("Access-Control-Allow-Origin", "https://www.lilliputcrafts.com");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Access-Control-Allow-Origin", "https://www.lilliputcrafts.com");

  try {
    const { customerId, avatarUrl } = req.body;
    if (!customerId || !avatarUrl) {
      return res.status(400).json({ error: "Missing data" });
    }

    // Use your .env variables
    const shop = process.env.SHOPIFY_STORE;
    const token = process.env.SHOPIFY_ADMIN_TOKEN;

    const shopifyRes = await fetch(`https://${shop}/admin/api/2023-07/customers/${customerId}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ customer: { id: customerId, note: avatarUrl } }),
    });

    const data = await shopifyRes.json();
    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
