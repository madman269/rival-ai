const BASE_URL = process.env.EXPO_PUBLIC_RIVAL_API_URL || "http://localhost:3000";

export async function fetchRivalReply({rival, userText, history = []}) {
  const res = await fetch(BASE_URL + "/rival/respond", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      userText, rival: {
        name: rival.name, personality: rival.personality,
        description: rival.description || "", aggression: rival.aggression ?? 65,
      },
      history: history.slice(-20).map(m => ({
        role: m.sender === "you" ? "user" : "assistant", content: m.text,
      }))
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Rival reply failed");
  return data.text || "";
}
