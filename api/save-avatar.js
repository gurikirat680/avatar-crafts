import fetch from 'node-fetch';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://www.lilliputcrafts.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // CORS preflight
  }

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  try {
    const { customerId, avatarUrl } = req.body;

    // Add your Shopify admin API logic here...

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving avatar:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
