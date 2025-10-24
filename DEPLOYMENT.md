# Deploy ZARA AI HUB to Netlify

## Step-by-Step Deployment Guide

### Prerequisites
- A Netlify account (free at https://netlify.com)
- Your code in a GitHub repository (optional but recommended)

---

## Method 1: Deploy via GitHub (Recommended)

### Step 1: Push to GitHub
1. In Replit, click the **Version Control** (Git) icon in the left sidebar
2. Click **Connect to GitHub** and authorize Replit
3. Click **Create new repo** and give it a name (e.g., "zara-ai-hub")
4. Click **Push to GitHub**

### Step 2: Connect Netlify to GitHub
1. Go to https://app.netlify.com
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** as the provider
4. Select your repository (e.g., "zara-ai-hub")

### Step 3: Configure Build Settings
Enter these settings:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Base directory**: (leave blank)

### Step 4: Deploy
1. Click **Deploy site**
2. Wait 2-3 minutes for the build to complete
3. Your site is live! 🎉

### Step 5: Set Environment Variables
1. In Netlify dashboard, go to **Site configuration** → **Environment variables**
2. Add any required environment variables (like `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. Click **Save**
4. Redeploy the site: **Deploys** → **Trigger deploy** → **Deploy site**

---

## Method 2: Deploy via Netlify CLI

### Step 1: Install Netlify CLI (in Replit Shell)
```bash
npm install -g netlify-cli
```

### Step 2: Build Your Project
```bash
npm run build
```

### Step 3: Login to Netlify
```bash
netlify login
```

### Step 4: Deploy
```bash
netlify deploy --prod
```

When prompted:
- **Create & configure a new site**: Yes
- **Team**: Choose your team
- **Site name**: Enter a unique name (e.g., zara-ai-hub)
- **Publish directory**: `dist`

---

## Method 3: Manual Upload (Quick & Easy)

### Step 1: Build Your Project
In Replit Shell, run:
```bash
npm run build
```

### Step 2: Download the Build Folder
1. In Replit, find the `dist` folder in the file tree
2. Right-click → **Download as zip**

### Step 3: Upload to Netlify
1. Go to https://app.netlify.com
2. Drag and drop the `dist` folder (or zip file) directly onto the Netlify dashboard
3. Your site is live in seconds! 🚀

---

## Custom Domain Setup (Optional)

### Add Your Own Domain
1. In Netlify dashboard, go to **Domain management**
2. Click **Add custom domain**
3. Enter your domain name (e.g., zaraai.com)
4. Follow instructions to update DNS records with your domain provider
5. Netlify will automatically provision SSL certificate

---

## Important Notes

### Environment Variables
Make sure to add these in Netlify:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- Any other `VITE_` prefixed variables your app uses

### Continuous Deployment
If you used Method 1 (GitHub):
- Every time you push to GitHub, Netlify automatically rebuilds and deploys
- Perfect for ongoing development!

### Free Plan Limits
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- Free SSL certificates

---

## Troubleshooting

### Build Failed?
- Check the build logs in Netlify
- Make sure all dependencies are in package.json
- Try building locally first: `npm run build`

### 404 Errors on Refresh?
Add a `_redirects` file in the `public` folder:
```
/*    /index.html   200
```

### Environment Variables Not Working?
- Make sure they start with `VITE_`
- Redeploy after adding new variables
- Check spelling and values

---

## Need Help?
Contact: 07011156046 or https://www.facebook.com/profile.php?id=61579058107810

---

**Deployment Build Settings Summary:**
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Environment**: Node.js 18+
