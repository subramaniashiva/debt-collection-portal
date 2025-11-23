# Deployment Guide

## Deploying to Render (Recommended)

### Step 1: Prepare Your Code

Your code is already configured for Render! The following files enable deployment:
- `render.yaml` - Render configuration
- `package.json` - Build and start scripts
- `server/index.js` - Production environment handling

### Step 2: Push to GitHub

1. **Initialize Git (if not already done)**
```bash
cd /Users/sivasubbiah/code/portal
git init
```

2. **Create .gitignore (already exists)**
The `.gitignore` file will prevent unnecessary files from being committed.

3. **Commit your code**
```bash
git add .
git commit -m "Initial commit - Debt Collection Portal MVP"
```

4. **Create a GitHub repository**
- Go to https://github.com/new
- Create a new repository (e.g., "debt-collection-portal")
- Don't initialize with README (you already have one)

5. **Push to GitHub**
```bash
git remote add origin https://github.com/YOUR_USERNAME/debt-collection-portal.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy on Render

1. **Go to Render**
- Visit https://render.com
- Sign up with your GitHub account (or email)

2. **Create New Web Service**
- Click "New +" button → "Web Service"
- Click "Connect account" to authorize GitHub
- Select your `debt-collection-portal` repository

3. **Configure the Service**

Render will auto-detect most settings, but verify:

- **Name**: `debt-collection-portal` (or your choice)
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Plan**: Free (sufficient for MVP testing)

4. **Deploy**
- Click "Create Web Service"
- Render will build and deploy your app (takes 3-5 minutes)
- You'll get a URL like: `https://debt-collection-portal.onrender.com`

### Step 4: Share with Your Team

Once deployed, share the Render URL with your team. They can access it from any device with a web browser!

---

## Important Notes

### Data Persistence
- **Current setup**: In-memory storage (data resets on server restart)
- **Free tier**: Render spins down after 15 minutes of inactivity
- **When it wakes up**: Data will be lost

This is **perfect for demos** but you'll need a database for production.

### Free Tier Limitations
- Apps sleep after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- 750 hours/month of runtime (plenty for testing)

### Upgrading to Persistent Database

When ready for production, you can:
1. Add a PostgreSQL database on Render (free tier available)
2. Update `server/index.js` to use the database
3. No other changes needed

---

## Switching to Other Platforms

Your code is **platform-agnostic**. To switch:

### Railway
1. Go to railway.app
2. "New Project" → "Deploy from GitHub"
3. Select your repo
4. Railway auto-deploys (no config needed)

### Vercel
1. Go to vercel.com
2. "Import Project" → Select GitHub repo
3. Vercel detects and deploys

### DigitalOcean App Platform
1. Go to digitalocean.com/products/app-platform
2. "Create App" → Connect GitHub
3. Select repo and deploy

All platforms work with the **exact same code** - just push to GitHub and connect!

---

## Troubleshooting

### Build Fails
- Check the build logs in Render dashboard
- Ensure all dependencies are in `package.json`
- Contact support if needed

### App Won't Start
- Check start command is: `npm start`
- Verify environment variable `NODE_ENV=production`

### Can't Access After Deploy
- Wait 30-60 seconds for first load (free tier)
- Check Render dashboard for errors
- View logs in Render dashboard

---

## Next Steps After Deployment

1. **Test with your team**
2. **Gather feedback**
3. **When ready for production**:
   - Add database (PostgreSQL on Render)
   - Add user authentication
   - Upgrade to paid tier for always-on availability

---

## Support

Render has excellent documentation:
- Docs: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com
