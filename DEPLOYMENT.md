# 🚀 100% FREE Deployment Guide - Production Ready!

## Why Deploy Now?
- ✅ Test real production environment
- ✅ Catch issues early (like image loading)
- ✅ Continue developing while live
- ✅ Show progress to recruiters/college
- ✅ **ZERO COST - Completely FREE!**

## Architecture
```
Frontend (Vercel) → Backend (Render) → Database (Supabase)
     FREE              FREE                FREE
                  ↓
          Cloudinary (FREE)
```

**Total Cost: $0.00 forever!** 🎉

---

## 📦 Step 1: Deploy Database (Supabase - FREE)

1. Go to https://supabase.com
2. Click "Start your project"
3. Create new project:
   - Name: `nivora-social-media`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Wait 2 minutes for setup
5. Go to **Settings** → **Database**
6. Copy **Connection String** (URI format)
7. Replace `[YOUR-PASSWORD]` with your password

**Your DATABASE_URL will look like:**
```
postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres
```

---

## 🎨 Step 2: Deploy Backend (Render - 100% FREE)

1. Go to https://render.com
2. Sign up with GitHub (no credit card needed!)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `nivora-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && node dist/index.js`
   - **Instance Type**: **FREE** ✅

6. Click "Advanced" → Add Environment Variables (from `backend/.env`):

```env
NODE_ENV=production
DATABASE_URL=<your-supabase-url-from-step-1>
JWT_SECRET=<generate-random-string-min-32-chars>
JWT_REFRESH_SECRET=<generate-random-string-min-32-chars>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
EMAIL_SERVICE=gmail
EMAIL_USER=<your-gmail>
EMAIL_PASSWORD=<your-gmail-app-password>
EMAIL_FROM=<your-gmail>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app
PORT=5000
```

7. Click "Create Web Service"
8. Wait 5-10 minutes for first deploy
9. Copy your Render URL (e.g., `https://nivora-backend.onrender.com`)

**⚠️ Important:** Free tier sleeps after 15 min inactivity, wakes in 30 seconds on first request.

---

## ⚡ Step 3: Deploy Frontend (Vercel - 100% FREE)

1. Go to https://vercel.com
2. Sign up with GitHub (you're already familiar! 😊)
3. Click "Add New" → "Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Add Environment Variables:
```env
VITE_API_URL=https://your-render-backend-url.onrender.com
VITE_SOCKET_URL=https://your-render-backend-url.onrender.com
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=social_media_app
VITE_PEER_HOST=peerjs-server.herokuapp.com
VITE_PEER_PORT=443
```

7. Click "Deploy"
8. Wait 2-3 minutes
9. Copy your Vercel URL (e.g., `https://nivora.vercel.app`)

**✅ Vercel never sleeps - always fast!**

---

## 🔄 Step 4: Update CORS & Callback URLs

### Update Render Backend:
1. Go to Render → Your Service → Environment
2. Update:
   - `CORS_ORIGIN` = Your Vercel URL (e.g., `https://nivora.vercel.app`)
   - `FRONTEND_URL` = Your Vercel URL
   - `GOOGLE_CALLBACK_URL` = `https://your-render-url.onrender.com/api/auth/google/callback`
3. Click "Save Changes" (auto-redeploys)

### Update Google OAuth:
1. Go to https://console.cloud.google.com
2. APIs & Services → Credentials
3. Edit your OAuth Client
4. Add to **Authorized redirect URIs**:
   - `https://your-render-url.onrender.com/api/auth/google/callback`
5. Add to **Authorized JavaScript origins**:
   - `https://your-vercel-url.vercel.app`
6. Click "Save"

---

## ✅ Step 5: Test Production!

1. Visit your Vercel URL
2. Register a new account
3. Verify email
4. Upload profile picture
5. Search for users
6. Follow someone
7. Test all features!

---

## 🔧 Continue Development

### Local Development (Unchanged):
```bash
# Backend
cd backend
npm run dev

# Frontend  
cd frontend
npm run dev
```

### Deploy Updates:
```bash
# Just push to GitHub!
git add .
git commit -m "Add new feature"
git push

# Vercel & Railway auto-deploy! 🎉
```

---

## 🐛 Troubleshooting

### Backend sleeping (503 error)?
- **Normal!** Free tier sleeps after 15 min
- First request wakes it (takes 30 seconds)
- Subsequent requests are instant
- **Solution:** Use a service like UptimeRobot to ping every 14 min (keeps it awake)

### Images not loading?
- Check Cloudinary credentials in Render
- Verify CORS settings allow your domain
- Check browser console for errors

### Database errors?
- Migrations run automatically on Render
- Check DATABASE_URL is correct in Render
- Verify Supabase project is active
- Check Render logs for migration errors

### CORS errors?
- Update `CORS_ORIGIN` in Render to your Vercel URL
- Save changes (triggers redeploy)
- Clear browser cache
- Wait 2-3 min for redeploy

### Google OAuth not working?
- Verify callback URL in Google Console
- Check `GOOGLE_CALLBACK_URL` in Render
- Ensure domain is authorized
- Check Render logs for OAuth errors

---

## 📊 Free Tier Limits (All FREE Forever!)

**Render (Backend):**
- ✅ **100% FREE** - No credit card
- ✅ 750 hours/month (enough for 24/7)
- ✅ Automatic deployments from GitHub
- ✅ Free SSL certificate
- ⚠️ Sleeps after 15 min (wakes in 30 sec)

**Vercel (Frontend):**
- ✅ **100% FREE** - No credit card
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Custom domain support
- ✅ Never sleeps - always fast!

**Supabase (Database):**
- ✅ **100% FREE** - No credit card
- ✅ 500MB database storage
- ✅ 2GB bandwidth/month
- ✅ Unlimited API requests
- ✅ Automatic backups

**Cloudinary (Images):**
- ✅ **100% FREE** - No credit card
- ✅ 25GB storage
- ✅ 25GB bandwidth/month
- ✅ Image transformations
- ✅ CDN delivery

**Total Monthly Cost: $0.00** 🎉

---

## 🎯 Next Steps

1. ✅ Deploy to production NOW
2. ✅ Test everything live
3. ✅ Continue adding features
4. ✅ Deploy updates automatically
5. ✅ Show to recruiters/college!

**You can develop locally AND have it live simultaneously!** 🚀

---

## 📝 Important Notes

- **Always test locally first** before pushing
- **Database migrations** run automatically on Railway
- **Environment variables** are separate for dev/prod
- **Logs** available in Railway dashboard
- **Analytics** available in Vercel dashboard

---

## 🎉 Success Checklist

- [ ] Database deployed on Supabase
- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] CORS configured correctly
- [ ] Google OAuth working
- [ ] Images uploading to Cloudinary
- [ ] Can register & login
- [ ] Can edit profile
- [ ] Can search users
- [ ] Can follow/unfollow
- [ ] Email verification working

**Once all checked, you have a LIVE production app!** 🎊
