# Quick Deployment Guide

## 🚀 Push to GitHub

1. **Create a new repository on GitHub** (don't initialize with README)

2. **Run these commands:**
```bash
git add .
git commit -m "Initial commit: FuelFit AI - Complete application with voice features"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub details.

## 🌐 Deploy to Vercel

### Step 1: Import Project
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"New Project"**
3. Import your GitHub repository

### Step 2: Configure Project
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `client` (IMPORTANT!)
- **Build Command**: `npm run build` (leave default)
- **Output Directory**: `.next` (leave default)
- **Install Command**: `npm install` (leave default)

### Step 3: Add Environment Variables
Click **"Environment Variables"** and add:
- **Name**: `NEXT_PUBLIC_API_URL`
- **Value**: Your backend URL (you'll get this after deploying backend)

### Step 4: Deploy
Click **"Deploy"** and wait for build to complete.

## 🔧 Deploy Backend (Railway - Recommended)

### Step 1: Create Account
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub

### Step 2: Deploy
1. Click **"New Project"** → **"Deploy from GitHub repo"**
2. Select your repository
3. Click the **"..."** menu → **"Settings"**
4. Set **Root Directory** to `server`
5. Go to **"Variables"** tab and add:
   - `MONGODB_URI` = Your MongoDB connection string
   - `JWT_SECRET` = Any random string (e.g., `your-super-secret-key-123`)
   - `ELEVENLABS_API_KEY` = Your ElevenLabs API key
   - `OPENAI_API_KEY` = Your OpenAI API key (optional)
   - `PORT` = `3030` (or leave default)
6. Railway will auto-deploy. Copy the URL (e.g., `https://your-app.railway.app`)

### Step 3: Update Frontend
1. Go back to Vercel
2. Update `NEXT_PUBLIC_API_URL` environment variable with your Railway URL
3. Redeploy (or it will auto-redeploy)

## ✅ Final Steps

1. **Update CORS in backend** - The server should already allow Vercel domains, but verify in `server/index.js`
2. **Test the deployment** - Visit your Vercel URL and test:
   - Home page loads
   - Analyze meal works
   - Voice features work
   - Authentication works

## 🔗 Quick Links

- **Frontend**: Your Vercel URL (e.g., `https://your-app.vercel.app`)
- **Backend**: Your Railway URL (e.g., `https://your-app.railway.app`)
- **API Health Check**: `https://your-backend-url/api/health`

## 📝 Notes

- The `.next` folder is excluded from git (build files)
- Environment variables are NOT committed (they're in `.gitignore`)
- Make sure to set all environment variables in both Vercel and Railway
- CORS is configured to allow Vercel domains automatically

