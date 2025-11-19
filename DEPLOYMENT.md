# 🚀 Deployment Guide

## Prerequisites

1. **Backend Server** deployed and running (e.g., on Render)
2. **Frontend** ready to deploy (e.g., on Vercel)
3. MongoDB database accessible from backend

---

## 📦 Backend Deployment (Render/Railway)

### 1. Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node src/index.js`
   - **Environment**: Node

### 2. Set Environment Variables

Add these in Render dashboard under **Environment**:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
PORT=5000
TMDB_API_KEY=81f4065ed423ff304fb5c85d33617a83
```

### 3. Note Your Backend URL

After deployment, copy your backend URL (e.g., `https://capstone3-6ywq.onrender.com`)

---

## 🌐 Frontend Deployment (Vercel)

### Option 1: Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Option 2: Deploy via CLI

```bash
cd client
npm install -g vercel
vercel --prod
```

### 4. Set Environment Variables on Vercel

**CRITICAL:** Add these environment variables in Vercel:

1. Go to **Project Settings** → **Environment Variables**
2. Add:

```
TMDB_API_KEY=81f4065ed423ff304fb5c85d33617a83
NEXT_PUBLIC_API_URL=https://capstone3-6ywq.onrender.com
```

**Important:** 
- Replace `https://capstone3-6ywq.onrender.com` with YOUR actual backend URL
- Make sure to add variables for **Production**, **Preview**, and **Development** environments

### 5. Redeploy

After adding environment variables:
- Go to **Deployments** tab
- Click on the latest deployment → **Redeploy**
- OR push a new commit to trigger automatic deployment

---

## 🔍 Troubleshooting

### Issue: Login shows `net::ERR_BLOCKED_BY_CLIENT`

**Cause**: Frontend is trying to connect to `localhost:5000` in production

**Solution**:
1. ✅ Make sure `NEXT_PUBLIC_API_URL` is set in Vercel
2. ✅ Verify the URL points to your deployed backend (not localhost)
3. ✅ Redeploy after adding environment variables

### Issue: "Network Error" on Login/Signup

**Cause**: Backend server is not running or CORS is blocking requests

**Solution**:
1. Check if backend is running: Visit `https://your-backend-url.com` in browser
2. Verify CORS is enabled in `server/src/index.js`:
   ```javascript
   app.use(cors({
     origin: ['http://localhost:3000', 'https://your-frontend.vercel.app'],
     credentials: true
   }));
   ```
3. Add your Vercel domain to CORS allowed origins

### Issue: MongoDB Connection Failed

**Cause**: MongoDB URI is incorrect or network access not configured

**Solution**:
1. Check `MONGO_URI` in Render environment variables
2. If using MongoDB Atlas:
   - Go to **Network Access**
   - Add `0.0.0.0/0` to whitelist (allow from anywhere)
   - OR add Render's IP addresses

---

## ✅ Verification Checklist

Before going live:

- [ ] Backend deployed and accessible via URL
- [ ] MongoDB connected and accessible
- [ ] Environment variables set on Render (backend)
- [ ] Environment variables set on Vercel (frontend)
- [ ] CORS configured to allow frontend domain
- [ ] Test login/signup on production site
- [ ] Test movie search and playback
- [ ] Test favorites/watchlist features
- [ ] Verify all API routes work

---

## 🔗 Expected URLs

After deployment, you should have:

- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-project.onrender.com` or `https://your-project.up.railway.app`
- **MongoDB**: `mongodb+srv://...` (Atlas) or `mongodb://...` (self-hosted)

---

## 🛠️ Local Development

To run locally:

```bash
# Terminal 1 - Backend
cd server
npm install
npm start

# Terminal 2 - Frontend
cd client
npm install
npm run dev
```

Visit: `http://localhost:3000`

---

## 📝 Notes

- The app automatically detects environment and uses appropriate API URL
- In production, it defaults to `https://capstone3-6ywq.onrender.com`
- You can override by setting `NEXT_PUBLIC_API_URL` environment variable
- Always redeploy after changing environment variables
