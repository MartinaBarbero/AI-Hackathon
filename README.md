# 🚀 DCF Valuation Tool — Deploy Guide

AI-powered DCF model generator for deep-tech startups.
Built in 36h for the Ignition AI Hackathon @ EPFL/UNIL.

---

## 📁 Project structure

```
valuation_app/
├── server.py               ← Flask backend (API + file serving)
├── requirements.txt
├── Procfile                ← For Railway / Heroku
├── runtime.txt
├── Valuation_Template.xlsx ← Your Excel template (do NOT rename)
├── templates/
│   └── index.html          ← HTML shell (loads React from CDN)
└── static/
    └── app.js              ← React frontend (no build step needed)
```

---

## ⚡ Deploy on Railway (recommended — free tier, 5 min)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "init: DCF valuation tool"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2 — Create Railway project

1. Go to https://railway.app → "New Project"
2. Choose **"Deploy from GitHub repo"**
3. Select your repo
4. Railway auto-detects Python from `requirements.txt` + `Procfile`

### Step 3 — Add environment variable

In Railway → your service → **Variables** tab:

```
ANTHROPIC_API_KEY = sk-ant-...your key here...
```

Get your key at: https://console.anthropic.com/settings/keys

### Step 4 — Generate domain

Railway → your service → **Settings** → **Networking** → "Generate Domain"

Your app is live at: `https://your-project.up.railway.app` ✅

---

## 🖥️ Run locally

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set API key
export ANTHROPIC_API_KEY=sk-ant-...

# 3. Start server
python server.py
# → http://localhost:5000
```

---

## 🔧 How it works

| Route | What happens |
|-------|-------------|
| `GET /` | Serves `templates/index.html` (React SPA) |
| `POST /api/extract` | Receives uploaded files → calls Claude API → returns extracted JSON |
| `POST /api/generate` | Receives form data + extracted values → fills `Valuation_Template.xlsx` → returns the file |

The Excel template is **never modified** — each request loads a fresh copy, fills only non-formula cells, and streams it back.

---

## 📝 Demo flow (hackathon)

1. Fill startup name, sector, revenue model, stage, country
2. Paste executive summary or upload a PDF/Excel pitch deck
3. Claude extracts financials automatically
4. Click "Find Comparables" → sector benchmark medians
5. Click "Generate Financial Valuation" → WACC computed
6. Download the filled Excel → all original formulas intact

---

## ⚠️ Notes

- `Valuation_Template.xlsx` must stay in the root of the project folder
- The app never stores any uploaded files — they are processed in memory and discarded
- Claude API costs ~$0.01–0.05 per extraction call (Sonnet 4)
