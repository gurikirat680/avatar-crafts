import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(express.json());

app.post("/save-avatar", async (req, res) => {
  const { customerId, avatarUrl } = req.body;
  if (!customerId || !avatarUrl) {
    return res.status(400).json({ error: "Missing data" });
  }

  try {
    const shop = process.env.SHOPIFY_STORE;
    const token = process.env.SHOPIFY_ADMIN_TOKEN;

    const response = await fetch(`https://${shop}/admin/api/2023-07/customers/${customerId}.json`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ customer: { id: customerId, note: avatarUrl } }),
    });

    const data = await response.json();
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default app;
