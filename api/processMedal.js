import fetch from "node-fetch";
import FormData from "form-data";

export default async function handler(req, res) {
  try {
    const body = req.body ? JSON.parse(req.body) : {};
    const { imageUrl } = body;
    const openAIKey = process.env.OPENAI_API_KEY;

    if (!imageUrl) {
      return res.status(400).json({ error: "Missing imageUrl" });
    }

    const formData = new FormData();
    formData.append("model", "gpt-image-1");
    formData.append("image", imageUrl);
    formData.append("prompt", "Remove the background completely, keeping only the medal with its details intact.");

    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${openAIKey}` },
      body: formData
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ OpenAI error:", text);
      return res.status(500).json({ error: "Background removal failed", detail: text });
    }

    const data = await response.json();
    const transparentUrl = data?.data?.[0]?.url;

    return res.status(200).json({ success: true, imageUrl: transparentUrl });
  } catch (err) {
    console.error("❌ Handler error:", err);
    return res.status(500).json({ error: err.message });
  }
}
