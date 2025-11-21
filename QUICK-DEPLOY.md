# ⚡ QUICK DEPLOY - 15 Minutes to Live! (100% FREE)

## 🎯 Goal
Get your app live in 15 minutes while keeping localhost working!

**Cost: $0.00 - No credit card needed!** 🎉

---

## ✅ Pre-Deployment Checklist

- [x] App works on localhost
- [x] Cloudinary configured
- [x] Gmail configured
- [x] Google OAuth configured
- [x] Database working locally

---

## 🚀 Deploy in 3 Steps (All FREE!)

### 1️⃣ Database - Supabase (2 min)
```
1. supabase.com → Sign up with GitHub
2. New Project → Name: nivora-social-media
3. Copy DATABASE_URL from Settings → Database
4. Done!
```

### 2️⃣ Backend - Render (7 min)
```
1. render.com → Sign up with GitHub (NO credit card!)
2. New + → Web Service → Connect your repo
3. Configure:
   - Root: backend
   - Build: npm install && npx prisma generate && npm run build
   - Start: npx prisma migrate deploy && node dist/index.js
   - Instance: FREE ✅
4. Add all .env variables (from backend/.env)
5. Update CORS_ORIGIN to vercel URL (do after step 3)
6. Create Service!
7. Copy your Render URL
```

### 3️⃣ Frontend - Vercel (3 min)
```
1. vercel.com → New Project → GitHub  
2. Root: frontend
3. Framework: Vite
4. Add VITE_API_URL (Render URL from step 2)
5. Deploy!
6. Copy your Vercel URL
```

### 4️⃣ Update URLs (3 min)
```
1. Render → Update CORS_ORIGIN with Vercel URL → Save
2. Google Console → Add callback URLs
3. Done!
```

---

## 🎉 You're Live!

**Production:** https://your-app.vercel.app
**Development:** http://localhost:5173

**Both work at the same time!** 🚀

---

## 💡 Pro Tips

1. **Push to GitHub** = Auto-deploy to production
2. **Test locally first** = Avoid production bugs
3. **Check Railway logs** = Debug production issues
4. **Use Vercel preview** = Test before going live

---

## 🐛 Common Issues

**Backend sleeping (503)?**
→ Normal! Free tier sleeps after 15 min. First request takes 30 sec to wake.

**Images not showing?**
→ Check Cloudinary credentials in Render Environment tab

**CORS error?**
→ Update CORS_ORIGIN in Render to your Vercel URL → Save

**Database error?**
→ Check DATABASE_URL in Render, verify Supabase is active

**Google OAuth not working?**
→ Add callback URL in Google Console: `https://your-app.onrender.com/api/auth/google/callback`

**Slow first load?**
→ Backend was sleeping. Use UptimeRobot to ping every 14 min (keeps awake)

---

## 📱 Share Your Live App!

Once deployed, share:
- ✅ With recruiters
- ✅ On LinkedIn
- ✅ In your resume
- ✅ With your college

**"Check out my live social media app: [your-url]"** 🎊
