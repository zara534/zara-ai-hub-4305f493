# 🚀 Deploy ZARA AI HUB to Vercel

Complete guide to deploy your AI platform to production on Vercel.

## 📋 Prerequisites
- ✅ A Vercel account (free at https://vercel.com)
- ✅ Your code in a GitHub repository (recommended for auto-deploy)

---

## 🌟 Deploy via GitHub (RECOMMENDED - Auto-Deploy)

This method automatically redeploys your site whenever you push changes to GitHub!

### 📤 Step 1: Push Your Code to GitHub

#### From Replit:
1. Click the **Version Control** icon (looks like branches) in the left sidebar
2. Click **"Connect to GitHub"** button
3. Authorize Replit to access your GitHub account
4. Click **"Create new repo"** 
5. Give it a name like **"zara-ai-hub"**
6. Click **"Create repository and push"**
7. ✅ Your code is now on GitHub!

### 🔗 Step 2: Connect Vercel to GitHub
1. Go to https://vercel.com and sign in
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Find and select your repository (e.g., "zara-ai-hub")
5. Click **"Import"**

### ⚙️ Step 3: Configure Build Settings

**IMPORTANT:** Vercel should auto-detect Vite settings, but verify:

```
Framework Preset:     Vite
Build Command:        npm run build
Output Directory:     dist
Install Command:      npm install
```

### 🔐 Step 4: Add Environment Variables

If your app uses Supabase:

1. In Vercel project settings, scroll down to **Environment Variables**
2. Add these variables:
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon/public key
3. Click **"Save"**

### 🚀 Step 5: Deploy Your Site
1. Click **"Deploy"** button
2. Wait 2-5 minutes while Vercel:
   - Installs dependencies
   - Builds your project
   - Deploys to their edge network
3. 🎉 **Your site is LIVE!** You'll get a URL like: `https://YOUR-SITE-NAME.vercel.app`

### ✨ Auto-Deploy is Now Active!
Every time you push to GitHub, Vercel automatically rebuilds and deploys your site! 🔄

---

## 🔧 Troubleshooting Common Issues

### ❌ Blank White Page on Refresh
**Symptoms:** Page works fine when navigating, but shows blank page when refreshing

**Solution:** Make sure `vercel.json` exists in your project root with this content:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

✅ **This file is already included in your project!**

### ❌ Build Failed Error
**Solutions:**
1. Check build logs in Vercel for the exact error
2. Try building locally first: `npm run build`
3. Make sure `package.json` has all dependencies

### ❌ Environment Variables Not Working
**Solutions:**
1. ✅ Make sure all env vars start with `VITE_` prefix
2. ✅ Add them in Vercel: Project Settings → Environment Variables
3. ✅ Redeploy after adding (Deployments → ... → Redeploy)

---

## 🌐 Custom Domain Setup (Optional)

Want **zaraai.com** instead of **your-site.vercel.app**?

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Click **"Add"** button
3. Enter your domain (e.g., `zaraai.com`)
4. Follow the DNS configuration instructions
5. Wait for DNS to propagate (usually 24-48 hours)
6. ✅ Free SSL certificate is automatically added!

---

## 💎 Vercel Free Plan Includes:
- ✅ 100 GB bandwidth/month
- ✅ Unlimited sites and deployments
- ✅ Free SSL certificates (HTTPS)
- ✅ Global edge network (super fast)
- ✅ Automatic preview deployments for PRs
- ✅ Analytics and performance insights

---

**🎉 That's it! Your ZARA AI HUB is now live on Vercel!**
