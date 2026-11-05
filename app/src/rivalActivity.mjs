// Deterministic fictional routine: pure functions, no background process or real exercise.
const BLOCK_MS = 30 * 60 * 1000;
const ACTIVITIES = [
  { key: "studying", label: "Studying", emoji: "📚", points: 12 },
  { key: "training", label: "Virtual workout", emoji: "🏋️", points: 10 },
  { key: "practicing", label: "Practicing skills", emoji: "🎯", points: 9 },
  { key: "resting", label: "Resting", emoji: "🌙", points: 0 },
  { key: "relaxing", label: "Taking a break", emoji: "☕", points: 0 }
];
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function activityForBlock(id, block) {
  const time = new Date(block * BLOCK_MS);
  const hour = time.getHours();
  if (hour < 7 || hour >= 23) return ACTIVITIES[3];
  const roll = hash(String(id) + ":" + Math.floor(block / 48) + ":" + (block % 48)) % 100;
  if (roll < 38) return ACTIVITIES[0];
  if (roll < 65) return ACTIVITIES[1];
  if (roll < 82) return ACTIVITIES[2];
  return ACTIVITIES[4];
}
export function getRivalActivity(rival, timestamp = Date.now()) {
  const now = Number.isFinite(timestamp) ? timestamp : Date.now();
  const id = String(rival?.id || rival?.name || "rival");
  const block = Math.floor(now / BLOCK_MS);
  const activity = activityForBlock(id, block);
  const startedAt = block * BLOCK_MS;
  const endsAt = startedAt + BLOCK_MS;
  // Summary is bounded to the last 24h, calculated without accumulating a mutable counter.
  const last24h = { studying: 0, training: 0, practicing: 0 };
  let points24h = 0;
  for (let b = block - 47; b <= block; b++) {
    const a = activityForBlock(id, b);
    if (Object.prototype.hasOwnProperty.call(last24h, a.key)) last24h[a.key] += 30;
    points24h += a.points;
  }
  return {
    key: activity.key, label: activity.label, emoji: activity.emoji,
    startedAt, endsAt, minutesRemaining: Math.ceil((endsAt - now) / 60000),
    last24h, points24h, simulated: true
  };
}
