# Netlify Deployment Guide - Sky Guardian

## 🚀 Quick Start Deployment

### Step 1: Build the Project
```bash
# Navigate to project directory
cd d:\Downloads\sky-guardian-main\sky-guardian-main

# Install dependencies (if not already done)
npm install

# Build for production
npm run build
```

### Step 2: Verify Build Output
After running `npm run build`, check that:
- ✅ `dist/` folder was created
- ✅ `dist/index.html` exists
- ✅ `dist/_redirects` exists (copied from public folder)
- ✅ `dist/assets/` contains JS and CSS files

### Step 3: Deploy to Netlify

#### Option A: Drag & Drop (Recommended for First Deploy)
1. Go to https://app.netlify.com/
2. Sign in or create account
3. Drag the entire `dist` folder onto the deploy area
4. Wait for deployment to complete

#### Option B: Netlify CLI
```bash
# Install Netlify CLI (one-time)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --dir=dist --prod
```

### Step 4: Configure Environment Variables
1. In Netlify dashboard, go to: **Site settings → Environment variables**
2. Add the following:
   - **Key**: `VITE_AI_API_KEY`
   - **Value**: `[Your API Key from .env file]`
3. **Important**: After adding variables, trigger a redeploy:
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Deploy site**

---

## 📁 Project Structure for Netlify

```
sky-guardian-main/
├── dist/                    # Build output (created by npm run build)
│   ├── index.html
│   ├── _redirects          # SPA routing config (auto-copied from public/)
│   └── assets/
├── public/
│   └── _redirects          # Source file for SPA routing
├── netlify.toml            # Netlify configuration
└── package.json
```

---

## ⚙️ Configuration Files

### netlify.toml (Root Directory)
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build]
  publish = "dist"
  command = "npm run build"
```

### public/_redirects
```
/*    /index.html   200
```

**Why both files?**
- `netlify.toml`: Main configuration for Netlify builds
- `public/_redirects`: Fallback for manual deploys (drag & drop)

---

## 🔍 Verification Checklist

After deployment, verify:

### 1. Routing Works
- [ ] Visit your site URL (e.g., `https://your-site.netlify.app`)
- [ ] Navigate to `/login` - should show login page
- [ ] Navigate to `/dashboard` - should redirect or show dashboard
- [ ] Refresh browser on `/dashboard` - should NOT show 404

### 2. Assets Load
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab - no 404 errors for CSS/JS files
- [ ] Check Network tab - all assets load successfully

### 3. API Integration
- [ ] Check browser console for API errors
- [ ] Verify environment variables are set in Netlify
- [ ] Test AI analysis features

---

## 🐛 Troubleshooting

### Issue: 404 on Routes (Page Not Found)

**Symptoms:**
- Homepage works, but `/dashboard` shows 404
- Refreshing any route shows "Page not found"

**Solutions:**
1. Verify `_redirects` file exists in `dist/` folder after build
2. Check `netlify.toml` is in root directory
3. Redeploy the site

**Quick Fix:**
```bash
# Rebuild and check
npm run build
ls dist/_redirects  # Should exist

# If missing, manually copy
copy public\_redirects dist\_redirects
```

---

### Issue: Blank White Page

**Symptoms:**
- Site loads but shows blank page
- No errors in browser console

**Solutions:**
1. Check browser console (F12) for JavaScript errors
2. Verify environment variables in Netlify
3. Check that build completed successfully

**Debug Steps:**
```bash
# Test build locally
npm run build
npm run preview  # Test production build locally
```

---

### Issue: API Errors / Features Not Working

**Symptoms:**
- Console shows API errors
- AI analysis doesn't work
- Authentication fails

**Solutions:**
1. Add environment variables in Netlify:
   - Go to Site settings → Environment variables
   - Add `VITE_AI_API_KEY`
2. Trigger a redeploy after adding variables
3. Check API key is valid

---

### Issue: Assets Not Loading (CSS/JS 404)

**Symptoms:**
- Unstyled page
- Console shows 404 for CSS/JS files

**Solutions:**
1. Check `vite.config.ts` - ensure no custom `base` path
2. Verify build output in `dist/assets/`
3. Clear Netlify cache and redeploy

---

## 🔄 Continuous Deployment (Optional)

To enable automatic deploys from Git:

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/sky-guardian.git
git push -u origin main
```

### 2. Connect to Netlify
1. In Netlify dashboard, click **Add new site** → **Import an existing project**
2. Choose **GitHub** and authorize
3. Select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variables
6. Click **Deploy site**

### 3. Auto-Deploy Setup
- Every push to `main` branch will trigger automatic deployment
- Pull requests can create preview deployments

---

## 📊 Build Settings Summary

| Setting | Value |
|---------|-------|
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |
| **Node version** | 18.x or higher |
| **Environment variables** | `VITE_AI_API_KEY` |

---

## 🎯 Post-Deployment Tasks

1. **Custom Domain** (Optional)
   - Go to Site settings → Domain management
   - Add your custom domain

2. **HTTPS** (Automatic)
   - Netlify provides free SSL certificates
   - Enabled automatically

3. **Performance**
   - Check Lighthouse score
   - Enable Netlify's asset optimization (optional)

4. **Monitoring**
   - Set up Netlify Analytics (optional)
   - Monitor deploy logs for errors

---

## 📞 Support Resources

- **Netlify Docs**: https://docs.netlify.com/
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html
- **React Router**: https://reactrouter.com/en/main/guides/deploying

---

## ✅ Final Checklist

Before marking deployment as complete:

- [ ] Build completes without errors
- [ ] `dist/` folder contains all necessary files
- [ ] `_redirects` file is in `dist/`
- [ ] Site deploys successfully to Netlify
- [ ] Environment variables configured
- [ ] All routes work (no 404s)
- [ ] Assets load correctly
- [ ] API integration works
- [ ] Mobile responsive (test on phone)
- [ ] Browser refresh works on all routes

---

**Deployment Date**: _____________  
**Site URL**: _____________  
**Status**: ⬜ Pending | ⬜ In Progress | ⬜ Complete
