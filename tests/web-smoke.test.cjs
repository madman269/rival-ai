const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { existsSync, promises: fs } = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const output = path.resolve(__dirname, "../dist");
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml", ".woff": "font/woff", ".woff2": "font/woff2",
};
const serve = createServer(async (req, res) => {
  try {
    const uri = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let file = path.resolve(output, "." + uri);
    if (!file.startsWith(output + path.sep) && file !== output) {
      res.writeHead(403).end();
      return;
    }
    const candidates = [file, file + ".html", path.join(file, "index.html")];
    file = candidates.find((p) => existsSync(p) && !require("node:fs").statSync(p).isDirectory());
    if (!file) {
      if (path.extname(uri)) {
        res.writeHead(404).end();
        return;
      }
      file = path.join(output, "index.html");
    }
    const body = await fs.readFile(file);
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch (error) {
    res.writeHead(500).end(String(error));
  }
});

test("real browser: create rival, train, save, navigate and reopen", { timeout: 120000 }, async () => {
  assert.ok(existsSync(path.join(output, "index.html")), "Build Expo web output before testing");
  const chromePath = ["/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]
    .find((p) => existsSync(p));
  await new Promise((resolve) => serve.listen(0, "127.0.0.1", resolve));
  const base = "http://127.0.0.1:" + serve.address().port;
  const browser = await chromium.launch({
    headless: true,
    ...(chromePath ? { executablePath: chromePath } : {}),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  try {
    await page.goto(base, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.getByText("Meet your competition.").waitFor({ timeout: 30000 });
    await page.getByText("CREATE YOUR RIVAL").click();
    await page.getByText("Build your opponent.").waitFor({ timeout: 15000 });
    await page.getByPlaceholder("e.g. Shadow").fill("Shadow");
    await page.getByText("7 DAYS").click();
    await page.getByText("START YOUR ARC").click();
    await page.getByText("LOG TRAINING").waitFor({ timeout: 20000 });
    await page.getByPlaceholder("e.g. 45").fill("30");
    await page.getByText("CLAIM YOUR XP").click();
    await page.getByText(/Simulated rival: 35 min strength training/).waitFor({ timeout: 20000 });
    await page.screenshot({ path: path.resolve(__dirname, "../rival-ai-tested.png"), fullPage: true });
    await page.getByText("Home", { exact: false }).first().click();
    await page.getByText("CURRENT RIVAL").waitFor({ timeout: 20000 });
    await page.getByText("TRAINING LOGBOOK").first().click();
    await page.getByText("Strength training", { exact: true }).waitFor({ timeout: 15000 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByText("Strength training", { exact: true }).waitFor({ timeout: 15000 });
    await page.getByText("Back", { exact: false }).first().click();
    await page.getByText("CURRENT RIVAL").waitFor({ timeout: 15000 });
    await page.getByText("ENTER RIVAL ROOM").click();
    // A legacy deep link must preserve the current workout and XP.
    await page.goto(base + "/logs/log", { waitUntil: "domcontentloaded" });
    await page.getByText("LOG TRAINING").waitFor({ timeout: 15000 });
    await page.getByText("RIVAL CHAT").click();
    await page.getByText(/Simulated rival: 35 min strength training/).waitFor({ timeout: 15000 });
    await page.getByPlaceholder("Challenge your rival…").fill("Ready for battle");
    await page.getByText("SEND", { exact: true }).click();
    await page.getByText(/AI chat is offline/i).waitFor({ timeout: 15000 });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.getByText("RIVAL CHAT").click();
    await page.getByText("Ready for battle").waitFor({ timeout: 15000 });
    assert.equal(pageErrors.length, 0, "No unhandled browser JavaScript errors: " + pageErrors.join("; "));
  } catch (error) {
    await page.screenshot({ path: path.resolve(__dirname, "../rival-ai-failed.png"), fullPage: true }).catch(() => {});
    throw new Error(error.message + "\nBrowser exceptions: " + pageErrors.join("; "));
  } finally {
    await browser.close();
    await new Promise((resolve) => serve.close(resolve));
  }
});
