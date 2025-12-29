# Railway Auto-Deployment - Quick Start (5 Minutes)

## ⚡ Deploy Sophie to Production in 5 Minutes

### Step 1: Go to Railway Dashboard (1 minute)
1. Visit: https://dashboard.railway.app
2. Sign in to your Railway account
3. Click **"+ New Project"**

### Step 2: Connect GitHub (1 minute)
1. Select **"Deploy from GitHub"**
2. Click **"Connect GitHub"**
   - Authorize Railway to access your repos
3. Select repository: **`Abhipaddy8/Retell`**
4. Select branch: **`main`**
5. Click **"Deploy"**

### Step 3: Add Environment Variables (2 minutes)
Railway will open the project. Go to **Variables** tab:

Add these 4 variables (copy from your local .env):
```
RETELL_API_KEY=key_26f12b23575924c20634fb962239
GHL_API_KEY=pit-ff96b62e-fa5d-4b62-86cb-1ac46077147d
GHL_LOCATION_ID=c4SipARcShMhcCJkkFqI
PORT=3000
```

Click **"Deploy"**

### Step 4: Get Your Public URL (1 minute)
Once deployment completes (green checkmark):
- Go to **Settings** tab
- Find **"Public URL"** or **"Deployment URL"**
- Copy the URL (looks like: `https://fmsit-voice-ai-production.up.railway.app`)

## ✅ Deployment Complete!

Your Sophie voice AI is now live at the Railway URL.

### Next: Update Retell Webhook

1. Go to **Retell Dashboard**
2. Edit **Sophie** agent
3. Set **Custom Server URL** to your Railway URL:
   ```
   https://your-railway-url
   ```
4. Save

### Test the Live Deployment

```bash
# Test health check
curl https://your-railway-url/health

# Should respond with:
# {"status": "ok", "timestamp": "..."}
```

## 🎯 That's It!

Your voice AI is now:
- ✅ Live on the internet
- ✅ Auto-deploys on every GitHub push
- ✅ Sending beautiful email reports
- ✅ Using Sophie's female voice
- ✅ Consultative approach active

## Auto-Deploy Going Forward

Every time you push to GitHub:
```bash
git add -A
git commit -m "your changes"
git push origin main
```

Railway will **automatically**:
1. Pull your changes
2. Install dependencies
3. Build and test
4. Deploy (no downtime)
5. Updates live in 2-3 minutes

## Monitor Your Deployment

In Railway Dashboard:

```bash
# View recent logs
railway logs

# View deployment status
railway status

# View live variables
railway variables
```

## Troubleshooting

### Deployment Failed?
- Check **Deployments** tab for error logs
- Verify all 4 environment variables are set
- Check Railway status page for outages

### Can't Connect?
- Wait 30 seconds after deployment completes
- Verify URL is correct (no typos)
- Clear browser cache and try again

### Email Not Sending?
- Verify GHL credentials in Railway variables
- Check logs: `railway logs | grep "GHL\|email\|error"`

## See Full Documentation

For detailed information, see: **DEPLOYMENT.md**

---

**Status**: ✅ Ready for Production
**Last Updated**: December 29, 2025
