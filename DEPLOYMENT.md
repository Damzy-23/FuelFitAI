# Deployment Guide

## Prerequisites
- GitHub account
- Vercel account (for frontend)
- Railway/Render/Heroku account (for backend server)

## Step 1: Push to GitHub

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit: FuelFit AI application"
```

2. Create a new repository on GitHub

3. Add remote and push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com) and sign in with GitHub

2. Click "New Project" and import your GitHub repository

3. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `client`
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `.next` (or leave default)

4. Add Environment Variables in Vercel:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app` or `https://your-backend.render.com`)

5. Click "Deploy"

## Step 3: Deploy Backend Server

### Option A: Railway (Recommended)

1. Go to [Railway](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Node.js
5. Set the root directory to `server`
6. Add environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `ELEVENLABS_API_KEY`: Your ElevenLabs API key
   - `OPENAI_API_KEY`: Your OpenAI API key (optional, for voice assistant)
   - `PORT`: `3030` (or leave default)
7. Deploy and copy the generated URL
8. Update `NEXT_PUBLIC_API_URL` in Vercel with this URL

### Option B: Render

1. Go to [Render](https://render.com) and sign in
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `fuelfit-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
5. Add environment variables (same as Railway)
6. Deploy and copy the URL
7. Update `NEXT_PUBLIC_API_URL` in Vercel

### Option C: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create fuelfit-api`
4. Set buildpack: `heroku buildpacks:set heroku/nodejs`
5. Set environment variables:
```bash
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set ELEVENLABS_API_KEY=your_elevenlabs_key
heroku config:set OPENAI_API_KEY=your_openai_key
```
6. Deploy: `git push heroku main`
7. Update `NEXT_PUBLIC_API_URL` in Vercel

## Step 4: Update CORS Settings

Make sure your backend server allows requests from your Vercel domain:

In `server/index.js`, update CORS:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-app.vercel.app'
  ],
  credentials: true
}));
```

## Environment Variables Summary

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL`: Backend API URL

### Backend (Railway/Render/Heroku)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens
- `ELEVENLABS_API_KEY`: ElevenLabs API key for TTS
- `OPENAI_API_KEY`: OpenAI API key (optional, for voice assistant)
- `PORT`: Server port (usually auto-set by platform)

## Troubleshooting

1. **CORS Errors**: Make sure your backend CORS includes your Vercel domain
2. **API Not Found**: Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
3. **Build Failures**: Check build logs in Vercel dashboard
4. **Server Errors**: Check server logs in Railway/Render/Heroku dashboard

## Post-Deployment Checklist

- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Railway/Render/Heroku
- [ ] Environment variables set in both platforms
- [ ] CORS configured correctly
- [ ] Test API endpoints are working
- [ ] Test voice features (TTS and voice assistant)
- [ ] Test authentication flow
- [ ] Test meal analysis

