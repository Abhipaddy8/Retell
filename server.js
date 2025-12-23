require('dotenv').config();
const express = require('express');
const Retell = require('retell-sdk');
const axios = require('axios');

const app = express();
app.use(express.json());

const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY });

// Store captured leads by call_id (to link with call_ended event)
const capturedLeads = new Map();

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Retell webhook endpoint
app.post('/retell-webhook', async (req, res) => {
  const signature = req.headers['x-retell-signature'];

  // Verify signature (Retell SDK handles this)
  if (!Retell.verify(JSON.stringify(req.body), process.env.RETELL_API_KEY, signature)) {
    console.error('Invalid signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { event, call } = req.body;
  console.log(`Event: ${event}`, call?.call_id);

  try {
    switch (event) {
      case 'call_started':
        console.log('Call started:', call.call_id);
        break;

      case 'call_ended':
        await handleCallEnded(call);
        break;

      case 'call_analyzed':
        console.log('Call analyzed:', call.call_id);
        break;

      default:
        console.log('Unknown event:', event);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Handle tool calls from Retell (custom server URL)
app.post('/tool-call', async (req, res) => {
  const { tool_name, args, call } = req.body;
  const callId = call?.call_id;
  console.log(`Tool call: ${tool_name}`, args, 'call_id:', callId);

  try {
    let result;

    switch (tool_name) {
      case 'capture_lead':
        result = await createGHLContact(args.name, args.email, callId);
        // Store lead info for call_ended event
        if (result.success && callId) {
          capturedLeads.set(callId, {
            name: args.name,
            email: args.email,
            contactId: result.contactId
          });
        }
        break;

      default:
        result = { error: 'Unknown tool' };
    }

    res.json({ result });
  } catch (error) {
    console.error('Tool call error:', error);
    res.json({ result: { error: error.message } });
  }
});

// Create contact in GHL
async function createGHLContact(name, email, callId) {
  const ghlApiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!ghlApiKey || !locationId) {
    console.error('GHL credentials not configured');
    return { success: false, error: 'GHL not configured' };
  }

  try {
    // Create contact
    const contactRes = await axios.post(
      'https://services.leadconnectorhq.com/contacts/',
      {
        locationId,
        name,
        email,
        source: 'Retell Voice AI',
        tags: ['voice-ai-lead']
      },
      {
        headers: {
          'Authorization': `Bearer ${ghlApiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        }
      }
    );

    const contactId = contactRes.data.contact.id;
    console.log('Created GHL contact:', contactId);

    return { success: true, contactId };
  } catch (error) {
    console.error('GHL error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Update GHL contact with call notes
async function updateContactNotes(contactId, notes) {
  const ghlApiKey = process.env.GHL_API_KEY;

  try {
    await axios.put(
      `https://services.leadconnectorhq.com/contacts/${contactId}`,
      { customFields: [], notes },
      {
        headers: {
          'Authorization': `Bearer ${ghlApiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        }
      }
    );
    console.log('Updated contact notes:', contactId);
  } catch (error) {
    console.error('Update notes error:', error.response?.data || error.message);
  }
}

// Add note to GHL contact
async function addContactNote(contactId, noteBody) {
  const ghlApiKey = process.env.GHL_API_KEY;

  try {
    await axios.post(
      `https://services.leadconnectorhq.com/contacts/${contactId}/notes`,
      { body: noteBody },
      {
        headers: {
          'Authorization': `Bearer ${ghlApiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        }
      }
    );
    console.log('Added note to contact:', contactId);
  } catch (error) {
    console.error('Add note error:', error.response?.data || error.message);
  }
}

// Handle call ended - update GHL with notes and send recap email
async function handleCallEnded(call) {
  const { call_id, transcript, call_analysis, recording_url } = call;
  console.log('Call ended:', call_id);

  // Get stored lead info from capture_lead tool call
  const lead = capturedLeads.get(call_id);

  if (!lead) {
    console.log('No lead captured for this call:', call_id);
    return;
  }

  const { name, email, contactId } = lead;
  const summary = call_analysis?.call_summary || 'Call completed - no summary available';

  // Build notes with summary and recording
  let noteBody = `📞 Voice AI Call Summary\n`;
  noteBody += `Date: ${new Date().toLocaleString()}\n\n`;
  noteBody += `Summary:\n${summary}\n`;

  if (recording_url) {
    noteBody += `\n🎙️ Recording: ${recording_url}\n`;
  }

  if (transcript) {
    noteBody += `\n📝 Transcript:\n${transcript}\n`;
  }

  // Add note to GHL contact
  if (contactId) {
    await addContactNote(contactId, noteBody);
  }

  // Send recap email
  await sendRecapEmail(email, name, summary, recording_url);

  // Clean up stored lead
  capturedLeads.delete(call_id);
  console.log('Processed call ended for:', email);
}

// Send recap email via GHL
async function sendRecapEmail(email, name, summary, recordingUrl) {
  const ghlApiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!ghlApiKey) {
    console.log('GHL not configured, skipping email');
    return;
  }

  try {
    // Find contact by email
    const searchRes = await axios.get(
      `https://services.leadconnectorhq.com/contacts/search?locationId=${locationId}&query=${encodeURIComponent(email)}`,
      {
        headers: {
          'Authorization': `Bearer ${ghlApiKey}`,
          'Version': '2021-07-28'
        }
      }
    );

    const contact = searchRes.data.contacts?.[0];
    if (!contact) {
      console.log('Contact not found for email:', email);
      return;
    }

    // Build email HTML
    let emailHtml = `
      <p>Hi ${name},</p>
      <p>Thanks for speaking with us today! Here's a quick recap of our conversation:</p>
      <p><strong>Summary:</strong> ${summary || 'Our team will review your requirements and follow up shortly.'}</p>
    `;

    if (recordingUrl) {
      emailHtml += `<p><strong>Call Recording:</strong> <a href="${recordingUrl}">Listen to recording</a></p>`;
    }

    emailHtml += `
      <p>A member of our team will be in touch soon to discuss next steps.</p>
      <p>Best regards,<br>The FMSIT Team</p>
    `;

    // Send email via GHL conversations
    await axios.post(
      'https://services.leadconnectorhq.com/conversations/messages',
      {
        type: 'Email',
        contactId: contact.id,
        subject: 'Thanks for calling FMSIT - Here\'s your conversation summary!',
        html: emailHtml
      },
      {
        headers: {
          'Authorization': `Bearer ${ghlApiKey}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        }
      }
    );

    console.log('Recap email sent to:', email);
  } catch (error) {
    console.error('Email error:', error.response?.data || error.message);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FMSIT Voice AI server running on port ${PORT}`);
});
