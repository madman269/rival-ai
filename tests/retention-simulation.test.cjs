/**
 * Ten SIMULATED personas. Their return days are scripted inputs, not forecasts.
 * Tests gameplay/streak/scoring behavior over a virtual seven-day arc.
 * Run: node --test tests/retention-simulation.test.cjs
 */
const { test, before } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync, mkdirSync, writeFileSync } = require("node:fs");
const { resolve, dirname } = require("node:path");

let game;
const startISO = "2026-10-10T12:00:00.000Z";
const startMs = Date.parse(startISO);
const day = (n) => new Date(startMs + n * 86400000).toISOString().slice(0, 10);
const personas = [
  { name: "Daily Dev", type: "consistent", personality: "aggressive", days: [0,1,2,3,4,5,6], minutes: 40, resultsVisit: true },
  { name: "Driven Dee", type: "consistent", personality: "cold", days: [0,1,2,3,4,5,6], minutes: 60, resultsVisit: true },
  { name: "Weekend Wes", type: "weekend", personality: "respectful", days: [0,5,6], minutes: 45, resultsVisit: true },
  { name: "Busy Bea", type: "every-other-day", personality: "mocking", days: [0,2,4,6], minutes: 30, resultsVisit: true },
  { name: "Comeback Cam", type: "returns-after-gap", personality: "cold", days: [0,3,4,6], minutes: 45, resultsVisit: true },
  { name: "Early Exit Eli", type: "early-churn", personality: "aggressive", days: [0], minutes: 15, resultsVisit: false },
  { name: "Two-Day Tay", type: "early-churn", personality: "mocking", days: [0,1], minutes: 20, resultsVisit: false },
  { name: "Streak Sam", type: "consistent", personality: "respectful", days: [0,1,2,3,4,5,6], minutes: 30, resultsVisit: true },
  { name: "Rapid Riley", type: "multiple-sessions", personality: "aggressive", days: [0,1,2,3,4,5,6], minutes: 20, extraSessions: 2, resultsVisit: true },
  { name: "Short-Session Sky", type: "short-session", personality: "mocking", days: [0,2,5], minutes: 10, resultsVisit: false },
];

before(async () => {
  globalThis.__SIM_STORAGE__ = {};
  const source = readFileSync(resolve(__dirname, "../lib/rivalGame.js"), "utf8");
  const patched = source.replace(
    'import AsyncStorage from "@react-native-async-storage/async-storage";',
    "const AsyncStorage = globalThis.__SIM_STORAGE__;"
  );
  assert.notEqual(patched, source, "Source should mock storage only");
  game = await import("data:text/javascript;base64," + Buffer.from(patched).toString("base64"));
});

test("10 synthetic personas traverse a seven-day season with correct XP and streaks", () => {
  const rows = [];
  const findings = [];
  for (const p of personas) {
    const rival = {
      name: "Shadow", sport: "gym", personality: p.personality, durationDays: 7, createdAt: startMs,
    };
    let state = { sessions: [], messages: [], playerXP: 0, rivalXP: 0, lastSyncedDay: day(0), bestStreak: 0 };
    const visitedDays = [];
    let lastState;
    for (let d = 0; d < 7; d++) {
      // Only open the app on dates listed in the persona's input schedule.
      if (!p.days.includes(d)) continue;
      const today = day(d);
      visitedDays.push(d);
      state = game.syncMissedDays(rival, state, today);
      state = game.recordTraining(rival, state, {
        activity: "Workout", minutes: p.minutes, detail: "Synthetic exercise entry",
      }, today).next;
      for (let n = 0; n < (p.extraSessions || 0); n++) {
        state = game.recordTraining(rival, state, {
          activity: "Additional training", minutes: p.minutes,
        }, today).next;
      }
      // Simulate storing local state and reopening; no data may disappear.
      state = JSON.parse(JSON.stringify(state));
      const snapshot = game.getStatus(rival, state, today);
      assert.equal(snapshot.trainedDays, visitedDays.length, p.name + " distinct active days");
      assert.ok(snapshot.playerXP >= 0 && snapshot.rivalXP >= 0);
      assert.ok(snapshot.daysLeft > 0, "Arc not over before day 7");
      assert.ok(snapshot.streak <= visitedDays.length, "Streak cannot exceed visits");
      lastState = state;
    }
    // End-of-arc projection is computed even if persona would not actually revisit.
    const projected = game.syncMissedDays(rival, state, day(7));
    const final = game.getStatus(rival, projected, day(7));
    assert.equal(final.ended, true, p.name + " should finish after 7 days");
    assert.equal(final.daysLeft, 0);
    assert.equal(final.trainedDays, p.days.length);
    assert.equal(projected.sessions.length, p.days.length * (1 + (p.extraSessions || 0)));
    assert.equal(projected.messages.filter((m) => m.kind === "missed").length, 7 - p.days.length);
    const repeat = game.syncMissedDays(rival, projected, day(7));
    assert.equal(repeat.rivalXP, projected.rivalXP, "Missed day XP must not be double credited");
    assert.throws(() => game.recordTraining(rival, projected, { minutes: 30 }, day(7)), /finished/);
    const row = {
      persona: p.name, playStyle: p.type, arcDaysLogged: p.days.length,
      activeDays: p.days.map((d) => day(d)),
      simulatedDay1Return: p.days.includes(1),
      simulatedDay7ResultsReturn: p.resultsVisit,
      everyDayActive: p.days.length === 7,
      maxStreak: state.bestStreak,
      playerXP: final.playerXP, rivalXP: final.rivalXP,
      outcome: final.outcome,
      lastPlayedDay: day(p.days[p.days.length - 1]),
      scoreIfGameOpenedOnDay7: p.resultsVisit ? "visible" : "not seen by fictional player",
    };
    if (p.days.length === 7 && final.outcome === "DEFEAT") {
      findings.push(p.name + " trained all seven days but lost: check whether rival XP feels fair.");
    }
    if (p.extraSessions && final.playerXP - final.rivalXP === game.getStatus(rival, lastState, day(6)).lead) {
      findings.push(p.name + " could not close a score gap by logging additional legitimate sessions.");
    }
    rows.push(row);
  }
  assert.equal(rows.length, 10);
  const summary = {
    kind: "SYNTHETIC TEST ONLY — NOT REAL USER RETENTION",
    cohort: 10,
    days: 7,
    day1ReturnScripted: rows.filter((r) => r.simulatedDay1Return).length,
    day7ReturnScripted: rows.filter((r) => r.simulatedDay7ResultsReturn).length,
    allSevenTrainingDaysScripted: rows.filter((r) => r.everyDayActive).length,
    victories: rows.filter((r) => r.outcome === "VICTORY").length,
    defeats: rows.filter((r) => r.outcome === "DEFEAT").length,
    draws: rows.filter((r) => r.outcome === "DRAW").length,
    potentialRetentionFriction: findings,
    players: rows,
  };
  const file = resolve(__dirname, "../test-results/simulated-cohort.json");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(summary, null, 2) + "\n");
  console.log("SIMULATED COHORT REPORT");
  console.log(JSON.stringify({
    cohort: summary.cohort, day1ReturnScripted: summary.day1ReturnScripted,
    day7ReturnScripted: summary.day7ReturnScripted,
    allSevenTrainingDaysScripted: summary.allSevenTrainingDaysScripted,
    outcomes: [summary.victories, summary.defeats, summary.draws],
    findings: summary.potentialRetentionFriction,
  }, null, 2));
});
