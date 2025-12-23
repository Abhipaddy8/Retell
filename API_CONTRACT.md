# ENDPOINT: POST /retell-webhook

## SECURITY
- Check header `X-Retell-Signature`.
- Compare with `RETELL_API_KEY`.

## LOGIC FLOW (Python/Node)
1. **On Call Started:**
   - GET GHL Contact by `from_number`.
   - Update Retell Agent `dynamic_variables` with Name/Company.
2. **On Tool Call (`create_ghl_ticket`):**
   - POST to GHL `/contacts/{id}/tasks`.
   - Payload: `{"title": "AI Ticket: " + issue, "body": transcript}`.
3. **On Call Ended:**
   - Fetch `recording_url` from Retell.
   - POST to GHL `/contacts/{id}/notes` with summary + recording link.
