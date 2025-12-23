# TOOLS_SCHEMA.md (The "Hands")

Define these in the "Functions" section of your Retell Dashboard.

## Function: capture_lead

**Description:** Captures lead information (name and email) to create a contact and send follow-up.

**Parameters (JSON Schema):**
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "The caller's full name"
    },
    "email": {
      "type": "string",
      "description": "The caller's email address"
    }
  },
  "required": ["name", "email"]
}
```

**When to trigger:** After the caller provides both their name and email address.

**What it does:**
1. Creates a new contact in GoHighLevel
2. Tags the contact as "voice-ai-lead"
3. Triggers a recap email with conversation summary
