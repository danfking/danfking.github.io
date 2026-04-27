# HN auto-submit

Submits a URL to Hacker News at a precise UTC time, driven by a GitHub Actions cron.

## One-time setup

### 1. Export your HN session cookie

1. Log in to https://news.ycombinator.com in a browser.
2. Open DevTools, go to **Application** (Chrome) or **Storage** (Firefox) → **Cookies** → `news.ycombinator.com`.
3. Copy the **Value** of the cookie named `user`. It looks like `yourname&hash...`.

The cookie does not expire for many months, but if you log out of HN it is invalidated. Re-export if a workflow run reports auth failure.

### 2. Set repository secrets

In `https://github.com/danfking/danfking.github.io/settings/secrets/actions`, add:

| Secret        | Value                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------- |
| `HN_COOKIE`   | The cookie value from step 1                                                             |
| `HN_USERNAME` | Your HN username, used to verify the cookie session is alive                             |
| `HN_TITLE`    | The submission title, e.g. `Show HN: I analysed 188k Show HN posts to find what works`   |
| `POST_URL`    | `https://danfking.github.io/blog/2026/04/23/show-hn-by-the-numbers/`                     |

### 3. Rehearse with a dry-run

Go to **Actions** → **Submit Show HN to Hacker News** → **Run workflow**. Leave `dry_run` checked. The job will:

- Verify the post URL returns 200
- Check HN for prior submission of the URL (Algolia)
- Log into HN with your cookie
- Fill the form
- Take a screenshot
- Open a GitHub issue with the result and link to the screenshot artifact

Look at the issue and the screenshot. If the form looks right, you are ready.

## Production run

The cron is `30 23 3 5 *` — fires at 23:30 UTC on May 3, which is the Sunday before the target Monday May 4 00:00 UTC slot. The script then sleeps until exactly 00:00 UTC and submits.

You don't need to do anything for the cron to fire. The Algolia pre-flight ensures a re-run cannot double-submit.

To submit on a different date, edit `TARGET_TIME_UTC` and the cron in `.github/workflows/hn-submit.yml`.

## Manual production submit

If you want to submit immediately rather than wait for the cron:

1. **Actions** → **Submit Show HN to Hacker News** → **Run workflow**
2. Uncheck `dry_run`
3. Check `submit_now`

## Disabling

After a successful submission, disable the workflow in **Actions** → **Submit Show HN to Hacker News** → `...` → **Disable workflow**, so the cron does not fire on May 3 of subsequent years.

## What the script does

See `submit.js`. The interesting bits:

- Pre-flight URL check, so a broken Pages deploy aborts the run before submitting.
- Pre-flight Algolia check, so a re-run after a successful submission is a no-op.
- Cookie auth (no password, no captcha trigger, no 2FA).
- Precise wait until `TARGET_TIME_UTC` after pre-flights pass, so the submit click happens within seconds of the target.
- Screenshots before and after submit, uploaded as workflow artifacts for forensics.

## What can go wrong

| Failure                                  | Symptom                                          | Fix                                                 |
| ---------------------------------------- | ------------------------------------------------ | --------------------------------------------------- |
| Cookie expired                           | Job lands on `/login` instead of `/submit`        | Re-export cookie, update `HN_COOKIE` secret         |
| HN renamed a form field                  | `page.fill` selector throws                       | Inspect screenshot, update selector in `submit.js`  |
| Pages build broke                        | Pre-flight URL check fails                        | Fix the post markdown, push, re-run workflow        |
| GH Actions cron drift exceeds 30 minutes | Job starts after 00:00 UTC                        | Script logs drift; consider widening lead next time |
