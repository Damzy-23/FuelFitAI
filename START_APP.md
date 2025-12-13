# 🚀 How to Start the App

## Quick Start (Recommended)

From the **root directory** (`runchow hackathon`), run:

```bash
npm run dev
```

This starts **both** servers:
- ✅ Backend API: http://localhost:3030
- ✅ Frontend App: http://localhost:3000

**Then open your browser to:** http://localhost:3000

---

## Alternative: Run Separately

If you prefer to run them in separate terminals:

### Terminal 1 - Backend Server
```bash
cd server
npm run dev
```
Backend will run on: http://localhost:3030

### Terminal 2 - Frontend Client
```bash
cd client
npm run dev
```
Frontend will run on: http://localhost:3000

**Then open:** http://localhost:3000

---

## Troubleshooting

### "Nothing showing in browser"
1. ✅ Make sure you're opening **http://localhost:3000** (not 3030)
2. ✅ Check that both servers are running (you should see logs in terminal)
3. ✅ Check browser console for errors (F12)

### "Port already in use"
- Kill the process using the port
- Or change the port in `server/.env` (PORT=3030) or `client/package.json` (Next.js default is 3000)

### "Cannot find module"
- Run `npm run install-all` from root directory

---

## What You Should See

When you open http://localhost:3000, you should see:
- 🏠 Home page with hero section
- 🎨 Modern UI with glassmorphism effects
- 📊 Navigation bar
- 🎤 Voice assistant (on analyze page)

---

## Quick Test

1. Open http://localhost:3000
2. Click "Analyze Meal" or go to `/analyze`
3. Select a meal from presets
4. Choose workout type
5. Click "Analyze Meal"
6. See results!

