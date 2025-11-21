# 🚀 Deploy Everything on Vercel (100% FREE, Never Sleeps!)

## Why Vercel for Everything?
- ✅ **You're already familiar with it!**
- ✅ **Never sleeps** - Always instant
- ✅ **100% FREE** - No credit card
- ✅ **One platform** - Frontend + Backend together
- ✅ **Auto-deploys** - Push to GitHub = Live
- ✅ **Global CDN** - Fast worldwide

---

## 🎯 Architecture

```
┌─────────────────────────────────────────┐
│         Vercel (FREE)                   │
│  ┌─────────────┐  ┌─────────────┐      │
│  │  Frontend   │  │   Backend   │      │
│  │   (React)   │  │  (Express)  │      │
│  └─────────────┘  └─────────────┘      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  Database: Supabase (FREE)              │
│  Images: Cloudinary (FREE)              │
└─────────────────────────────────────────┘
```

**Total Cost: $0.00 | Never Sleeps: ✅**

---

## 📦 Step 1: Prepare Backend for Vercel

Your backend is already compatible! The `vercel.json` file is configured.

**What it does:**
- Routes `/api/*` → Backend (Express)
- Routes `/*` → Frontend (React)
- Runs backend as serverless functions

---

## 🗄️ Step 2: Deploy Database (Supabase - 2 min)

1. Go to https://supabase.com
2. Sign up with GitHub
3. Create new project:
   - Name: `nivora-social-media`
   - Password: (save this!)
   - Region: Choose closest
4. Wait 2 minutes
5. Go to **Settings** → **Database** → **Connection String**
6. Copy the **URI** format
7. Replace `[YOUR-PASSWORD]` with your password

**Save this DATABASE_URL for next step!**

---

## 🚀 Step 3: Deploy to Vercel (5 min)

### 3.1 Push to GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 3.2 Deploy on Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: Leave empty (monorepo)
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Output Directory**: `frontend/dist`
   - **Install Command**: `npm install --prefix frontend && npm install --prefix backend`

### 3.3 Add Environment Variables

Click "Environment Variables" and add:

```env
# Database
DATABASE_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:5432/postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-app.vercel.app/api/auth/google/callback

# CORS (will update after deploy)
CORS_ORIGIN=https://your-app.vercel.app
FRONTEND_URL=https://your-app.vercel.app

# Frontend API URL
VITE_API_URL=https://your-app.vercel.app
VITE_SOCKET_URL=https://your-app.vercel.app
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=social_media_app
VITE_PEER_HOST=peerjs-server.herokuapp.com
VITE_PEER_PORT=443
```

5. Click "Deploy"
6. Wait 3-5 minutes
7. Copy your Vercel URL (e.g., `https://nivora.vercel.app`)

---

## 🔄 Step 4: Update URLs

### 4.1 Update Vercel Environment Variables

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Update these with your actual Vercel URL:
   - `CORS_ORIGIN` = `https://your-app.vercel.app`
   - `FRONTEND_URL` = `https://your-app.vercel.app`
   - `GOOGLE_CALLBACK_URL` = `https://your-app.vercel.app/api/auth/google/callback`
   - `VITE_API_URL` = `https://your-app.vercel.app`
   - `VITE_SOCKET_URL` = `https://your-app.vercel.app`
3. Click "Save"
4. Go to Deployments → Click "..." → "Redeploy"

### 4.2 Update Google OAuth

1. Go to https://console.cloud.google.com
2. APIs & Services → Credentials
3. Edit your OAuth Client
4. Add to **Authorized redirect URIs**:
   - `https://your-app.vercel.app/api/auth/google/callback`
5. Add to **Authorized JavaScript origins**:
   - `https://your-app.vercel.app`
6. Click "Save"

---

## ✅ Step 5: Test Your Live App!

1. Visit `https://your-app.vercel.app`
2. Register a new account
3. Verify email
4. Upload profile picture
5. Search for users
6. Follow someone
7. Edit profile

**Everything should work instantly - no sleep mode!** 🎉

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
git add .
git commit -m "Add new feature"
git push

# Vercel auto-deploys in 2-3 minutes! 🚀
```

---

## 🐛 Troubleshooting

### Build fails?
- Check Vercel build logs
- Verify all environment variables are set
- Ensure `vercel.json` is in root directory

### API not working?
- Check `/api/health` endpoint
- Verify DATABASE_URL is correct
- Check Vercel function logs

### Images not loading?
- Verify Cloudinary credentials
- Check CORS settings
- Test upload signature endpoint

### Database errors?
- Prisma needs to generate client on build
- Check if migrations ran
- Verify Supabase connection string

### CORS errors?
- Update CORS_ORIGIN to your Vercel URL
- Redeploy
- Clear browser cache

---

## 📊 Vercel Free Tier

**Frontend:**
- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Custom domain
- ✅ Never sleeps

**Backend (Serverless Functions):**
- ✅ 100GB bandwidth/month
- ✅ 100 hours execution time/month
- ✅ 1000 invocations/day
- ✅ Never sleeps - instant response!

**More than enough for a portfolio project!**

---

## 🎯 Advantages of Vercel-Only Deployment

1. ✅ **Never sleeps** - Always instant
2. ✅ **One platform** - Easier to manage
3. ✅ **You know it** - No learning curve
4. ✅ **Auto-deploys** - Push = Live
5. ✅ **Global CDN** - Fast worldwide
6. ✅ **Free SSL** - HTTPS automatic
7. ✅ **Preview deployments** - Test before live
8. ✅ **100% FREE** - No credit card

---

## 🎉 Success Checklist

- [ ] Supabase database created
- [ ] GitHub repo pushed
- [ ] Vercel project created
- [ ] All environment variables added
- [ ] First deployment successful
- [ ] URLs updated in Vercel
- [ ] Google OAuth configured
- [ ] Can register & login
- [ ] Can upload images
- [ ] Can search users
- [ ] Can follow/unfollow
- [ ] Email verification works

**Once all checked, you have a LIVE app that never sleeps!** 🎊

---

## 💡 Pro Tips

1. **Preview Deployments**: Every PR gets a preview URL
2. **Environment Variables**: Can be different per environment
3. **Logs**: Check Vercel dashboard for function logs
4. **Analytics**: Built-in analytics in Vercel
5. **Custom Domain**: Add your own domain for free

---

## 🚀 You're Live!

**Production:** https://your-app.vercel.app
**Development:** http://localhost:5173

**Both work simultaneously!** 🎉

Share your live app:
- ✅ With recruiters
- ✅ On LinkedIn
- ✅ In your resume
- ✅ With your college

**"Check out my live social media app: [your-url]"** 🎊
