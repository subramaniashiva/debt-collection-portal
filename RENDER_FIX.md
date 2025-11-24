# Render Deployment Fix

## Issue
The deployment was failing with error: `ENOENT: no such file or directory, stat '/opt/render/project/src/client/build/index.html'`

## What Was Fixed

### 1. Updated Build Command
Changed the build command in `render.yaml` to explicitly build the React app:
```yaml
buildCommand: npm install && cd client && npm install && npm run build && cd ..
```

### 2. Added Node Version Specification
- Added `.nvmrc` file with Node 18
- Added `engines` field in `package.json` to specify Node 18.x

### 3. Improved Error Handling
Updated `server/index.js` to handle missing build files gracefully with a helpful error message.

## How to Deploy Now

### Option 1: Push the Changes and Redeploy
```bash
git add .
git commit -m "Fix: Updated build configuration for Render deployment"
git push origin main
```

Render will automatically detect the changes and redeploy.

### Option 2: Manual Redeploy on Render
1. Go to your Render dashboard
2. Click on your service
3. Click "Manual Deploy" → "Clear build cache & deploy"

## What to Expect

The build process will now:
1. Install root dependencies
2. Navigate to client folder
3. Install client dependencies
4. Build the React app
5. Return to root
6. Start the server

This should take 3-5 minutes.

## Verification

Once deployed, your app should be accessible at:
`https://debt-collection-portal.onrender.com` (or your chosen name)

The first load might take 30-60 seconds as the free tier wakes up.

## If It Still Fails

Check the Render logs for the specific error and share it with me. Common issues:

1. **Out of memory during build**: Upgrade to paid tier (unlikely for this small app)
2. **Dependencies not found**: Check that all packages are in `package.json`
3. **Build timeout**: The free tier has a 15-minute build limit (should be plenty)

## Files Changed
- `render.yaml` - Updated build command
- `package.json` - Added Node version
- `.nvmrc` - Specifies Node 18
- `server/index.js` - Better error handling
