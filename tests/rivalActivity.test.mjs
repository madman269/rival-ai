import test from "node:test";
import assert from "node:assert/strict";
import { getRivalActivity } from "../app/src/rivalActivity.mjs";

const rival = { id: "rival-a", name: "Kai" };
test("same rival and time produce the same routine", () => {
  const at = new Date(2026, 10, 5, 13, 12).getTime();
  assert.deepEqual(getRivalActivity(rival, at), getRivalActivity(rival, at));
});
test("routine records only simulated activity with bounded time", () => {
  const a = getRivalActivity(rival, new Date(2026, 10, 5, 13, 12).getTime());
  assert.equal(a.simulated, true);
  assert.ok(["studying", "training", "practicing", "resting", "relaxing"].includes(a.key));
  assert.ok(a.minutesRemaining >= 1 && a.minutesRemaining <= 30);
  assert.equal(a.endsAt - a.startedAt, 30 * 60 * 1000);
});
test("summary is finite and has nonnegative totals", () => {
  const a = getRivalActivity(rival, Date.now());
  for (const minutes of Object.values(a.last24h)) {
    assert.ok(Number.isInteger(minutes) && minutes >= 0 && minutes <= 1440);
  }
  assert.ok(Number.isInteger(a.points24h) && a.points24h >= 0);
});
test("different rivals maintain independent deterministic identities", () => {
  const at = new Date(2026, 10, 5, 13, 12).getTime();
  const x = getRivalActivity({id:"a"}, at);
  const y = getRivalActivity({id:"b"}, at);
  assert.deepEqual(x, getRivalActivity({id:"a"}, at));
  assert.deepEqual(y, getRivalActivity({id:"b"}, at));
});
