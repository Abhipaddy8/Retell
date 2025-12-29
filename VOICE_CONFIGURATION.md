# FMSIT Voice AI Agent - Voice Configuration Guide

## Overview
This guide explains how to configure a female voice for the FMSIT voice AI agent (Sophie) in Retell AI.

## Current Agent Name
- **Agent Name**: Sophie
- **Character**: Warm, consultative IT solutions specialist
- **Voice Type**: Should be female, soft, and professional
- **Tone**: Conversational, friendly, not scripted

## Retell Voice Options

Retell AI offers several voice providers and options. Here's how to configure:

### Option 1: Using Retell Dashboard
1. Go to [Retell Dashboard](https://dashboard.retellai.com)
2. Navigate to **Agents**
3. Find or create the "Sophie" agent
4. In agent settings, look for **Voice Configuration**
5. Select voice provider and voice:
   - **Provider**: OpenAI (for best quality) or Elevenlabs (for more variety)
   - **Voice Name**: Choose from available female voices:
     - OpenAI: `nova` (recommended - warm, natural female voice)
     - Elevenlabs: `Rachel`, `Bella`, `Sage` (all soft, professional)
6. Test the voice with sample text
7. Save changes

### Option 2: Via API
Update the agent configuration via Retell API:

```bash
curl -X PATCH https://api.retellai.com/v2/agents/{agent_id} \
  -H "Authorization: Bearer {RETELL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "voice_model": "openai",
    "voice_name": "nova",
    "model": "gpt-4",
    "agent_name": "Sophie",
    "system_prompt": "[contents from agent-prompt.md]",
    "llm_fallback_enabled": true,
    "llm_fallback_temperature": 0.7,
    "boosted_keywords": ["FMSIT", "Microsoft 365", "M365", "Office 365"]
  }'
```

## Recommended Voice Configuration

**For Sophie (Female IT Consultant):**
- **Provider**: OpenAI TTS (currently the most natural-sounding)
- **Voice**: `nova` (warm, professional, soft female voice)
- **Speed**: 1.0-1.1x (natural, conversational pace)
- **Temperature**: 0.7 (balanced between consistency and naturalness)

### Alternative Female Voice Options:
1. **OpenAI `nova`** - Best option: warm, natural, professional
2. **Elevenlabs `Rachel`** - Soft, friendly, good clarity
3. **Elevenlabs `Bella`** - Slightly deeper, professional

## Pronunciation Issues - Microsoft 365 Fix

### The Problem
"Microsoft 365" can sound disjointed in TTS, especially when separated as "Microsoft" + "365".

### The Solution
The system is already configured to handle this. The knowledge base includes:
- Alternative pronunciations: "M365" or "Office 365"
- Sophie's prompt instructs her to use these alternatives naturally

When Sophie needs to reference the product, she'll use:
- **"M365"** → (pronounced as "em-three-sixty-five")
- **"Office 365"** → (pronounced smoothly as product name)
- **"Microsoft 365"** → (used when needed, but typically one of the above)

### If Pronunciation Still Issues:
1. **Add to boosted keywords** in Retell agent settings:
   ```
   "boosted_keywords": ["M365", "Office 365", "FMSIT"]
   ```

2. **Use phonetic hints in prompts**:
   - Instead of "Microsoft 365", agent naturally says "M365" or "Office 365"
   - This is already configured in `agent-prompt.md` and `knowledge-base.md`

3. **Test different voice providers**:
   - If OpenAI `nova` has issues, try Elevenlabs `Rachel`
   - Compare clarity and naturalness

## Testing the Voice Configuration

### 1. Local Testing (Before Deployment)
The agent prompt and knowledge base updates are already saved. To test:

```bash
# Restart the server to load updated prompts
npm run dev
```

Then make a test call through Retell and listen for:
- ✅ Female voice, warm and soft
- ✅ Natural pronunciation of "M365" or "Office 365"
- ✅ Conversational, consultative tone (not salesy)
- ✅ Professional and trustworthy

### 2. Production Deployment Checklist
Before going live with the new voice:
- [ ] Configure female voice in Retell dashboard (nova or Rachel)
- [ ] Add boosted keywords: `["M365", "Office 365", "FMSIT"]`
- [ ] Update agent system prompt with full `agent-prompt.md` content
- [ ] Make a test call to verify voice and tone
- [ ] Verify knowledge base is being used (should sound consultative)
- [ ] Test pronunciation of product names

## Manual Deployment Steps

If the agent isn't automatically synced, manually update it:

1. **Get your Agent ID**:
   ```bash
   curl -X GET https://api.retellai.com/v2/agents \
     -H "Authorization: Bearer {RETELL_API_KEY}"
   ```

2. **Update agent with new prompt and voice**:
   ```bash
   curl -X PATCH https://api.retellai.com/v2/agents/{agent_id} \
     -H "Authorization: Bearer {RETELL_API_KEY}" \
     -H "Content-Type: application/json" \
     -d '{
       "agent_name": "Sophie",
       "voice_model": "openai",
       "voice_name": "nova",
       "system_prompt": "[full prompt from agent-prompt.md]"
     }'
   ```

3. **Verify the update**:
   ```bash
   curl -X GET https://api.retellai.com/v2/agents/{agent_id} \
     -H "Authorization: Bearer {RETELL_API_KEY}"
   ```

## Advanced Configuration Options

If you want to fine-tune further:

```json
{
  "agent_name": "Sophie",
  "voice_model": "openai",
  "voice_name": "nova",
  "voice_speed": 1.0,
  "voice_temperature": 0.7,
  "llm_model": "gpt-4-turbo",
  "llm_temperature": 0.7,
  "max_duration_minutes": 30,
  "interruption_threshold": 100,
  "inactivity_timeout_seconds": 30,
  "system_prompt": "[content from agent-prompt.md]"
}
```

## Next Steps

1. **Configure the voice in Retell dashboard** (takes 5 minutes)
2. **Make a test call** to verify the new female voice and consultative tone
3. **Monitor initial calls** for pronunciation and tone
4. **Gather feedback** from customers on the new approach
5. **Iterate** if needed based on real-world feedback

## Resources
- [Retell AI Documentation](https://docs.retellai.com)
- [OpenAI TTS Documentation](https://platform.openai.com/docs/guides/text-to-speech)
- [Retell Voice Options](https://docs.retellai.com/features/voice)

---
**Last Updated**: December 29, 2025
**Status**: Configuration Guide Ready for Implementation
