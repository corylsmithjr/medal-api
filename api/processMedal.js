import fetch from "node-fetch";
import FormData from "form-data";

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    // Parse the request body
    const body = req.body ? JSON.parse(req.body) : {};
    const { imageUrl } = body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Missing imageUrl in request body." });
    }

    const openAIKey = process.env.OPENAI_API_KEY;
    if (!openAIKey) {
      return res.status(500).json({ error: "Missing OpenAI API key on server." });
    }

    console.log("🖼️ Processing image:", imageUrl);

    // Build form data for OpenAI image edits endpoint
    const formData = new FormData();
    formData.append("model", "gpt-image-1");
    formData.append("image", imageUrl);
    formData.append(
      "prompt",
      "Remove the background completely and keep only the medal clean, detailed, and centered."
    );
    formData.append("size", "512x512");

    // Send request to OpenAI
    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIKey}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ OpenAI API Error:", data);
      return res.status(500).json({
        error: "OpenAI API call failed.",
        details: data,
      });
    }

    const finalImageUrl = data.data?.[0]?.url;
    if (!finalImageUrl) {
      return res.status(500).json({ error: "No image URL returned from OpenAI." });
    }

    console.log("✅ Medal processed successfully:", finalImageUrl);

    // Return the image URL
    return res.status(200).json({
      success: true,
      message: "Medal processed successfully!",
      imageUrl: finalImageUrl,
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    return res.status(500).json({ error: "Server error.", details: err.message });
  }
}
