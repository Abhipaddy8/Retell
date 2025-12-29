# FMSIT Voice AI Agent - Railway Deployment Guide

## Status: ✅ Ready for Auto-Deployment

The FMSIT Voice AI Agent is now configured for automatic deployment to Railway.

## What's Configured

### Local Server
- **Status**: ✅ Running on `http://localhost:3000`
- **Start Command**: `npm run dev` (with nodemon auto-reload)
- **Health Check**: `GET /health`

### GitHub Repository
- **Repository**: https://github.com/Abhipaddy8/Retell.git
- **Branch**: `main`
- **Latest Commit**: Sophie voice AI with beautiful email reports

### Deployment Configuration
- **railway.json**: Configured with nixpacks builder
- **Dockerfile**: Multi-stage Node.js Alpine build
- **Start Command**: `npm start`
- **Port**: 3000

### Environment Variables Required on Railway
```
RETELL_API_KEY=key_26f12b23575924c20634fb962239
GHL_API_KEY=pit-ff96b62e-fa5d-4b62-86cb-1ac46077147d
GHL_LOCATION_ID=c4SipARcShMhcCJkkFqI
PORT=3000
```

## Auto-Deployment Setup

### Option 1: Deploy via Railway Dashboard (Easiest)

1. **Go to Railway Dashboard**: https://dashboard.railway.app
2. **Create New Project**
   - Click "+ New Project"
   - Select "Deploy from GitHub"
3. **Connect GitHub**
   - Authorize Railway to access your GitHub
   - Select repository: `Abhipaddy8/Retell`
   - Select branch: `main`
4. **Configure Environment**
   - Add variables from `.env`:
     - `RETELL_API_KEY`
     - `GHL_API_KEY`
     - `GHL_LOCATION_ID`
     - `PORT=3000`
5. **Deploy**
   - Click "Deploy"
   - Railway will auto-build and deploy
   - Get your public Railway URL (looks like: `https://fmsit-voice-ai-production.up.railway.app`)

### Option 2: Deploy via CLI (Advanced)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway (interactive)
railway login

# Link to existing project or create new
cd /Users/equipp/fmsit voice ai agent
railway link

# Add environment variables
railway variables set RETELL_API_KEY=key_26f12b23575924c20634fb962239
railway variables set GHL_API_KEY=pit-ff96b62e-fa5d-4b62-86cb-1ac46077147d
railway variables set GHL_LOCATION_ID=c4SipARcShMhcCJkkFqI
railway variables set PORT=3000

# Deploy
railway up
```

## Auto-Deployment Process

Once connected to Railway:

### Every Commit Triggers Auto-Deploy
1. You push to GitHub `main` branch
2. GitHub webhook notifies Railway
3. Railway automatically:
   - Pulls latest code
   - Installs dependencies (`npm ci`)
   - Builds with Dockerfile
   - Starts the server (`npm start`)
   - Runs health checks
4. Your live deployment updates automatically

### Zero-Downtime Deployments
- Railway handles rolling deployments
- Your live service won't go down during updates
- Takes ~2-3 minutes per deployment

## Testing the Deployment

### 1. Test Health Check
```bash
curl https://YOUR_RAILWAY_URL/health
# Expected response: {"status": "ok", "timestamp": "..."}
```

### 2. Test Webhook Endpoint
```bash
curl -X POST https://YOUR_RAILWAY_URL/retell-webhook \
  -H "Content-Type: application/json" \
  -d '{"event": "call_started", "call": {"call_id": "test123"}}'
```

### 3. Make a Real Test Call
- Set Retell Agent webhook URL to: `https://YOUR_RAILWAY_URL/retell-webhook`
- Make a test call to Sophie
- Verify call is processed
- Check GHL for contact creation
- Verify email is received

## Monitoring

### View Logs
```bash
railway logs
```

### View Status
```bash
railway status
```

### View Variables
```bash
railway variables
```

## Files for Deployment

```
/fmsit voice ai agent/
├── railway.json              # Railway configuration
├── Dockerfile                # Docker build configuration
├── package.json              # Node.js dependencies
├── .env                      # Environment variables (local only)
├── server.js                 # Main Express server
├── agent-prompt.md           # Sophie's system prompt
├── knowledge-base.md         # FAQ and conversation topics
└── configure-sophie-voice.js # Voice configuration script
```

## Deployment Checklist

- [x] Code committed to GitHub
- [x] railway.json configured
- [x] Dockerfile created
- [x] Environment variables documented
- [x] Health check endpoint ready
- [x] Webhook endpoint ready
- [ ] Railway project created (do this in dashboard)
- [ ] Environment variables added to Railway
- [ ] GitHub connected to Railway
- [ ] First deployment triggered
- [ ] Webhook URL updated in Retell
- [ ] Test call successful

## After Deployment

### Update Retell Webhook URL
Once you have your Railway public URL:

1. Go to Retell Dashboard
2. Edit Sophie agent
3. Update **Custom Server URL** to: `https://YOUR_RAILWAY_URL`
4. Save changes

### Verify Email Integration
After a test call:
1. Check GHL for new contact
2. Check email for recap report
3. Verify it's the beautiful HTML template
4. Check "FMSIT Tech Team" signature

## Troubleshooting

### Deployment Fails
```bash
# Check logs
railway logs

# Common issues:
# 1. Missing environment variables
railway variables list

# 2. Port already in use
# Railway will auto-assign, but 3000 should be free

# 3. Dependency issues
npm ci
```

### Webhook Not Working
```bash
# Test locally first
curl -X POST http://localhost:3000/retell-webhook \
  -H "Content-Type: application/json" \
  -d '{"event": "call_started"}'

# Check Railway logs for errors
railway logs
```

### Email Not Sending
- Verify GHL credentials in Railway variables
- Check logs for GHL API errors
- Confirm location ID is correct
- Test contact creation endpoint

## Performance & Scaling

### Current Setup
- **Replicas**: 1 (single instance)
- **Memory**: Auto-allocated (typically 512MB)
- **CPU**: Shared (sufficient for 5-10 concurrent calls)

### Scale Up If Needed
```bash
# In railway.json, increase numReplicas
"numReplicas": 3  # 3 instances for high load
```

## Security

### Environment Variables
- ✅ Stored securely in Railway
- ✅ Never committed to git
- ✅ Not visible in logs

### API Keys
- Retell API Key: Secure
- GHL API Key: Secure
- Not exposed in responses

### HTTPS
- Railway provides free HTTPS
- All traffic encrypted
- Retell signature verification in place

## Cost

### Railway Pricing (as of Dec 2025)
- **Free Tier**: $5/month included credit
- **Usage**: Typically $2-5/month for voice AI with this volume
- **No startup fees**
- **Pay-as-you-go billing**

## Next Steps

1. **Create Railway Project**
   - Visit: https://dashboard.railway.app
   - Create project and connect GitHub

2. **Add Environment Variables**
   - Copy from local `.env`

3. **First Deployment**
   - Railway auto-deploys on connection
   - Takes ~2-3 minutes

4. **Update Retell Webhook**
   - Get your Railway URL
   - Update Sophie's webhook URL in Retell

5. **Test Live Deployment**
   - Make test call
   - Verify all systems working

6. **Monitor & Maintain**
   - Check logs regularly
   - Monitor for errors
   - Update code as needed (auto-deploys)

## Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway GitHub Integration](https://docs.railway.app/deploy/github)
- [Node.js on Railway](https://docs.railway.app/develop/services/nodejs)
- [Environment Variables](https://docs.railway.app/reference/variables)

---

**Status**: ✅ Ready for Deployment
**Last Updated**: December 29, 2025
**Next Action**: Create Railway project and connect GitHub
