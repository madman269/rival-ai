import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "RIVAL_AI_V2_RIVALS";
const OLD = "RIVAL_AI_CURRENT_RIVAL";
export async function getRivals() {
  const data = await AsyncStorage.getItem(KEY);
  if (data) { try { return JSON.parse(data); } catch { return []; } }
  const legacy = await AsyncStorage.getItem(OLD);
  if (!legacy) return [];
  try {
    const r = JSON.parse(legacy);
    const migrated = [{...r, id: "legacy-" + (r.createdAt || Date.now()), aggression: 65, description: "", avatarUri: null}];
    await AsyncStorage.setItem(KEY, JSON.stringify(migrated));
    return migrated;
  } catch { return []; }
}
export async function saveRival(rival) {
  const rivals = await getRivals();
  await AsyncStorage.setItem(KEY, JSON.stringify([...rivals, rival]));
}
export async function getHistory(id) {
  try { return JSON.parse((await AsyncStorage.getItem("RIVAL_AI_V2_CHAT_" + id)) || "[]"); }
  catch { return []; }
}
export async function saveHistory(id, messages) {
  await AsyncStorage.setItem("RIVAL_AI_V2_CHAT_" + id, JSON.stringify(messages.slice(-100)));
}
