# Sky Yalla Site

Marketing site with a lightweight Node server to serve static files and accept contact form submissions.

## Local run
- Install Node 18+.
- In the project folder: `npm install` (no deps, but installs lockfile) then `npm start`.
- Open http://localhost:3000

## Railway deploy
1) Push this repo to GitHub (already done for `kirish34/skyyalla-site`).
2) In Railway: New Project → Deploy from GitHub → select the repo.
3) Service settings:
   - Start command: `npm start` (Railway usually detects).
   - Env var: `DATA_DIR=/data`
   - Add a Volume and mount it at `/data` so `contact-submissions.json` persists.
4) Deploy and use the generated URL; the front-end form posts to `/api/contact` on the same host.

## Notes
- The backend is ESM (`"type": "module"`). 
- Contact submissions are appended to `contact-submissions.json` in `DATA_DIR`.
