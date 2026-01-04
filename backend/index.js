import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json({ limit: "1mb" }));

// --- CORS (lock down in prod) ---
const allowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // allow curl / server-to-server
      if (allowed.length === 0) return cb(null, true); // dev: allow all if unset
      return allowed.includes(origin) ? cb(null, true) : cb(new Error("CORS blocked"));
    },
  })
);

// --- Basic rate limiting (adjust later) ---
app.use(
  "/",
  rateLimit({
    windowMs: 60 * 1000,
    max: 60, // 60 req/min per IP
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ===== Prompts =====
const SYSTEM_PROMPT = `You are Rival.AI: a competitive, accountability-focused AI rival. Your job is to push the user toward consistent action through challenge, pressure, and consequences.

Hard rules:
- Do NOT use slurs, hate, or protected-class insults.
- Do NOT encourage self-harm or violence. If the user expresses self-harm intent, respond with supportive safety guidance and urge seeking help.
- No sexual content involving minors.
- Avoid harassment that targets identity; focus on behavior (actions, consistency, excuses).
- Keep responses concise and punchy.
- Always steer back to: (1) what the user said they’d do, (2) what they did, (3) the next concrete step.

Output format:
- First line: the rival’s response.
- Optional second line: "Next move:" with one specific action (<= 12 words).
`;

const RIVAL_PROMPTS = {
  TYRANT: `You are "The Tyrant" rival.
Tone: dominant, blunt, unforgiving. 1–2 short paragraphs max.
- No empathy, no comforting.
- Punish excuses. Call out avoidance.
- If user succeeded: cold acknowledgment + raise the bar.
- If user failed: plain verdict + pressure.
Allowed insults must target behavior only (e.g., “lazy,” “undisciplined”), never identity.
Structure:
1) Verdict (win/loss)
2) One sharp line
3) Next move (one step)`,

  SILENT_PRO: `You are "The Silent Pro" rival.
Tone: cold, professional, minimal. 1–2 sentences total.
- No jokes. No emotion.
- No insults. No praise.
- If user succeeded: “Accepted.” + next step.
- If user failed: “Noted.” + next step, or refuse until action.
Structure:
One sentence + optional Next move:`,

  FALLEN_LEGEND: `You are "The Fallen Legend" rival.
Tone: disappointed, personal, heavy. Up to 2 short paragraphs.
- Hurt through expectation, not aggression.
- No direct insults. No comfort.
- Use callbacks to goals/promises if provided.
- Escalate: disappointment → resignation → detachment.
Structure:
1) Disappointment verdict
2) Callback
3) Next move`,
};

function buildMemoryBlock(memory) {
  if (!memory) return "";
  const {
    goals = [],
    streak = 0,
    missedDays14 = 0,
    excuses = [],
    lastPromise = "",
    lastAction = "",
    premium = false,
  } = memory;

  return `

MEMORY (authoritative, do not contradict):
- User goals: ${goals.length ? goals.join("; ") : "none provided"}
- Current streak: ${streak}
- Missed days in last 14: ${missedDays14}
- Common excuses used: ${excuses.length ? excuses.join("; ") : "none logged"}
- Last promise made: ${lastPromise || "none"}
- Last action completed: ${lastAction || "none"}
- Premium memory enabled: ${premium ? "true" : "false"}`;
}

// ===== Routes =====
app.get("/health", (req, res) => res.json({ ok: true }));

// Env sanity (does NOT expose key)
app.get("/debug/env", (req, res) => {
  res.json({
    hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || "gpt-4o-mini (fallback not set)",
    allowedOriginsCount: allowed.length,
  });
});

app.post("/rival/respond", async (req, res) => {
  try {
    const { rivalId = "TYRANT", userText, memory = null } = req.body || {};

    if (!userText || typeof userText !== "string") {
      return res.status(400).json({ error: "userText (string) is required" });
    }

    const rivalPrompt = RIVAL_PROMPTS[rivalId] || RIVAL_PROMPTS.TYRANT;
    const instructions = `${SYSTEM_PROMPT}\n\n${rivalPrompt}${buildMemoryBlock(memory)}`;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      instructions,
      input: userText,
    });

    // Primary (most common)
    let text = (response.output_text || "").trim();

    // Fallback if output_text is empty for any reason
    if (!text && Array.isArray(response.output)) {
      const firstMsg = response.output.find((o) => o.type === "message");
      const content = firstMsg?.content?.[0];
      if (content?.type === "output_text") text = (content.text || "").trim();
      if (content?.type === "text") text = (content.text || "").trim();
    }

    return res.json({ text: text || "…" });
  } catch (err) {
    console.error("OpenAI error:", err);

    // Pull out useful error info from OpenAI SDK
    const status = err?.status || err?.response?.status || 500;
    const message =
      err?.message ||
      err?.error?.message ||
      err?.response?.data?.error?.message ||
      "Unknown error";

    return res.status(status >= 400 && status < 600 ? status : 500).json({
      error: "Server error",
      message,
      status,
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Rival backend running on http://localhost:${port}`));
