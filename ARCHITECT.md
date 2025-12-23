# FMSIT Voice AI Agent - Architecture

## System Overview

Inbound sales voice agent powered by Retell AI with GoHighLevel CRM integration.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Inbound Call  │────▶│   Retell AI     │────▶│  Webhook Server │
│   (Prospect)    │     │   (Alex)        │     │  (Node.js)      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                    ┌───────────────────┴───────────────────┐
                                    ▼                                       ▼
                           ┌─────────────────┐                     ┌─────────────────┐
                           │  GHL Contact    │                     │  GHL Email      │
                           │  (Create Lead)  │                     │  (Send Recap)   │
                           └─────────────────┘                     └─────────────────┘
```

## Call Flow

```
1. Call Comes In
        ↓
2. Alex Greets & Answers Questions
        ↓
3. Alex Checks Requirements (qualifying questions)
        ↓
4. Alex Captures Name + Email
        ↓
5. capture_lead tool fires → Creates GHL Contact
        ↓
6. Call Ends → Recap Email Sent
        ↓
7. Sales Team Follows Up
```

## Project Structure

```
/fmsit voice ai agent/
├── .env                  # API keys (gitignored)
├── .gitignore
├── package.json          # Dependencies
├── server.js             # Express server with webhooks
├── agent-prompt.md       # Sales agent personality & flow
├── knowledge-base.md     # FAQ for answering questions
├── TOOLS_SCHEMA.md       # capture_lead function definition
├── EVALS.md              # Test scenarios
├── test-flow.js          # Conversation simulation test
└── node_modules/
```

## Files

| File | Purpose | Status |
|------|---------|--------|
| `server.js` | Express server with webhook handlers | ✅ Complete |
| `agent-prompt.md` | Retell agent personality & flow | ✅ Complete |
| `knowledge-base.md` | FAQ for answering caller questions | ✅ Complete |
| `TOOLS_SCHEMA.md` | Function definitions for Retell | ✅ Complete |
| `test-flow.js` | Simulates conversation flow | ✅ Complete |
| `.env` | API keys | ⚠️ Needs GHL credentials |

## Environment Variables Required

| Variable | Description | Status |
|----------|-------------|--------|
| `RETELL_API_KEY` | Retell API key | ✅ Set |
| `GHL_API_KEY` | GoHighLevel API key | ❌ Needed |
| `GHL_LOCATION_ID` | GoHighLevel Location ID | ❌ Needed |
| `PORT` | Server port (default 3000) | ✅ Set |

## Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/retell-webhook` | POST | Retell event callbacks |
| `/tool-call` | POST | Handle function calls from agent |

## Progress Tracker

### Completed ✅
- [x] Agent prompt updated for inbound sales
- [x] Node.js project initialized with dependencies
- [x] Express server with Retell webhook endpoint
- [x] Retell signature verification (retell-sdk)
- [x] Knowledge base template created
- [x] capture_lead tool handler (creates GHL contact)
- [x] call_ended handler (sends recap email via GHL)
- [x] Test script for simulating conversations
- [x] Local server tested and working

### Pending ⏳
- [ ] Add GHL_API_KEY to .env
- [ ] Add GHL_LOCATION_ID to .env
- [ ] Deploy server to Railway
- [ ] Configure Retell agent with webhook URL
- [ ] End-to-end test with real phone call

## Test Results

**Local Server Test (Dec 23, 2025)**
```
✅ Health endpoint: OK
✅ Tool call endpoint: Working
✅ Conversation flow: Simulated successfully
⚠️ GHL integration: Needs credentials
```

## Deployment Steps

1. **Add GHL Credentials**
   - Get API key from GHL Settings → Business Profile → API Keys
   - Get Location ID from GHL Settings → Business Info
   - Add both to `.env`

2. **Deploy to Railway**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Configure Retell**
   - Go to Retell Dashboard → Agent Settings
   - Set Webhook URL to Railway public URL
   - Add `capture_lead` function from TOOLS_SCHEMA.md
   - Paste agent prompt from agent-prompt.md

4. **Test**
   - Make test call to Retell phone number
   - Verify contact created in GHL
   - Verify recap email received

## Quick Commands

```bash
# Start locally
npm start

# Run test simulation
node test-flow.js

# Check health
curl http://localhost:3000/health
```
