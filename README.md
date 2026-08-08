# Solace — Daily Journal (UI Prototype)

A React + Vite front-end prototype of a sage-green daily journaling app: a home screen with a mood tracker and quote of the day, a "write freely / guided reflection" journal composer with a voice-note mock, quick-action cards, an insights screen, and a pill-shaped bottom nav bar.

**All your data is real and yours** — entries, moods, and desires are saved to your browser's `localStorage`, not hardcoded fake data. Nothing is sent to a server; clearing your browser data (or using a different browser/device) clears the app too.

## Run it locally

```bash
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview   # optional local check of the production build
```

## Deploy to Vercel via GitHub

1. Create a new GitHub repo and push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Solace journal UI"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and import that GitHub repo.
3. Vercel auto-detects Vite. Keep the defaults:
   - **Build command:** `vite build`
   - **Output directory:** `dist`
4. Click **Deploy**. You'll get a live URL in about a minute.

## File structure

Everything lives directly in `src/` — no `components`, `screens`, or `lib` subfolders:

- `src/App.jsx` — the app shell (routing between tabs, all the localStorage-backed state) **and** the Home screen itself, plus every piece the shell needs to render on top of any tab: the nav bar, quote card, mood tracker, quick actions, the entry composer sheet, the entry detail sheet, and a small entry-list/empty-state helper. These are grouped here (rather than off in their own files) since `App.jsx` is what owns the state that drives them.
- `src/Entries.jsx` — the full journal list tab (self-contained: has its own copy of the mood-face icon and entry-card rendering)
- `src/Insights.jsx` — streak/stats/chart, computed from real stored entries and moods
- `src/Desires.jsx` — your own add/track list, fully user-managed
- `src/Settings.jsx` — opened from the account button top-right of Home; name + data reset
- `src/Onboarding.jsx` — first-run screen — intentionally simple for now, meant to be reworked later
- `src/copy.js` — static app copy (quotes, prompts, quick-action labels) — not user data
- `src/dates.js` — week-strip, streak, and weekly-activity calculations
- `src/storage.js` — the localStorage-persistence hook used for entries/moods/desires/profile
- `src/App.css`, `src/index.css` — all styles
- `src/main.jsx` — React entry point

A few small pieces (the mood-face icon, an empty-state block, the cat mascot) are duplicated across the files that use them rather than imported from a shared components file, so each screen file is self-contained.

## Data & storage

Everything lives in `localStorage` under these keys: `solace_profile`, `solace_entries`, `solace_moods`, `solace_desires`. There's a "Reset all data" button in Settings if you want to start clean, and onboarding only shows again if you use that reset (or clear your browser's site data).

## Notes

- Built with React 18, Vite, [Framer Motion](https://www.framer.com/motion/) for the micro-interactions, and [Lucide](https://lucide.dev/) for icons.
- Full-screen layout (no phone-frame chrome) that's designed mobile-first, with the content column widening and reflowing (2-column entries, 4-across quick actions) above ~640px so it still holds up on tablet/desktop.
- No backend — this is a front-end prototype. If you later want sync across devices, swap the calls in `src/lib/useLocalStorage.js` for real API requests.
