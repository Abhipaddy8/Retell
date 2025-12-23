# EVALS.md (The "Tests")

Test these scenarios to ensure the AI works correctly:

## Test Case 1: Curious Caller
Caller asks about services and pricing. AI should:
- Answer questions helpfully
- Ask qualifying questions naturally
- Eventually capture name + email
- Confirm team will follow up

## Test Case 2: Ready to Buy
Caller says "I need IT support ASAP." AI should:
- Acknowledge urgency
- Ask a few quick qualifying questions
- Capture name + email quickly
- Assure fast follow-up

## Test Case 3: Just Browsing
Caller is vague, not ready to commit. AI should:
- Provide value through information
- Not be pushy
- Still attempt email capture before ending
- Gracefully close if they decline

## Test Case 4: Email Capture Success
After getting name + email, verify:
- Contact appears in GHL with "voice-ai-lead" tag
- Recap email is sent to the caller
- Call summary is accurate
