/**
 * Point this at your running Rival API, not an OpenAI URL.
 * The OpenAI API key belongs on the backend and must never ship in Expo.
 *
 * Example .env in the Expo project root:
 * EXPO_PUBLIC_RIVAL_API_URL=http://192.168.1.42:3000
 */
const BASE_URL = (process.env.EXPO_PUBLIC_RIVAL_API_URL || "").trim().replace(/\/+$/, "");

export async function fetchRivalReply({ rivalId, userText, memory }) {
  if (!String(userText || "").trim()) return "";
  if (!BASE_URL) {
    throw new Error("AI unavailable: set EXPO_PUBLIC_RIVAL_API_URL to your backend address.");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(BASE_URL + "/rival/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rivalId,
        userText: String(userText).slice(0, 1400),
        memory,
      }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.message || data?.error || "Rival API request failed");
    }
    if (typeof data.text !== "string" || !data.text.trim()) {
      throw new Error("The rival returned an empty response.");
    }
    return data.text.trim();
  } finally {
    clearTimeout(timeout);
  }
}
