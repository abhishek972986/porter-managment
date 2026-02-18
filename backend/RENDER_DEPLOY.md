# Deploy Backend to Render

## Quick Deploy Steps

### 1. Push Backend to GitHub

Make sure your backend code is pushed to GitHub:

```bash
cd backend
git add .
git commit -m "Prepare backend for Render deployment"
git push origin main
```

### 2. Create Render Account

1. Go to https://render.com/
2. Sign up with GitHub account
3. Authorize Render to access your repositories

### 3. Create New Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `abhishek972986/porter-managment`
3. Configure the service:

**Basic Settings:**
- **Name**: `porter-backend` (or any name you prefer)
- **Region**: Singapore (or closest to you)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
 - **Build Command**: `npm install && npx puppeteer browsers install chrome`
- **Start Command**: `node src/server.js`
- **Plan**: Free

### 4. Add Environment Variables

Click **"Advanced"** and add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb+srv://abhishekdabas2005:abhishekdabas2005@cluster0.xx3zhzb.mongodb.net/porter-management?retryWrites=true&w=majority&appName=Cluster0` |
| `JWT_ACCESS_SECRET` | (click "Generate" or use a strong random string) |
| `JWT_REFRESH_SECRET` | (click "Generate" or use a different strong random string) |
| `JWT_ACCESS_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | Your Vercel frontend URL (e.g., `https://porter-managment.vercel.app`) |
| `PUPPETEER_CACHE_DIR` | `/opt/render/.cache/puppeteer` |

### 5. Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Start your server
   - Assign a public URL (e.g., `https://porter-backend.onrender.com`)

### 6. Verify Deployment

Once deployed, test your endpoints:

```bash
# Health check
curl https://your-app.onrender.com/health

# Should return: {"status":"OK","timestamp":"..."}
```

### 7. Update Frontend

Update your frontend `.env` to use the Render backend URL:

```env
VITE_API_URL=https://your-app.onrender.com/api
```

Then redeploy your frontend on Vercel.

## Auto-Deploy

Render will automatically redeploy whenever you push to the `main` branch!

## Free Tier Limitations

- Service spins down after 15 minutes of inactivity
- First request after spindown takes ~30 seconds (cold start)
- 750 hours/month free

## Troubleshooting

### Check Logs
Go to your service dashboard → **"Logs"** tab

### Common Issues

1. **MongoDB Connection Failed**
   - Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
   - Check MONGODB_URI environment variable is correct

2. **Build Failed**
   - Ensure all dependencies are in `package.json`
   - Check build logs for specific errors

3. **Server Won't Start**
   - Verify Start Command is `node src/server.js`
   - Check logs for startup errors

## Seed Database

After first deployment, seed your database:

1. Go to Render dashboard → Your service → **"Shell"** tab
2. Run: `node src/scripts/seed.js`

Or use the web hook to trigger seed from your local machine.
