const { test, before, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { resolve } = require("node:path");

const contents = new Map();
const storage = {
  async getItem(key) { return contents.get(key) ?? null; },
  async setItem(key, value) { contents.set(key, String(value)); },
  async removeItem(key) { contents.delete(key); },
  async multiSet(entries) { for (const [key, value] of entries) contents.set(key, String(value)); },
};
let rules;

before(async () => {
  globalThis.__RIVAL_TEST_STORAGE__ = storage;
  const path = resolve(__dirname, "../lib/rivalGame.js");
  const source = readFileSync(path, "utf8");
  const replaced = source.replace(
    'import AsyncStorage from "@react-native-async-storage/async-storage";',
    "const AsyncStorage = globalThis.__RIVAL_TEST_STORAGE__;"
  );
  assert.notEqual(source, replaced, "Test must exercise the real game logic module");
  rules = await import("data:text/javascript;base64," + Buffer.from(replaced).toString("base64"));
});
beforeEach(() => contents.clear());

const fixedRival = (date = "2026-10-10T12:00:00Z", durationDays = 7) => ({
  name: "Shadow", sport: "gym", personality: "aggressive",
  createdAt: new Date(date).getTime(), durationDays,
});
const empty = (lastSyncedDay = "2026-10-10") => ({
  sessions: [], messages: [], playerXP: 0, rivalXP: 0, lastSyncedDay, bestStreak: 0,
});

test("new users start without a rival", async () => {
  const loaded = await rules.readGame();
  assert.equal(loaded.rival, null);
  assert.equal(loaded.state.playerXP, 0);
});

test("creates rival, saves device state, and reloads it", async () => {
  const { rival } = await rules.createGame({ name: "  Shadow  ", sport: "gym", personality: "cold", durationDays: 14 });
  assert.equal(rival.name, "Shadow");
  assert.equal(rival.durationDays, 14);
  const reloaded = await rules.readGame();
  assert.equal(reloaded.rival.name, "Shadow");
  assert.equal(reloaded.state.sessions.length, 0);
  assert.equal(reloaded.state.messages.length, 1);
  assert.ok(contents.has(rules.RIVAL_KEY));
  assert.ok(contents.has(rules.LOG_KEY));
});

test("rejects an unnamed rival", async () => {
  await assert.rejects(
    rules.createGame({ name: " ", sport: "gym", personality: "cold", durationDays: 7 }),
    /Name your rival/
  );
});

test("first thirty-minute workout creates player and simulated rival XP", () => {
  const rival = fixedRival();
  const { next, session } = rules.recordTraining(rival, empty(), { activity: "Gym", minutes: 30, detail: "Bench" }, "2026-10-10");
  assert.equal(next.playerXP, 30);
  assert.equal(next.rivalXP, 28);
  assert.equal(session.rivalMinutes, 35);
  assert.equal(next.sessions.length, 1);
  assert.equal(next.bestStreak, 1);
  assert.equal(next.messages.length, 2);
  assert.match(next.messages[1].text, /Simulated rival/);
});

test("additional workouts same day score five XP each", () => {
  const rival = fixedRival();
  const first = rules.recordTraining(rival, empty(), { activity: "Gym", minutes: 30 }, "2026-10-10").next;
  const second = rules.recordTraining(rival, first, { activity: "Cycling", minutes: 60 }, "2026-10-10").next;
  assert.equal(second.playerXP, first.playerXP + 5);
  assert.equal(second.rivalXP, first.rivalXP + 5);
  assert.equal(second.sessions.length, 2);
});

test("bad workout durations do not award XP", () => {
  for (const minutes of [0, 4, 361, 10.5, NaN]) {
    assert.throws(
      () => rules.recordTraining(fixedRival(), empty(), { minutes }, "2026-10-10"),
      /5–360/
    );
  }
});

test("save and reload workout and rival chat", async () => {
  const { rival, state } = await rules.createGame({ name: "Shadow", sport: "gym", personality: "aggressive", durationDays: 7 });
  const today = rules.dayKey();
  const { next } = rules.recordTraining(rival, state, { activity: "Strength", minutes: 45 }, today);
  const withChat = rules.addMessage(next, "you", "I'll train tomorrow.");
  await rules.saveState(withChat);
  const reloaded = await rules.readGame();
  assert.equal(reloaded.state.sessions.length, 1);
  assert.equal(reloaded.state.playerXP, 35);
  assert.ok(reloaded.state.messages.some((m) => m.text.includes("I'll train tomorrow")));
  assert.match(rules.buildMemory(rival, reloaded.state).lastPromise, /tomorrow/);
});

test("two consecutive days make a two-day streak", () => {
  const rival = fixedRival();
  const first = rules.recordTraining(rival, empty(), { minutes: 30 }, "2026-10-10").next;
  const second = rules.recordTraining(rival, first, { minutes: 20 }, "2026-10-11").next;
  const status = rules.getStatus(rival, second, "2026-10-12");
  assert.equal(status.streak, 2, "yesterday's streak remains valid before training today");
  assert.equal(status.trainedDays, 2);
});

test("missed days award rival exactly once, without penalizing logged days", () => {
  const rival = fixedRival();
  const first = rules.recordTraining(rival, empty(), { minutes: 30 }, "2026-10-10").next;
  const missed = rules.syncMissedDays(rival, first, "2026-10-13");
  assert.equal(missed.rivalXP, first.rivalXP + 24);
  assert.equal(missed.messages.filter((m) => m.kind === "missed").length, 2);
  const again = rules.syncMissedDays(rival, missed, "2026-10-13");
  assert.equal(again.rivalXP, missed.rivalXP);
  assert.equal(again.messages.length, missed.messages.length);
});

test("arc closes on time and blocks new training", () => {
  const rival = fixedRival("2026-10-10T12:00:00Z", 7);
  const state = empty();
  const final = rules.getStatus(rival, state, "2026-10-17");
  assert.equal(final.ended, true);
  assert.equal(final.daysLeft, 0);
  assert.throws(() => rules.recordTraining(rival, state, { minutes: 30 }, "2026-10-17"), /finished/);
});

test("result chooses winner from actual versus simulated points", () => {
  const rival = fixedRival();
  assert.equal(rules.getStatus(rival, { ...empty(), playerXP: 50, rivalXP: 20 }, "2026-10-10").outcome, "VICTORY");
  assert.equal(rules.getStatus(rival, { ...empty(), playerXP: 20, rivalXP: 50 }, "2026-10-10").outcome, "DEFEAT");
  assert.equal(rules.getStatus(rival, { ...empty(), playerXP: 20, rivalXP: 20 }, "2026-10-10").outcome, "DRAW");
});

test("migrates an older rival without destroying its previous logs", async () => {
  await storage.setItem(rules.RIVAL_KEY, JSON.stringify({ name: "Original", sport: "gym", personality: "cold", createdAt: 100 }));
  await storage.setItem(rules.LOG_KEY, JSON.stringify({ logs: [{ sender: "you", text: "Legacy session", xp: 10 }], playerXP: 10 }));
  const loaded = await rules.readGame();
  assert.equal(loaded.rival.durationDays, 14);
  assert.equal(loaded.state.playerXP, 10);
  assert.equal(loaded.state.logs[0].text, "Legacy session");
});
