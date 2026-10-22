import AsyncStorage from "@react-native-async-storage/async-storage";

export const RIVAL_KEY = "RIVAL_AI_CURRENT_RIVAL";
export const LOG_KEY = "RIVAL_AI_LOG_STATE";
const OLD_ARC_KEY = "RIVAL_AI_ARC_META";

export const dayKey = (value = new Date()) => {
  const d = value instanceof Date ? value : new Date(value);
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
};
const ordinal = (key) => {
  const [year, month, day] = String(key).split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000);
};
const keyAt = (n) => new Date(n * 86400000).toISOString().slice(0, 10);
const emptyState = (today = dayKey()) => ({
  sessions: [], messages: [], playerXP: 0, rivalXP: 0, bestStreak: 0, lastSyncedDay: today,
});
const normalize = (raw, today = dayKey()) => ({
  ...emptyState(today), ...raw,
  sessions: Array.isArray(raw?.sessions) ? raw.sessions : [],
  messages: Array.isArray(raw?.messages) ? raw.messages : [],
  playerXP: Number(raw?.playerXP) || 0,
  rivalXP: Number(raw?.rivalXP) || 0,
  bestStreak: Number(raw?.bestStreak) || 0,
  lastSyncedDay: raw?.lastSyncedDay || today,
});

const rankAt = (level) => level >= 15 ? "Apex" : level >= 10 ? "Diamond" : level >= 7 ? "Platinum" : level >= 5 ? "Gold" : level >= 3 ? "Silver" : "Bronze";

export function getStatus(rival, state, today = dayKey()) {
  if (!rival) return null;
  const start = ordinal(dayKey(rival.createdAt || Date.now()));
  const current = ordinal(today);
  const durationDays = Math.max(1, Number(rival.durationDays) || 14);
  const elapsed = Math.max(0, current - start);
  const trainedDays = new Set((state.sessions || []).map((s) => s.day));
  let streak = 0;
  let day = current;
  if (!trainedDays.has(today)) day--;
  while (day >= start && trainedDays.has(keyAt(day))) {
    streak++;
    day--;
  }
  let missedDays14 = 0;
  for (let d = Math.max(start, current - 14); d < Math.min(current, start + durationDays); d++) {
    if (!trainedDays.has(keyAt(d))) missedDays14++;
  }
  const playerXP = Number(state.playerXP) || 0;
  const rivalXP = Number(state.rivalXP) || 0;
  return {
    daysLeft: Math.max(0, durationDays - elapsed),
    durationDays, elapsed, ended: elapsed >= durationDays,
    progress: Math.min(1, elapsed / durationDays),
    trainedDays: trainedDays.size, streak, missedDays14,
    playerXP, rivalXP, lead: playerXP - rivalXP,
    playerLevel: 1 + Math.floor(playerXP / 100),
    rivalLevel: 1 + Math.floor(rivalXP / 100),
    playerRank: rankAt(1 + Math.floor(playerXP / 100)),
    rivalRank: rankAt(1 + Math.floor(rivalXP / 100)),
    outcome: playerXP > rivalXP ? "VICTORY" : playerXP < rivalXP ? "DEFEAT" : "DRAW",
  };
}

/** Count each missed day once, and never claim that the simulated rival actually trained. */
export function syncMissedDays(rival, state, today = dayKey()) {
  if (!rival) return state;
  const next = { ...state, messages: [...(state.messages || [])] };
  const start = ordinal(dayKey(rival.createdAt || Date.now()));
  const end = start + Math.max(1, Number(rival.durationDays) || 14);
  const current = ordinal(today);
  const from = Math.max(start, ordinal(next.lastSyncedDay || today));
  const logged = new Set((next.sessions || []).map((s) => s.day));
  let bonus = 0;
  for (let d = from; d < Math.min(current, end); d++) {
    const key = keyAt(d);
    if (logged.has(key)) continue;
    bonus += 12;
    next.messages.push({
      id: "missed-" + key, role: "rival", kind: "missed", day: key,
      text: "No session logged that day. My simulated score gains 12 XP.",
    });
  }
  next.rivalXP = (Number(next.rivalXP) || 0) + bonus;
  next.lastSyncedDay = today;
  next.messages = next.messages.slice(-100);
  return next;
}

export async function readGame() {
  const [rawRival, rawState] = await Promise.all([
    AsyncStorage.getItem(RIVAL_KEY), AsyncStorage.getItem(LOG_KEY),
  ]);
  if (!rawRival) return { rival: null, state: emptyState() };
  let rival = JSON.parse(rawRival);
  // Older installs did not have timed arcs. Start a new 14-day arc on upgrade.
  if (!rival.durationDays) {
    rival = { ...rival, durationDays: 14, createdAt: Date.now() };
    await AsyncStorage.setItem(RIVAL_KEY, JSON.stringify(rival));
  }
  const state = normalize(rawState ? JSON.parse(rawState) : null);
  const updated = syncMissedDays(rival, state);
  if (updated.rivalXP !== state.rivalXP || updated.lastSyncedDay !== state.lastSyncedDay) {
    await saveState(updated);
  }
  return { rival, state: updated };
}

export async function createGame({ name, sport, personality, durationDays }) {
  const cleanName = String(name || "").trim().slice(0, 30);
  if (!cleanName) throw new Error("Name your rival first.");
  const rival = {
    name: cleanName, sport, personality, durationDays: Number(durationDays) || 14,
    createdAt: Date.now(), level: 1, xp: 0,
  };
  const state = emptyState();
  state.messages = [{
    id: "intro-" + Date.now(), role: "rival", kind: "intro", day: dayKey(),
    text: "Your arc starts now. Log a real training session. I'll compete on the scoreboard.",
  }];
  await AsyncStorage.multiSet([
    [RIVAL_KEY, JSON.stringify(rival)], [LOG_KEY, JSON.stringify(state)],
  ]);
  await AsyncStorage.removeItem(OLD_ARC_KEY);
  return { rival, state };
}

export async function saveState(state) {
  await AsyncStorage.setItem(LOG_KEY, JSON.stringify({
    ...state,
    sessions: (state.sessions || []).slice(-250),
    messages: (state.messages || []).slice(-100),
  }));
}

export function recordTraining(rival, state, entry, today = dayKey()) {
  const minutes = Number(entry.minutes);
  if (!Number.isInteger(minutes) || minutes < 5 || minutes > 360) {
    throw new Error("Enter 5–360 whole minutes.");
  }
  if (getStatus(rival, state, today).ended) throw new Error("This arc is finished.");
  const firstToday = !(state.sessions || []).some((s) => s.day === today);
  const xp = firstToday ? 20 + Math.min(20, Math.floor(minutes / 15) * 5) : 5;
  const opponentXP = firstToday ? 24 + Math.min(16, Math.floor(minutes / 20) * 4) : 5;
  const factors = { aggressive: 1.15, mocking: 1.1, cold: 1.06, respectful: 0.98 };
  const rivalMinutes = Math.round(minutes * (factors[rival.personality] || 1.08));
  const activity = String(entry.activity || "Training").trim().slice(0, 45) || "Training";
  const detail = String(entry.detail || "").trim().slice(0, 280);
  const id = String(Date.now()) + "-" + state.sessions.length;
  const session = { id, day: today, activity, minutes, detail, xp, opponentXP, rivalMinutes };
  const userText = activity + " · " + minutes + " min" + (detail ? " — " + detail : "");
  const opponentText = "Simulated rival: " + rivalMinutes + " min " +
    activity.toLowerCase() + ". +" + opponentXP + " XP. What's next?";
  const next = {
    ...state,
    sessions: [...(state.sessions || []), session],
    messages: [
      ...(state.messages || []),
      { id: id + "-you", role: "you", kind: "training", day: today, text: userText },
      { id: id + "-rival", role: "rival", kind: "counter", day: today, text: opponentText },
    ].slice(-100),
    playerXP: (Number(state.playerXP) || 0) + xp,
    rivalXP: (Number(state.rivalXP) || 0) + opponentXP,
  };
  next.bestStreak = Math.max(next.bestStreak || 0, getStatus(rival, next, today).streak);
  return { next, session };
}

export function addMessage(state, role, text) {
  return {
    ...state,
    messages: [...(state.messages || []), {
      id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 9),
      role, kind: "chat", day: dayKey(), text: String(text).slice(0, 1400),
    }].slice(-100),
  };
}

export function buildMemory(rival, state) {
  const status = getStatus(rival, state);
  const recent = (state.sessions || []).slice(-5);
  const last = recent[recent.length - 1];
  return {
    goals: ["Train consistently in " + rival.sport, "Finish " + status.durationDays + "-day arc"],
    streak: status.streak, missedDays14: status.missedDays14,
    lastPromise: (state.messages || []).filter(
      (m) => m.role === "you" && /\b(i will|i'll|tomorrow)\b/i.test(m.text)
    ).slice(-1)[0]?.text || "",
    lastAction: last ? last.activity + ": " + last.minutes + " minutes (" + last.day + ")" : "",
    recentSessions: recent.map((s) => s.day + " " + s.activity + " " + s.minutes + " minutes"),
    playerXP: status.playerXP, rivalXP: status.rivalXP, daysLeft: status.daysLeft,
  };
}
