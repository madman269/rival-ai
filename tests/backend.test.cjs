const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { createServer } = require("node:net");
const { resolve } = require("node:path");

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((resolvePort, reject) => {
  const server = createServer();
  server.once("error", reject);
  server.listen(0, "127.0.0.1", () => {
    const port = server.address().port;
    server.close(() => resolvePort(port));
  });
});

test("backend health, input validation and missing-key behavior", { timeout: 15000 }, async () => {
  const port = await freePort();
  const api = "http://127.0.0.1:" + port;
  const child = spawn(process.execPath, [resolve(__dirname, "../backend/index.js")], {
    cwd: resolve(__dirname, "../backend"),
    env: { ...process.env, OPENAI_API_KEY: "", PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (s) => { output += s; });
  child.stderr.on("data", (s) => { output += s; });
  try {
    let live = false;
    for (let i = 0; i < 80; i++) {
      if (child.exitCode !== null) throw new Error("Backend crashed: " + output);
      try {
        const response = await fetch(api + "/health");
        if (response.ok) { live = true; break; }
      } catch { /* still starting */ }
      await delay(100);
    }
    assert.ok(live, "Backend should start and serve /health. " + output);
    const health = await (await fetch(api + "/health")).json();
    assert.equal(health.ok, true);
    assert.equal(health.aiConfigured, false);

    const send = (body) => fetch(api + "/rival/respond", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });

    const invalid = await send({ rivalId: "TYRANT", userText: "" });
    assert.equal(invalid.status, 400);
    assert.match((await invalid.json()).error, /message/i);

    const tooLong = await send({ userText: "A".repeat(1401) });
    assert.equal(tooLong.status, 400);

    const offline = await send({ rivalId: "TYRANT", userText: "I worked out for half an hour" });
    assert.equal(offline.status, 503);
    assert.match((await offline.json()).error, /not configured/i);
  } finally {
    child.kill("SIGTERM");
    await delay(150);
    if (child.exitCode === null) child.kill("SIGKILL");
  }
});
