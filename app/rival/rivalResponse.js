export function generateRivalResponse(
  userEntry,
  rival,
  { playerXP = 0, rivalXP = 0 } = {}
) {
  /* ---------------- BASE MULTIPLIERS ---------------- */

  const baseMultiplier = {
    aggressive: 1.2,
    balanced: 1.05,
    respectful: 1.0,
    chaotic: Math.random() < 0.5 ? 0.8 : 1.3
  };

  const type = rival.type || "balanced";
  let multiplier = baseMultiplier[type];

  /* ---------------- FATIGUE / PRESSURE ---------------- */

  const xpDiff = rivalXP - playerXP;

  if (xpDiff > 50) multiplier -= 0.05;   // rival coasts
  if (xpDiff < -50) multiplier += 0.05;  // rival locks in

  /* ---------------- NUMBER EXTRACTION ---------------- */

  const numberMatch = userEntry.match(/\d+(\.\d+)?/);
  const userValue = numberMatch ? parseFloat(numberMatch[0]) : null;

  if (userValue === null) {
    return {
      text: "I logged something too. Stay sharp.",
      timestamp: new Date().toLocaleTimeString(),
      rivalValue: null
    };
  }

  /* ---------------- ACTIVITY TYPE DETECTION ---------------- */

  const entry = userEntry.toLowerCase();

  const repKeywords = ["push", "pushup", "pull", "squat", "rep"];
  const distanceKeywords = ["mile", "km"];
  const timeKeywords = ["min", "minute", "hour"];

  const isReps = repKeywords.some(k => entry.includes(k));
  const isDistance = distanceKeywords.some(k => entry.includes(k));
  const isTime = timeKeywords.some(k => entry.includes(k));

  const rawValue = userValue * multiplier;

  /* ---------------- ROUNDING BY PERSONALITY ---------------- */

  let rivalValue;

  if (isReps) {
    if (type === "aggressive") rivalValue = Math.ceil(rawValue);
    else if (type === "respectful" && Math.random() < 0.4)
      rivalValue = userValue; // match
    else rivalValue = Math.round(rawValue);
  } else if (isDistance || isTime) {
    rivalValue = Number(rawValue.toFixed(1));
  } else {
    // fallback (unknown activity)
    rivalValue = Math.round(rawValue);
  }

  /* ---------------- DIALOGUE ---------------- */

  const lines = {
    aggressive: [
      `I did ${rivalValue}. Try harder.`,
      `${rivalValue}. You’re slipping.`,
      `I crushed you with ${rivalValue}.`
    ],
    balanced: [
      `I logged ${rivalValue}. Solid work.`,
      `Right behind you at ${rivalValue}.`,
      `Consistent. ${rivalValue}.`
    ],
    respectful: [
      `I stayed with you — ${rivalValue}.`,
      `Good pace. I got ${rivalValue}.`,
      `We’re building together. ${rivalValue}.`
    ],
    chaotic: [
      `${rivalValue}. Don’t question it.`,
      `The vibes said ${rivalValue}.`,
      `I appeared and did ${rivalValue}.`
    ]
  };

  const pool = lines[type];
  const message = pool[Math.floor(Math.random() * pool.length)];

  return {
    text: message,
    timestamp: new Date().toLocaleTimeString(),
    rivalValue
  };
}
