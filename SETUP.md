# FuelFit AI - Quick Setup Guide

## 🚀 Installation (3 steps)

### Step 1: Install Dependencies
```bash
npm run install-all
```

This installs dependencies for:
- Root package (concurrently for running both servers)
- Backend server (Express, OpenAI)
- Frontend client (Next.js, React)

### Step 2: (Optional) Add OpenAI API Key
Create `server/.env` file:
```
OPENAI_API_KEY=your_key_here
```

**Note:** The app works perfectly without OpenAI! It uses smart default explanations.

### Step 3: Run the Application
```bash
npm run dev
```

This starts:
- Backend API: http://localhost:3030
- Frontend App: http://localhost:3000

## 🎯 Quick Test

1. Open http://localhost:3000
2. Select "Chicken and Rice" from presets
3. Choose "Running" workout
4. Select "Muscle Gain" goal
5. Click "Analyze Meal"

You should see:
- Workout Cost (minutes needed)
- MacroMatch analysis
- FuelScore (0-10)
- AI Coach explanation

## 📁 Project Structure

```
runchow hackathon/
├── server/           # Node.js + Express backend
│   ├── index.js      # API routes
│   ├── engine.js     # Core algorithms
│   ├── data.js       # Meals, workouts, MET values
│   └── package.json
├── client/           # Next.js frontend
│   ├── pages/        # React pages
│   ├── styles/       # CSS
│   └── package.json
└── package.json      # Root package

```

## 🐛 Troubleshooting

**Port already in use?**
- Change PORT in server/.env or kill the process using port 3030

**Frontend can't connect to backend?**
- Make sure backend is running on port 3030
- Check NEXT_PUBLIC_API_URL in client/.env.local (defaults to localhost:3030)

**OpenAI errors?**
- App works without OpenAI - it uses smart defaults
- Check your API key is valid if you want AI features

## 🎨 Customization

**Add more meals:** Edit `server/data.js` → `meals` array

**Add workouts:** Edit `server/data.js` → `workouts` array

**Adjust algorithms:** Edit `server/engine.js`

**Change UI:** Edit `client/pages/index.tsx` and `client/styles/globals.css`

---

Ready to demo! 🚀

