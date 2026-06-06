# AGENTS.md

> Compact guide for OpenCode sessions working in this repo. **Read this first, then `Skills.md` for deep architecture.**

## Repo shape
- **Static frontend** (vanilla HTML/CSS/JS, no bundler, no transpiler, no build step) + a **stub Node/Express backend** that exists only to proxy to Google Gemini.
- All app code lives in `front/log in/`. There is no `src/`, no `dist/`, no `tests/`, no `pages/`.
- No CI, no `.gitignore` checked in, no Docker, no pre-commit hooks, no `.env.example`.

## Things an agent will almost certainly miss

1. **The folder is literally `front/log in/` (with a space).** Every shell command, glob, and path must quote it. Renaming the folder breaks every internal link and `<script src>`.
   ```bash
   node "front/log in/server.js"   # correct
   node front/log in/server.js     # wrong (3 args)
   ```

2. **`package.json` is for the backend stub only.** It has no `scripts.start`. Don't run `npm start`. To run the backend: `npm install` once, then `node "front/log in/server.js"` (listens on `:3000`). The frontend has no Node entry point.

3. **No `npm test`, no lint, no typecheck, no formatter.** Tasks cannot be auto-verified. If verification is needed, it's manual: open the page in a browser and check DevTools console. Don't invent commands.

4. **Live Server runs on port `5501`, not `5500`.** Set in `.vscode/settings.json`. If the agent suggests opening `http://localhost:5500/...`, it's wrong.

5. **Only `script.js` is `type="module"`.** Every other JS file is a classic script. Loading order on every dashboard-style page is: `i18n.js` → page JS → `<script type="module" src="script.js">`. Changing this breaks the `window.dictionary` / `window.chatBotAttached` handshake.

6. **The chatbot is duplicated ~4×** in `script.js`, `nutrition.js`, `reports.js`, `settings.js`. If you add a keyword, fix a response, or tweak the 600ms typing delay, update all four files. There is no shared module.

7. **Three things are referenced but do not exist** (see Skills.md §11 for the full list of 20):
   - `renderDailyChart()` — `#dailyBgChart` canvas is in the DOM but the function is never defined.
   - `#user-physio-context` and `#meal-search-input` — referenced in `dashboard.html` inline JS, not in the markup.
   Adding these naively will silently re-wire features; the safe default is to remove the dead references.

8. **Auto-redirect to dashboard is intentionally commented out** (`script.js:142-150`). Re-enable only if you've audited the Firestore read race on first paint.

9. **Firebase config (`script.js:5-13`) is a public web API key, not a secret.** The real security boundary is **Firestore Security Rules**, which are NOT in this repo. Production deployment must add them; see Skills.md §13.1 for a starter ruleset.

10. **`server.js` has a placeholder `GEMINI_API_KEY`** (Arabic text, not a real key). Load from `process.env.GEMINI_API_KEY` and never commit a real key.

11. **Diabetes type enum is closed: `type1 | type2 | gestational | pediatric`.** Default fallback throughout is `"type1"`. Adding a new type requires edits in 4 files (i18n options, dashboard thresholds, nutrition plan, chatbot branches).

12. **Firestore convention is `users/{uid}/<table>`.** Don't create top-level collections.

13. **The ~80-item meal database is hardcoded** in `dashboard.html` `<datalist id="meal-datalist">` as inline `<option data-carbs="X">`. There is no JSON file. Adding a meal = editing the HTML.

14. **The repo is a git repo but has no `.gitignore` committed.** Don't commit `node_modules/`.

## File map (one line each)
- `front/log in/index.html` — login/signup + chatbot widget.
- `front/log in/dashboard.html` — main app: glucose, weight/BMI, meal, bolus, suggestion, BG chart.
- `front/log in/nutrition.html` — personalized diet plan + tips.
- `front/log in/reports.html` — Chart.js + html2pdf.js export.
- `front/log in/settings.html` — profile, prefs, password (stub).
- `front/log in/script.js` — **core** (ES module): Firebase, `window.DiaCareDB`, auth, chatbot, logout.
- `front/log in/server.js` — Express stub, `POST /api/ai` → Gemini proxy.
- `front/log in/i18n.js` — EN/AR dictionary + RTL handling. Classic script.
- `front/log in/nutrition.js` / `reports.js` / `settings.js` — page-specific logic + chatbot duplicate.
- `front/log in/styles.css` — single 1072-line global stylesheet, CSS-variable themed.
- `Skills.md` — full architecture reference (read this when AGENTS.md isn't enough).
- `package.json` — only `express` and `cors` (for the stub).
- `.vscode/settings.json` — Live Server port.

## Verification cheatsheet
- **Smoke test the frontend:** open `http://localhost:5501/front/log%20in/index.html` (or just `/front/log in/index.html` if the dev server resolves spaces) in a browser. Watch the DevTools console for Firebase errors.
- **Smoke test the backend stub:** `curl -X POST http://localhost:3000/api/ai -H "Content-Type: application/json" -d '{"contents":[]}'` — expect 500 with "GOOGLE_API_KEY..." until you set `GEMINI_API_KEY`.
- **Search across the duplicated chatbot:** `Get-Content "front\log in\*.js" | Select-String "pizza-effect"` (or use `grep`/`rg`) and verify all four files match.

## When in doubt
Open `Skills.md` — it has the full DOM-ID inventory, LocalStorage key table, threshold matrices, and a 20-row tech-debt table.

## Important Note

- Always update skills to match last edits.
- Always check for translations.
- Always do a QA test to make sure every thing works fine.