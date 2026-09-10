# CV Maker

A resume-building website with three templates, reorderable sections, browser autosave, and PDF export.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL it prints (usually http://localhost:5173).

## Deploy it for real (pick one)

### Option A — Netlify (easiest, no account setup needed for a first look)
1. `npm install`
2. `npm run build` — this creates a `dist/` folder
3. Go to https://app.netlify.com/drop and drag the `dist/` folder onto the page
4. You'll get a live URL immediately. Create a free account to keep it and add a custom domain later.

### Option B — Vercel
1. Push this folder to a GitHub repo
2. Go to https://vercel.com/new and import the repo
3. Vercel auto-detects Vite — just click Deploy
4. You get a live URL, and can attach a custom domain in project settings

### Option C — GitHub Pages
1. Push this folder to a GitHub repo
2. Add `"homepage": "https://<you>.github.io/<repo>"` to package.json
3. `npm install gh-pages --save-dev`
4. Add to package.json scripts: `"deploy": "npm run build && npx gh-pages -d dist"`
5. Run `npm run deploy`

## Custom domain
Buy a domain anywhere (Namecheap, Google Domains, etc.), then in Netlify/Vercel's dashboard go to Domain settings and follow their DNS instructions — usually just adding a CNAME record.
