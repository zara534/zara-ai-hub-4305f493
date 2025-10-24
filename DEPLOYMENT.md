# 🚀 Deploy ZARA AI HUB to Netlify

Complete guide to deploy your AI platform to production on Netlify.

## 📋 Prerequisites
- ✅ A Netlify account (free at https://netlify.com)
- ✅ Your code in a GitHub repository (recommended for auto-deploy)

---

## 🌟 Method 1: Deploy via GitHub (RECOMMENDED - Auto-Deploy)

This method automatically redeploys your site whenever you push changes to GitHub!

### 📤 Step 1: Push Your Code to GitHub

#### From Replit:
1. Click the **Version Control** icon (looks like branches) in the left sidebar
2. Click **"Connect to GitHub"** button
3. Authorize Replit to access your GitHub account
4. Click **"Create new repo"** 
5. Give it a name like **"zara-ai-hub"** or **"my-ai-platform"**
6. Click **"Create repository and push"**
7. ✅ Your code is now on GitHub!

### 🔗 Step 2: Connect Netlify to GitHub
1. Go to https://app.netlify.com and sign in
2. Click the big **"Add new site"** button
3. Select **"Import an existing project"**
4. Choose **"Deploy with GitHub"**
5. Authorize Netlify to access your GitHub repositories
6. Find and select your repository (e.g., "zara-ai-hub")

### ⚙️ Step 3: Configure Build Settings

**IMPORTANT:** Enter these exact settings:

```
Build command:       npm run build
Publish directory:   dist
Base directory:      (leave blank)
```

**Screenshot of settings:**
- Build command: `npm run build`
- Publish directory: `dist`
- Leave everything else as default

### 🚀 Step 4: Deploy Your Site
1. Click **"Deploy [your-site-name]"** button
2. Wait 2-5 minutes while Netlify:
   - Installs dependencies (npm install)
   - Builds your project (npm run build)
   - Publishes to their CDN
3. 🎉 **Your site is LIVE!** You'll get a URL like: `https://YOUR-SITE-NAME.netlify.app`

### 🔐 Step 5: Add Environment Variables (If Needed)

If your app uses Supabase or other services:

1. In Netlify dashboard, click **Site configuration**
2. Go to **Environment variables** section
3. Click **"Add a variable"**
4. Add these (if you use Supabase):
   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon/public key
5. Click **"Save"**
6. **Redeploy**: Go to **Deploys** → **Trigger deploy** → **Deploy site**

### ✨ Auto-Deploy is Now Active!
Every time you push to GitHub, Netlify automatically rebuilds and deploys your site! 🔄

---

## ⚡ Method 2: Deploy via Netlify CLI (Quick One-Time Deploy)

Perfect for testing before setting up auto-deploy!

### Step 1: Install Netlify CLI
In Replit Shell, run:
```bash
npm install -g netlify-cli
```

### Step 2: Build Your Project
```bash
npm run build
```
This creates the `dist` folder with your production files.

### Step 3: Login to Netlify
```bash
netlify login
```
This opens a browser window - click **"Authorize"** to connect.

### Step 4: Deploy to Production
```bash
netlify deploy --prod
```

**Answer the prompts:**
- **Create & configure a new site?** → Yes
- **Team**: Select your team name
- **Site name**: Enter something unique like `zara-ai-hub-2025`
- **Publish directory**: Type `dist` and press Enter

✅ Done! Your site is live at the URL shown!

---

## 📦 Method 3: Drag & Drop Deploy (EASIEST - No Git Required)

Perfect for beginners or quick testing!

### Step 1: Build Your Project
In Replit Shell, run:
```bash
npm run build
```
Wait until you see "✓ built in XXXms"

### Step 2: Download the Build Folder
1. Look at the left sidebar in Replit
2. Find the **`dist`** folder 
3. Right-click on it
4. Click **"Download as zip"** or **"Download"**
5. Save it to your computer

### Step 3: Upload to Netlify
1. Go to https://app.netlify.com
2. Look for the dotted box that says **"Want to deploy a new site without connecting to Git? Drag and drop your site output folder here"**
3. **Drag the `dist` folder** (or unzip it first) onto that box
4. ⚡ **Your site is LIVE in 10 seconds!**

**Note:** This method doesn't auto-deploy. You'll need to manually upload each time you make changes.

---

---

## 🌐 Custom Domain Setup (Optional)

Want **zaraai.com** instead of **your-site.netlify.app**? Here's how:

### Add Your Own Domain
1. In Netlify dashboard, go to **Domain management** tab
2. Click **"Add custom domain"** button
3. Enter your domain (e.g., `zaraai.com`)
4. Netlify will show you DNS settings
5. Go to your domain registrar (GoDaddy, Namecheap, etc.)
6. Update your DNS records with Netlify's values
7. Wait 24-48 hours for DNS to propagate
8. ✅ Free SSL certificate is automatically added!

---

## 📝 Important Configuration Notes

### 🔐 Environment Variables (Supabase Users)
If you're using Supabase authentication, you MUST add:
- `VITE_SUPABASE_URL` = Your project URL from Supabase dashboard
- `VITE_SUPABASE_ANON_KEY` = Your anon key from Supabase dashboard

**How to add:**
1. Netlify Dashboard → Site configuration → Environment variables
2. Click "Add a variable"
3. Enter variable name and value
4. Save and redeploy!

### 🔄 Auto-Deploy (GitHub Method Only)
- ✅ Automatic: Every GitHub push triggers a new deploy
- ⏱️ Build time: Usually 2-5 minutes
- 📧 Email notifications when deploy completes
- 🔙 Rollback to any previous deploy with 1 click

### 💎 Netlify Free Plan Includes:
- ✅ 100 GB bandwidth/month (plenty for most apps)
- ✅ 300 build minutes/month
- ✅ Unlimited sites
- ✅ Free SSL certificates (HTTPS)
- ✅ Instant cache invalidation
- ✅ Deploy previews for pull requests

---

## 🔧 Troubleshooting Common Issues

### ❌ Build Failed Error
**Symptoms:** Red X next to your deploy, "Deploy failed" message

**Solutions:**
1. Check build logs in Netlify for the exact error
2. Try building locally first: `npm run build`
3. Make sure `package.json` has all dependencies
4. Check that Node version matches (Netlify uses Node 18+)

**Quick fix:**
```bash
# In Replit Shell, test build locally
npm run build

# If it works locally, try rebuilding on Netlify
```

### ❌ 404 Error on Page Refresh
**Symptoms:** Page loads fine, but refreshing shows "404 Not Found"

**Solution:** Create a `_redirects` file in your `public` folder:

**File:** `public/_redirects`
```
/*    /index.html   200
```

Then rebuild and redeploy!

### ❌ Environment Variables Not Working
**Symptoms:** App works in Replit but fails in production

**Solutions:**
1. ✅ Make sure all env vars start with `VITE_` prefix
2. ✅ Add them in Netlify: Site configuration → Environment variables
3. ✅ Redeploy after adding (Deploys → Trigger deploy)
4. ✅ Check exact spelling and values

### ❌ Site Loading Slowly
**Solutions:**
- Netlify automatically uses global CDN (should be fast)
- Check if images are optimized
- Make sure you're using production build (`npm run build`)

---

## 📞 Need Help?

**Contact ZARA AI HUB:**
- 📱 Phone/WhatsApp: 07011156046
- 📘 Facebook: https://www.facebook.com/profile.php?id=61579058107810

**Netlify Support:**
- 📚 Docs: https://docs.netlify.com
- 💬 Community: https://answers.netlify.com

---

## ✅ Quick Reference Card

```
┌─────────────────────────────────────────┐
│   NETLIFY DEPLOYMENT QUICK REFERENCE    │
├─────────────────────────────────────────┤
│  Build Command:     npm run build       │
│  Publish Directory: dist                │
│  Node Version:      18.x (automatic)    │
│  Framework:         Vite + React        │
├─────────────────────────────────────────┤
│  GitHub Auto-Deploy: ✅ Recommended     │
│  Drag & Drop:        ✅ Easiest         │
│  Netlify CLI:        ✅ For testing     │
└─────────────────────────────────────────┘
```

---

**🎉 That's it! Your ZARA AI HUB is now live on Netlify!**
