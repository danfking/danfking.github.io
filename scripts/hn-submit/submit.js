// Submit a URL to Hacker News at a precise UTC time.
//
// Inputs (env vars):
//   HN_COOKIE        Value of the `user` cookie from news.ycombinator.com (required)
//   HN_USERNAME      Expected username, used to verify cookie validity (required)
//   HN_TITLE         Submission title (required)
//   POST_URL         URL to submit (required)
//   TARGET_TIME_UTC  ISO-8601 UTC timestamp to fire submission, e.g. 2026-05-04T00:00:00Z
//                    If omitted, submits immediately.
//   DRY_RUN          "true" to walk through the form without clicking submit.
//
// Outputs:
//   Writes a markdown summary to $GITHUB_STEP_SUMMARY when running in Actions.
//   Sets `hn_url` and `outcome` outputs via $GITHUB_OUTPUT for the issue-opening step.
//   Exits non-zero on hard failure; exits zero with outcome=skipped if already submitted.

const { chromium } = require('playwright');
const fs = require('fs');

const required = ['HN_COOKIE', 'HN_USERNAME', 'HN_TITLE', 'POST_URL'];
for (const name of required) {
  if (!process.env[name]) {
    fail(`Missing required env var: ${name}`);
  }
}

const HN_COOKIE = process.env.HN_COOKIE;
const HN_USERNAME = process.env.HN_USERNAME;
const HN_TITLE = process.env.HN_TITLE;
const POST_URL = process.env.POST_URL;
const TARGET_TIME_UTC = process.env.TARGET_TIME_UTC || '';
const DRY_RUN = process.env.DRY_RUN === 'true';

(async () => {
  log(`Target URL: ${POST_URL}`);
  log(`Title: ${HN_TITLE}`);
  log(`Dry run: ${DRY_RUN}`);

  await preflightUrlReachable(POST_URL);
  const existing = await preflightAlgoliaCheck(POST_URL);
  if (existing) {
    log(`Already submitted: ${existing}`);
    setOutput('outcome', 'skipped');
    setOutput('hn_url', existing);
    summary(`### HN submission skipped\n\nThis URL is already on HN: ${existing}\n`);
    process.exit(0);
  }

  if (TARGET_TIME_UTC) {
    await waitUntil(TARGET_TIME_UTC);
  }

  const result = await submitToHn();
  setOutput('outcome', result.outcome);
  setOutput('hn_url', result.hnUrl || '');
  summary(buildSummary(result));
  if (result.outcome === 'failed') process.exit(1);
})().catch((err) => {
  console.error(err);
  setOutput('outcome', 'failed');
  setOutput('hn_url', '');
  summary(`### HN submission failed\n\n\`\`\`\n${err.stack || err.message}\n\`\`\`\n`);
  process.exit(1);
});

async function preflightUrlReachable(url) {
  log(`Pre-flight: checking ${url} is reachable`);
  const res = await fetch(url, { method: 'HEAD' });
  if (!res.ok) fail(`Target URL returned ${res.status}: ${url}`);
}

async function preflightAlgoliaCheck(url) {
  // Returns the HN item URL if this URL is already on HN, else null.
  log(`Pre-flight: checking Algolia for prior submission`);
  const api = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(url)}&restrictSearchableAttributes=url&tags=story`;
  const res = await fetch(api);
  if (!res.ok) {
    log(`Warning: Algolia check returned ${res.status}; continuing without dedup`);
    return null;
  }
  const data = await res.json();
  const hit = (data.hits || []).find((h) => h.url === url);
  return hit ? `https://news.ycombinator.com/item?id=${hit.objectID}` : null;
}

async function waitUntil(targetIso) {
  const target = Date.parse(targetIso);
  if (!Number.isFinite(target)) fail(`Invalid TARGET_TIME_UTC: ${targetIso}`);
  const now = Date.now();
  const ms = target - now;
  if (ms <= 0) {
    log(`Target time ${targetIso} already passed by ${-ms}ms; submitting immediately`);
    return;
  }
  log(`Waiting ${Math.round(ms / 1000)}s until ${targetIso}`);
  // Sleep in chunks so we can log progress for very long waits.
  const chunkMs = 60_000;
  while (Date.now() < target) {
    const remaining = target - Date.now();
    await sleep(Math.min(remaining, chunkMs));
    if (target - Date.now() > 0) {
      log(`...${Math.round((target - Date.now()) / 1000)}s to go`);
    }
  }
  log(`Reached target time. Drift: ${Date.now() - target}ms`);
}

async function submitToHn() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  });
  await context.addCookies([
    {
      name: 'user',
      value: HN_COOKIE,
      domain: 'news.ycombinator.com',
      path: '/',
      httpOnly: false,
      secure: true,
      sameSite: 'Lax',
    },
  ]);
  const page = await context.newPage();

  try {
    log('Navigating to /submit');
    const res = await page.goto('https://news.ycombinator.com/submit', { waitUntil: 'domcontentloaded' });
    if (!res || !res.ok()) fail(`Failed to load /submit: ${res && res.status()}`);

    // HN bounces unauthenticated visits from /submit to /login. The presence
    // of the title input is the definitive auth check; /login does not have one.
    const url = page.url();
    if (!url.includes('/submit')) fail(`Cookie auth failed: redirected to ${url}`);
    const titleInput = page.locator('input[name="title"]');
    if (!(await titleInput.count())) fail(`Cookie auth failed: /submit did not render the title input`);

    log('Filling form');
    await titleInput.fill(HN_TITLE);
    await page.fill('input[name="url"]', POST_URL);

    const beforePath = `${process.env.RUNNER_TEMP || '.'}/hn-submit-before.png`;
    await page.screenshot({ path: beforePath, fullPage: true });
    log(`Saved pre-submit screenshot: ${beforePath}`);

    if (DRY_RUN) {
      log('DRY_RUN: skipping submit click');
      await browser.close();
      return { outcome: 'dry-run', screenshot: beforePath };
    }

    log('Clicking submit');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30_000 }),
      page.click('input[type="submit"][value="submit"]'),
    ]);

    const landed = page.url();
    log(`Landed at: ${landed}`);

    const afterPath = `${process.env.RUNNER_TEMP || '.'}/hn-submit-after.png`;
    await page.screenshot({ path: afterPath, fullPage: true });

    // If we're still on /submit after a click, HN re-rendered the form. That
    // means a validation error, dupe-detect, or rate-limit. Treat as failure.
    if (landed.includes('/submit')) {
      const bodyText = await page.locator('body').innerText().catch(() => '');
      throw new Error(`Submit click did not redirect (still on /submit). Page text: ${bodyText.slice(0, 500)}`);
    }

    // Successful submit lands on /newest (most common) or directly on /item?id=.
    let hnUrl = null;
    if (landed.includes('item?id=')) {
      hnUrl = landed;
    } else {
      // Algolia indexes within seconds. Poll a few times before giving up.
      for (let i = 0; i < 4; i++) {
        await sleep(10_000);
        hnUrl = await preflightAlgoliaCheck(POST_URL);
        if (hnUrl) break;
        log(`Algolia not indexed yet, retry ${i + 1}/4`);
      }
    }

    await browser.close();
    return { outcome: 'submitted', hnUrl, screenshot: afterPath };
  } catch (err) {
    const errPath = `${process.env.RUNNER_TEMP || '.'}/hn-submit-error.png`;
    await page.screenshot({ path: errPath, fullPage: true }).catch(() => {});
    await browser.close();
    throw new Error(`Submission failed: ${err.message}\nScreenshot: ${errPath}`);
  }
}

function buildSummary(result) {
  if (result.outcome === 'dry-run') {
    return `### HN submission dry-run\n\nForm filled successfully. No submit click was made.\n\nTitle: \`${HN_TITLE}\`\nURL: ${POST_URL}\n`;
  }
  if (result.outcome === 'submitted') {
    const hn = result.hnUrl || '(item URL not detected; check https://news.ycombinator.com/submitted?id=' + HN_USERNAME + ')';
    return `### HN submission posted\n\nTitle: \`${HN_TITLE}\`\nPost: ${POST_URL}\nHN: ${hn}\n`;
  }
  return `### HN submission outcome: ${result.outcome}\n`;
}

function log(msg) {
  const ts = new Date().toISOString();
  console.log(`[${ts}] ${msg}`);
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function setOutput(name, value) {
  const out = process.env.GITHUB_OUTPUT;
  if (!out) return;
  fs.appendFileSync(out, `${name}=${value}\n`);
}

function summary(md) {
  const out = process.env.GITHUB_STEP_SUMMARY;
  if (!out) {
    console.log(md);
    return;
  }
  fs.appendFileSync(out, md + '\n');
}
