import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: "No API key found. Add ANTHROPIC_API_KEY to your .env file and restart the server.",
    });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "No message to send." });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system:
          "You are a warm, easygoing voice companion. The person is talking to you out loud, and your reply will be read aloud by their browser, so keep responses short, natural, and conversational — a sentence or two unless they clearly want more detail.",
        messages,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Anthropic API error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const reply = data.content?.[0]?.text ?? "Sorry, I didn't catch that.";
    res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Something went wrong reaching Claude." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n  Voicebot is running.`);
  console.log(`  Open http://localhost:${PORT} in Chrome\n`);
});
