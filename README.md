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

## Vercel deploy (serverless + email via Resend)
- Vercel won’t persist local files, so the contact form uses a serverless function at `api/contact.js` to send email via Resend.
- Set these env vars in Vercel Project Settings → Environment Variables:
  - `RESEND_API_KEY` (from https://resend.com)
  - `CONTACT_TO_EMAIL` (where you want to receive messages, e.g., `businesses@skyyalla.com`)
  - `CONTACT_FROM_EMAIL` (a verified sender in Resend, e.g., `no-reply@skyyalla.com`)
- Deploy by running `vercel` in the project root or connect the GitHub repo in the Vercel dashboard.
- Front-end already posts to `/api/contact`; no further changes needed.
