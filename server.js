require('dotenv').config();
const express = require('express');
const Retell = require('retell-sdk');
const axios = require('axios');

const app = express();
app.use(express.json());

const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY });

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
  console.log(`Tool call: ${tool_name}`, args);

  try {
    let result;

    switch (tool_name) {
      case 'capture_lead':
        result = await createGHLContact(args.name, args.email, call);
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

// Create contact in GHL and send recap email
async function createGHLContact(name, email, call) {
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

// Handle call ended - send recap email
async function handleCallEnded(call) {
  const { call_id, transcript, call_analysis } = call;
  console.log('Call ended:', call_id);

  // Extract lead info from transcript/analysis if available
  if (call_analysis?.custom_analysis_data) {
    const { name, email } = call_analysis.custom_analysis_data;
    if (name && email) {
      await createGHLContact(name, email, call);
      await sendRecapEmail(email, name, transcript, call_analysis.call_summary);
    }
  }
}

// Send recap email via GHL
async function sendRecapEmail(email, name, transcript, summary) {
  const ghlApiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!ghlApiKey) {
    console.log('GHL not configured, skipping email');
    return;
  }

  try {
    // Find contact by email
    const searchRes = await axios.get(
      `https://services.leadconnectorhq.com/contacts/search?locationId=${locationId}&query=${email}`,
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

    // Send email via GHL conversations
    await axios.post(
      'https://services.leadconnectorhq.com/conversations/messages',
      {
        type: 'Email',
        contactId: contact.id,
        subject: 'Thanks for calling FMSIT!',
        html: `
          <p>Hi ${name},</p>
          <p>Thanks for speaking with us today! Here's a quick recap of our conversation:</p>
          <p><strong>Summary:</strong> ${summary || 'Our team will review your requirements and follow up shortly.'}</p>
          <p>A member of our team will be in touch soon to discuss next steps.</p>
          <p>Best regards,<br>The FMSIT Team</p>
        `
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
