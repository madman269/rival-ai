const BASE_URL = process.env.EXPO_PUBLIC_RIVAL_API_URL || "http://localhost:3000";

export async function fetchRivalReply({rival, userText, history = [], activity = null}) {
  const res = await fetch(BASE_URL + "/rival/respond", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      userText, activity: activity ? {key:activity.key,label:activity.label,minutesRemaining:activity.minutesRemaining,last24h:activity.last24h,simulated:true} : null, rival: {
        name: rival.name, personality: rival.personality,
        description: rival.description || "", memoryNotes: rival.memoryNotes || "", aggression: rival.aggression ?? 65,
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
