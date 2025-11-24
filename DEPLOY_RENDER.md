# Deploy to Render.com

## Prerequisites
✅ Package.json with `engines` field (Node >= 18.0.0)
✅ SQLite3 package for database
✅ All dependencies properly listed

## Deployment Steps

### 1. Push Code to GitHub/GitLab
```bash
cd backend
git init
git add .
git commit -m "Initial commit for Render deployment"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### 2. Deploy on Render.com

1. Go to https://render.com and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub/GitLab repository
4. Configure the service:

   **Basic Settings:**
   - **Name**: `expense-tracker-api`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend` (if repo includes both frontend & backend)
   - **Environment**: `Node`

   **Build & Deploy:**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

   **Instance Type:**
   - Select **Free** tier (or paid for better performance)

5. Click **"Create Web Service"**

### 3. Environment Variables (Optional)
Add in Render dashboard:
- `NODE_ENV` = `production`
- `PORT` = `10000` (Render uses this by default)

### 4. Access Your API
After deployment completes (5-10 minutes):
- Your API will be available at: `https://expense-tracker-api.onrender.com`
- Test endpoints:
  - `https://YOUR-SERVICE.onrender.com/health`
  - `https://YOUR-SERVICE.onrender.com/api/clients`
  - `https://YOUR-SERVICE.onrender.com/api/dashboard`

## Important Notes for Render

### SQLite Persistence
⚠️ **Important**: Render's free tier has ephemeral storage. Your SQLite database will be reset on each deployment or when the service restarts after inactivity.

**Solutions:**
1. **Use Render PostgreSQL** (recommended for production)
   - Add PostgreSQL service in Render dashboard
   - Modify `database.js` to use PostgreSQL instead of SQLite
   
2. **Use external database** (MongoDB Atlas, PlanetScale, etc.)

3. **Accept data loss** (OK for testing/demo purposes)

### Free Tier Limitations
- ⏰ Service spins down after 15 minutes of inactivity
- 🔄 First request after spin-down takes ~30 seconds
- 💾 Ephemeral storage (data resets on restart)
- 🆓 750 hours/month free (enough for 1 service running 24/7)

### Upgrade Recommendations
For production use:
- ✅ Paid instance ($7+/month) - stays always on
- ✅ Use PostgreSQL instead of SQLite
- ✅ Enable auto-deploy from GitHub
- ✅ Set up health checks

## Testing After Deployment

```powershell
# Test health endpoint
Invoke-WebRequest -Uri https://YOUR-SERVICE.onrender.com/health

# Test API root
Invoke-WebRequest -Uri https://YOUR-SERVICE.onrender.com/

# Create a client
$body = @{
    name = "Test Client"
    email = "test@example.com"
} | ConvertTo-Json

Invoke-WebRequest -Uri https://YOUR-SERVICE.onrender.com/api/clients -Method POST -Body $body -ContentType "application/json"
```

## Troubleshooting

### Build Fails
- Check Node version in `package.json` engines
- Verify all dependencies are in `package.json`
- Check Render build logs

### Service Crashes
- Check Render logs for errors
- Verify `PORT` environment variable is used correctly
- Ensure database file path is writable

### CORS Issues
- Update CORS configuration in `server.js` if needed
- Add your frontend domain to allowed origins

## Auto-Deploy Setup
1. In Render dashboard, go to your service
2. Settings → Build & Deploy
3. Enable **"Auto-Deploy"** - deploys automatically on git push

## Monitoring
- View logs in real-time: Render Dashboard → Logs
- Set up alerts for service failures
- Monitor usage and performance metrics
