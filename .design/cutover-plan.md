# Cloudflare Pages cutover plan

Status: planned, not executed. The live site has not been changed. Written 28 October 2026 against branch `feat/terminal-redesign` (head `0c24dd6`, based on `origin/dev` `0f93e64`).

This document never contains the owner's contact address. Refer to it as "the owner's contact address".

---

## 1. Verified facts

| Fact | How it was checked |
| --- | --- |
| Pages project `hedhly-portfolio` builds `dev` and `main`. | GitHub check runs on both branches, provider "Cloudflare Workers and Pages". |
| Production branch is `dev`. | The live `/de/` is byte-identical to `origin/dev:de/index.html`. The `main` build is labelled "Branch Preview URL", while `dev` has no such line. The dashboard still needs confirming (step 0.2). |
| Current production deployment: `9dd04f66-005c-4538-babf-459033488ed6`, commit `0f93e64`, deployed 31 Jul 2026. Preview alias `9dd04f66.hedhly-portfolio.pages.dev`. | Check run `external_id` on `origin/dev`. |
| The live output serves the repository root. `README.md`, `LICENSE`, `.github/FUNDING.yml` and `website-demo-image/Thumbs.db` all return 200. | `curl` on each. |
| The live site answers 200 with the homepage for unknown paths (`/nope`, `/llms.txt`, `/.well-known/security.txt`, `/error` for the old `error.html`). | `curl`; `/error.html` returns 308 to `/error`. |
| The live site sends no security headers and loads Google Fonts from another origin. | No `_headers` on `dev`; `<link>` to `fonts.googleapis.com` in the live HTML. |
| The repository is **public**. | `gh repo view`. |
| The unpushed branch contains the owner's plaintext contact address in `.design/portfolio-modernization-plan.md` and in `test/site.test.mjs`. | `git grep` on the branch. `origin/dev` does not contain it. |
| The current `public/_headers` has no preview `noindex` rule. | Read the file. |
| Cloudflare rules: `_redirects` is always followed, even when an asset matches, and a redirect takes priority over a header. Absolute destinations are allowed. Placeholders are `:name`. The documented example host pattern is `https://:version.:project.pages.dev/*`. | Cloudflare Pages docs, read for this plan. |
| The Cloudflare docs do not state how a missing path is handled when `404.html` exists. | Docs read for this plan. Must be verified on the preview (step 3). |

---

## 2. Blockers before anything is pushed

These are listed in order. Nothing is pushed until all four are closed.

### B1. Remove the plaintext contact address from tracked files and history

The repository is public, so a push publishes the address and defeats click-to-reveal.

- Replace the address in `.design/portfolio-modernization-plan.md` with "the owner's contact address".
- In `test/site.test.mjs`, build the pattern from parts so the literal string does not appear, for example `new RegExp(['<local part>', '@', '<domain>'].join(''), 'i')` with the parts filled in only in the local test file.
- The branch's commits are local and unpushed. Rewrite them before pushing (for example `git rebase -i` or `git filter-branch --tree-filter`), then confirm that the address does not appear in any commit.
- Known limit: `src/runtime/contact-address.mjs` stores the address base64-encoded. This deters simple scrapers and nothing more, as stated in the plan.

Gate: searching the full history of the branch for the address returns nothing.

### B2. Decide whether `.design/` belongs in the public repository

`.design/` contains internal decisions, the reference teardown and the cutover itself. Pages does not publish it (the output is `dist/`), but GitHub does.

Recommendation: remove `.design/` from the repository (move it to a private location or add it to `.gitignore` and delete it from the branch) before the push. This is an owner decision.

### B3. Add preview `noindex` with the correct host pattern

Add to `public/_headers`:

```text
https://:version.:project.pages.dev/*
  X-Robots-Tag: noindex
```

The single-placeholder form `https://:project.pages.dev/*` from the earlier plan only matches the production `pages.dev` host, so branch and deployment previews would stay indexable. Verify on the preview (step 3) that the header is present, and after cutover that `hedhly.com` does not send it.

### B4. Confirm the build output directory is changed, not just the command

Pages currently publishes the repository root. Setting `dist` as the output directory is what stops `README.md`, `LICENSE`, `.github/` and the other files from being served. The verification in step 4 must show those paths returning 404.

---

## 3. Build settings (Pages dashboard, project `hedhly-portfolio`)

Change these only at cutover (step 4), not before.

| Setting | Value | Notes |
| --- | --- | --- |
| Production branch | `dev` (keep) | Keeps the change to one merge. Making `main` production is a separate decision (see §8). |
| Framework preset | None | |
| Build command | `npm run build` | Dependency-free. `package.json` declares no dependencies, so no install is needed. |
| Build output directory | `dist` | Required to stop serving repository files. |
| Root directory | empty (repository root) | |
| Node version | `.nvmrc` = `24` | If the build log shows another Node version, set the `NODE_VERSION` environment variable to `24`. `package.json` requires `>=22`. |
| Environment variables | none | |
| Preview deployments | Decide (§8) | Previews are indexable without the B3 rule. |
| Functions | none | |

Before changing any setting, record the current values in a screenshot or the dashboard's settings export, so a settings rollback is possible.

---

## 4. Pre-cutover verification on a preview (no live change)

Pushing `feat/terminal-redesign` creates a preview deployment. This is a public action, so it needs the owner's approval (§8).

1. Check the Pages build log for the preview: Node version, the `npm run build` output, and no warnings about `_headers` or `_redirects`.
2. Note the preview URL, which is `<hash>.hedhly-portfolio.pages.dev` or a branch alias. The root `/` redirects to `hedhly.com/de/` on the preview as well, so test `/de/` and `/en/` directly.
3. Status and content checks on the preview:

| Request | Expected |
| --- | --- |
| `/de/`, `/en/`, and the 10 other `/de/…` and `/en/…` document routes | 200, correct `<html lang>` |
| `/de`, `/en` | 301 to `/de/` and `/en/` |
| `/nope/`, `/error.html` | 404 (real, from `404.html`) |
| `/llms.txt` | 200 `text/plain` |
| `/robots.txt` | exact file contents |
| `/sitemap.xml` | 12 `<url>` entries |
| `/index.txt`, `/en/index.txt` | 200, `X-Robots-Tag: noindex` |
| `/README.md`, `/LICENSE`, `/.github/FUNDING.yml`, `/website-demo-image/Thumbs.db`, `/package.json`, `/.design/cutover-plan.md` | 404 |
| `/` | 301 to `https://hedhly.com/de/` |
| Any page, response headers | `Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` present |
| Preview host response | `X-Robots-Tag: noindex` present (B3) |
| Email in HTML and text exports | `grep` for the address returns nothing (use the test pattern, not the literal string) |

4. Browser checks on the preview:
   - Run the Phase 5 verification script (`/tmp/verify/verify.mjs`, to be kept in the repository or a private location) against the preview base URL. It covers keyboard, contrast, reduced motion and console errors.
   - Collect console messages. There must be no `Refused to …` CSP violations. The Phase 1–5 browser checks ran against `serve.mjs`, not against Cloudflare's header handling, so this is the first test of the real `_headers` file.
   - Test the contact reveal, copy and retry on the preview. The CSP `connect-src 'self'` must allow the dynamic `import()`.
5. Link check: run the internal and external link checks against the preview.
6. If any check fails, fix on `feat/terminal-redesign`, push again, and repeat step 3. Nothing has changed on `dev` yet.

Gate: all rows in the table pass on the preview, the console is clean, and the owner approves the cutover.

---

## 5. Cutover (changes the live site; requires explicit approval)

Step 0 — preparation (no live change)

0.1. Save a baseline of the live site outside the repository: the headers and body of the URLs listed in §4 step 3 plus `/`, `/de/`, `/en/`, `/index.txt`, `/en/index.txt`, `/robots.txt`, `/sitemap.xml`. Keep it in `/tmp/cutover-baseline/` or a private directory. This is the comparison point for step 4 and the rollback check.
0.2. Confirm in the dashboard: production branch is `dev`, output directory is currently the root, and the latest production deployment is `9dd04f66-005c-4538-babf-459033488ed6`. Write these down.
0.3. Confirm the current `_redirects` on `dev` (`/ https://hedhly.com/de/ 301`) is the one the live site serves, so the rollback reproduces it.

Step 1 — merge into the production branch

1.1. Open a pull request from `feat/terminal-redesign` into `dev`. `dev` is an ancestor of the branch, so the merge is a fast-forward. Do not force-push `dev`.
1.2. Merge with the owner's approval. Pages builds `dev` and publishes a new production deployment. Record its ID from the check run.
1.3. Before the dashboard setting change, confirm that the new deployment built from the new commit but is not yet the production one, if the dashboard shows that state. (If the output directory is still the root, the new deployment will serve the root, which is the old behaviour.)

Step 2 — switch the output directory

2.1. In the dashboard, set the build command to `npm run build` and the output directory to `dist`. Changing either setting triggers a new production build. The change is what makes the site publish `dist/`.
2.2. Wait for the deployment to show "Deploy successful". Note the new deployment ID.

Step 3 — the change is live: verify immediately

Run the same checks as §4 step 3 against `https://hedhly.com`, plus these live-only checks:

| Check | Expected |
| --- | --- |
| `curl -sI https://hedhly.com/nope/` | 404, not 200 |
| `curl -sI https://hedhly.com/error.html` | 404 |
| `curl -sI https://hedhly.com/` | 301 to `https://hedhly.com/de/` |
| `curl -sI https://hedhly.com/de/` | 200, security headers present, no `X-Robots-Tag` |
| `curl -s https://hedhly.com/sitemap.xml \| grep -c '<url>'` | 12 |
| `curl -sI https://hedhly.com/assets/css/style.css` | 404 (old asset removed, expected) |
| Repository files (`/README.md`, `/LICENSE`, `/.github/FUNDING.yml`, `/website-demo-image/Thumbs.db`) | 404 |
| Email address in the live HTML and text exports | not present |
| Browser run of the verification script against `https://hedhly.com` | pass |
| External link check | pass |

Gate: all checks pass. Otherwise go to §6 immediately.

Step 4 — post-cutover

4.1. Submit `https://hedhly.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools. Run URL Inspection on `/de/` and `/en/`.
4.2. Watch 404 and soft-404 reports in Search Console for a week. The soft-404 count should fall to zero.
4.3. Confirm the Cloudflare settings from the plan (AI bot blocking, managed robots.txt, Rocket Loader, email obfuscation) and record the state. Confirm that `robots.txt` is served unmodified (no Cloudflare preamble).
4.4. Enable Crawler Hints if the owner wants IndexNow pings (plan §11.6).

---

## 6. Rollback

### Trigger

Roll back immediately if any of these occur on `hedhly.com`:

- 5xx responses on `/de/` or `/en/`, or a blank page.
- JavaScript errors or CSP violations that break the theme, the menu or the contact reveal.
- A redirect loop or a wrong `/` redirect.
- The email address appears in any response.
- `noindex` appears on the production host.
- `robots.txt`, `sitemap.xml` or `llms.txt` is wrong.

### Method A — dashboard rollback (preferred, minutes)

1. Cloudflare dashboard → Workers & Pages → `hedhly-portfolio` → Deployments.
2. Open deployment `9dd04f66-005c-4538-babf-459033488ed6` (the pre-cutover production deployment, from step 0.2).
3. Choose **Rollback to this deployment** (or the equivalent action the dashboard offers for a production deployment). This restores that deployment's output, including the old root files and the old `_redirects`.
4. Verify against the baseline from step 0.1 (diff the headers and bodies).

Rollback restores build output only. It does not change the build command, output directory or production branch, so also reset those settings from the recording in step 0.2 if they changed.

### Method B — Git revert (slower, uses a build)

1. Open a pull request that reverts the merge commit on `dev` (`git revert -m 1 <merge-sha>`).
2. Merge it with approval. Pages builds `dev` again with the root output, if the settings are also reset. Verify as in Method A.

### After rollback

- Keep `feat/terminal-redesign` as it is. Do not delete it, so the fix can be retried.
- Record the cause in the plan's verification section.
- Pages caches nothing at the edge for these responses (`cf-cache-status: DYNAMIC` on the baseline), so no cache purge should be needed. Confirm this with `cf-cache-status` after rollback.

---

## 7. Post-cutover cleanup (separate pull request, after 48 hours stable)

Do not combine this with the cutover. It is the only step that deletes files, so it can be reverted on its own.

Remove from the repository root (the output is `dist/`, so these are no longer published):

- `index.html`, `de/`, `en/`, `error.html`, `index.txt`, `robots.txt`, `sitemap.xml`, `_redirects` (the new copies are generated into `dist/`)
- `assets/css/style.css`, `assets/js/script.js`
- `assets/images/` files not referenced by the build: the blog, project, avatar and logo variants, and `vue-color-avatar.png`. Keep the files listed in `scripts/build.mjs`.
- `website-demo-image/` (contains `Thumbs.db`)
- `.github/FUNDING.yml` (template author's funding handle) — owner decision, see §8.

Keep `README.md` (already updated).

---

## 8. Decisions the owner must make

| # | Decision | Recommendation |
| --- | --- | --- |
| D1 | Production branch: keep `dev`, or make `main` production | Keep `dev` for this cutover. Fast-forward `main` to `dev` afterwards, then decide. |
| D2 | Pages preview deployments: keep, or limit to production | Keep, with the B3 `noindex` rule. Limit if preview hosts are ever shared publicly. |
| D3 | `.design/` in the public repository | Remove it from the repository before pushing (B2). |
| D4 | Keep legacy `og.png` for old share cards | Keep it for 90 days. It is no longer referenced by the live pages. |
| D5 | `LICENSE` and `.github/FUNDING.yml` from the template | Review the licence terms and remove the funding file unless the owner wants it. |
| D6 | Cloudflare AI-bot and managed robots settings | Set as in the plan §11.3 (allow, unmodified `robots.txt`). |
| D7 | Re-run the link check after cutover | Required; the first check (2026-10-28) could only confirm URLs, not the new pages. |

---

## 9. Limits of this plan

- The dashboard settings and the production branch are inferred from the API and the live content. Confirm each one at step 0.2.
- The Cloudflare documentation does not describe the `404.html` fallback or trailing-slash handling. Both are verified on the preview in §4, not assumed.
- Preview and production behaviour can differ for `_headers`. The preview check in §4 is the only test of the real header file.
- Search Console submission and indexing results are outside Cloudflare and cannot be confirmed by this plan.
