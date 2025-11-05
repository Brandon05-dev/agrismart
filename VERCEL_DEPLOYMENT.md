# Vercel Deployment Instructions for AgriSmart

## Quick Fix for Your Current Deployment

Your Vercel deployment is showing a 404 because it needs proper configuration. Follow these steps:

### Step 1: Update Vercel Project Settings

Go to your Vercel project dashboard and update these settings:

**Build & Development Settings:**
- **Framework Preset:** Other
- **Root Directory:** `./` (leave as root)
- **Build Command:** 
  ```bash
  cd frontend && npm install --legacy-peer-deps && npm run build
  ```
- **Output Directory:** `frontend/build`
- **Install Command:**
  ```bash
  cd frontend && npm install --legacy-peer-deps
  ```

### Step 2: Add Environment Variable

In Vercel Dashboard → Settings → Environment Variables, add:

**Name:** `REACT_APP_API_URL`  
**Value:** Your backend API URL (see options below)

**Backend Deployment Options:**

1. **Deploy backend to Render/Railway/Heroku first:**
   ```
   REACT_APP_API_URL=https://your-backend.render.com/api
   ```

2. **Or use a separate Vercel deployment for backend** (see Backend on Vercel section below)

3. **For testing only (not production):**
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

### Step 3: Redeploy

After updating settings, click **"Redeploy"** in Vercel dashboard.

---

## Complete Deployment Strategy

### Option A: Frontend on Vercel + Backend Elsewhere (Recommended)

**1. Deploy Backend to Render/Railway/Heroku:**

```bash
# For Heroku
heroku create agrismart-backend
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
git subtree push --prefix backend heroku main

# For Render
# Just connect your GitHub repo and point to /backend directory
```

**2. Update Vercel Environment Variable:**
```
REACT_APP_API_URL=https://agrismart-backend.herokuapp.com/api
```

**3. Update Backend CORS:**

In your backend, you need to allow requests from Vercel. Update `backend/server.js`:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app',
    'https://yourdomain.com'
  ],
  credentials: true
}));
```

---

### Option B: Both on Vercel (Advanced)

You can deploy the backend as a Vercel serverless function, but this requires restructuring. This is more complex and not recommended for your current setup.

---

## Files Already Created

✅ `vercel.json` - Vercel configuration (already in your repo)

This file tells Vercel:
- Where to find the frontend code
- How to build it
- How to handle routing (for React Router)

---

## Troubleshooting

### Issue: Still getting 404 after redeploying

**Solution:** Make sure in Vercel settings:
1. Root Directory is set to `./` (not `/frontend`)
2. Output Directory is `frontend/build`
3. Build Command includes `cd frontend &&`

### Issue: API calls fail with CORS error

**Solution:** 
1. Deploy backend with CORS configured to allow your Vercel domain
2. Set `REACT_APP_API_URL` in Vercel environment variables
3. Redeploy frontend

### Issue: Build fails on Vercel

**Solution:**
1. Check that Install Command uses `--legacy-peer-deps` flag
2. Make sure Node version is 18.x (set in Vercel → Settings → General)

---

## Recommended Architecture

```
Frontend (Vercel)
    ↓ API calls
Backend (Render/Railway/Heroku)
    ↓ Database
MongoDB Atlas
```

**Costs:**
- Vercel: Free tier (perfect for frontend)
- Render/Railway: Free tier available
- MongoDB Atlas: Free tier (512MB)

**Total: $0** for getting started!

---

## Next Steps

1. ✅ Push the `vercel.json` file to GitHub (already done)
2. ⬜ Update Vercel project settings (Build & Output settings)
3. ⬜ Deploy backend to Render/Railway/Heroku
4. ⬜ Add backend URL to Vercel environment variables
5. ⬜ Update backend CORS configuration
6. ⬜ Redeploy on Vercel

---

## Support

If you continue to have issues:
1. Check Vercel deployment logs
2. Check browser console for specific errors
3. Verify environment variables are set correctly
4. Ensure backend is deployed and accessible

---

**Quick Command to Push Changes:**

```bash
git add vercel.json VERCEL_DEPLOYMENT.md
git commit -m "Add Vercel deployment configuration"
git push origin main
```

Then redeploy on Vercel!
