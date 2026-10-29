import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { getHistory, saveHistory } from "./rivalStorage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});
const KEY = "RIVAL_AI_V2_NOTIFICATIONS";
const HOURS = [10, 18];
const lines = [
  (r) => `I just started a virtual study session. You joining me, or falling behind?`,
  (r) => `Training time. I'm getting my digital reps in—what are you up to?`,
  (r) => `Hey, it's ${r.name}. Got anything interesting going on today?`,
  (r) => `Still thinking about our last conversation. How's your day going?`
];
export async function getReminderSettings() {
  try { return JSON.parse(await AsyncStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}
export async function setReminders(rival, enabled) {
  const all = await getReminderSettings();
  const previous = all[rival.id] || { ids: [], pending: [] };
  // Only cancel notifications created for this rival, never others.
  await Promise.all((previous.ids || []).map(id => Notifications.cancelScheduledNotificationAsync(id).catch(() => {})));
  const next = { enabled: false, ids: [], pending: [] };
  if (enabled) {
    let permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) throw new Error("Notifications permission was denied.");
    await Notifications.setNotificationChannelAsync?.("rival-checkins", {
      name: "Rival check-ins", importance: Notifications.AndroidImportance.DEFAULT
    });
    const now = Date.now();
    for (let day = 1; day <= 5; day++) {
      const date = new Date();
      date.setDate(date.getDate() + day);
      const hour = HOURS[day % HOURS.length];
      date.setHours(hour, 0, 0, 0);
      if (date.getTime() <= now) continue;
      const text = lines[day % lines.length](rival);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: rival.name,
          body: text,
          data: { rivalId: rival.id, kind: "rival-checkin" }
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date, channelId: "rival-checkins" }
      });
      next.ids.push(id);
      next.pending.push({ notificationId: id, at: date.getTime(), text });
    }
    next.enabled = true;
  }
  all[rival.id] = next;
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
  return next.enabled;
}
// Materialize a scheduled check-in only after its scheduled time has passed.
// This makes notifications part of the conversation on the next app open.
export async function reconcileCheckins(rivalId) {
  const all = await getReminderSettings();
  const state = all[rivalId];
  if (!state?.enabled || !state.pending?.length) return;
  const due = state.pending.filter(p => p.at <= Date.now());
  if (!due.length) return;
  const history = await getHistory(rivalId);
  const known = new Set(history.map(m => m.notificationId));
  const additions = due.filter(p => !known.has(p.notificationId)).map(p => ({
    sender: "rival", text: p.text, notificationId: p.notificationId, at: p.at
  }));
  if (additions.length) await saveHistory(rivalId, [...history, ...additions]);
  state.pending = state.pending.filter(p => p.at > Date.now());
  all[rivalId] = state;
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
}
