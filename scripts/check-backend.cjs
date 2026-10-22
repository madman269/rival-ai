// Run against your own configured backend. Makes one live AI request.
const base = (process.argv[2] || process.env.EXPO_PUBLIC_RIVAL_API_URL || "").trim().replace(/\/+$/, "");
async function main() {
  if (!base || !/^https?:\/\//.test(base)) throw new Error("Usage: node scripts/check-backend.cjs http://YOUR_SERVER:3000");
  const healthResponse = await fetch(base + "/health", { signal: AbortSignal.timeout(10000) });
  const health = await healthResponse.json();
  if (!healthResponse.ok || health.ok !== true || health.aiConfigured !== true) {
    throw new Error("Backend is unreachable, unhealthy, or has no server-side API key configured.");
  }
  console.log("Health passed; checking a real AI reply...");
  const response = await fetch(base + "/rival/respond", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rivalId: "SILENT_PRO", userText: "I logged a 30 minute workout. Give me a brief encouraging reply." }),
    signal: AbortSignal.timeout(20000),
  });
  const data = await response.json();
  if (!response.ok || typeof data.text !== "string" || !data.text.trim()) {
    throw new Error("Live chat failed (HTTP " + response.status + "). Check server configuration and provider access.");
  }
  console.log("PASS: backend health and nonempty live AI reply verified.");
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
