// src/api/rivalApi.js

// Physical phone (Expo Go) → use your PC's LAN IP
const BASE_URL = "http://192.168.0.166:3000";

export async function fetchRivalReply({ rivalId, userText, memory }) {
  if (!userText || !userText.trim()) {
    return "";
  }

  const res = await fetch(`${BASE_URL}/rival/respond`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rivalId,
      userText,
      memory,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Rival API error:", data);
    throw new Error(data?.error || "Rival request failed");
  }

  return data?.text || "";
}
