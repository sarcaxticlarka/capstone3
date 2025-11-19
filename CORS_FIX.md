# 🔧 CORS Fix - Deployment Instructions

## ✅ What Was Fixed

Updated `server/src/index.js` with proper CORS configuration to allow requests from:
- ✅ `http://localhost:3000` (development)
- ✅ `https://capstone3-lemon.vercel.app` (production)
- ✅ All `*.vercel.app` domains (preview deployments)

### Changes Made:
- Added dynamic origin validation function
- Enabled `credentials: true` for cookies/auth headers
- Added support for `DELETE` method (for removing favorites/watchlist)
- Added proper preflight request handling
- Set `optionsSuccessStatus: 204` for better compatibility

## 🚀 Deploy Updated Server

### Option 1: Git Push (Recommended)

```bash
cd /Users/underxcore/Desktop/capstone3
git add server/src/index.js
git commit -m "Fix CORS configuration for Vercel frontend"
git push origin main
```

**Render will auto-deploy** when it detects the push to GitHub.

### Option 2: Manual Deploy on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Find your `capstone3` service
3. Click **Manual Deploy** → **Deploy latest commit**
4. Wait for deployment to complete (~2-3 minutes)

## 🧪 Test After Deployment

1. Visit: `https://capstone3-lemon.vercel.app/login`
2. Try logging in with your credentials
3. Should work without CORS errors! ✅

## 🔍 Verify Server is Running

Check server health:
```bash
curl https://capstone3-6ywq.onrender.com/health
```

Expected response: `ok`

## 📝 Alternative: Quick Test

If you want to test immediately without deploying:

1. Your local server is already running with the fix
2. Update `.env.local` in client to point to localhost:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```
3. Run client locally: `cd client && npm run dev`
4. Test login/signup at `http://localhost:3000`

---

**After deploying the server update, your production login/signup will work! 🎉**
