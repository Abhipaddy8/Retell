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

    const callDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Build beautiful email HTML
    let emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .greeting { font-size: 16px; margin-bottom: 24px; }
          .section { margin-bottom: 28px; }
          .section-title { font-size: 14px; font-weight: 600; color: #667eea; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
          .summary-box { background: white; padding: 16px; border-left: 4px solid #667eea; border-radius: 4px; }
          .summary-box p { margin: 0; }
          .action-item { background: white; padding: 12px; margin-bottom: 8px; border-radius: 4px; border-left: 3px solid #764ba2; }
          .action-item strong { color: #764ba2; }
          .call-details { background: white; padding: 16px; border-radius: 4px; font-size: 14px; }
          .call-details p { margin: 8px 0; }
          .recording-link { display: inline-block; margin-top: 16px; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 4px; font-weight: 500; }
          .recording-link:hover { background: #764ba2; }
          .cta-section { background: white; padding: 16px; border-radius: 4px; text-align: center; margin-bottom: 20px; }
          .cta-section p { margin: 8px 0; font-size: 14px; }
          .signature { color: #666; font-size: 13px; border-top: 1px solid #ddd; padding-top: 16px; margin-top: 24px; }
          .signature p { margin: 4px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thanks for calling!</h1>
            <p>Here's your personalized call summary</p>
          </div>

          <div class="content">
            <div class="greeting">
              <p>Hi <strong>${name}</strong>,</p>
              <p>It was great chatting with you today. We really appreciate you taking the time to explore how FMSIT can help with your IT and software needs.</p>
            </div>

            <div class="section">
              <div class="section-title">📋 Call Details</div>
              <div class="call-details">
                <p><strong>Date & Time:</strong> ${callDate}</p>
                <p><strong>Specialist:</strong> Sophie from FMSIT</p>
                <p><strong>Duration:</strong> Our conversation with you</p>
              </div>
            </div>

            <div class="section">
              <div class="section-title">💡 What We Discussed</div>
              <div class="summary-box">
                <p>${summary || 'Our team will review the details of your call and reach out with personalized recommendations based on your specific situation.'}</p>
              </div>
            </div>

            <div class="section">
              <div class="section-title">✅ Next Steps</div>
              <div class="action-item">
                <p><strong>Next Week:</strong> Our specialist team will review your requirements and reach out with a personalized assessment.</p>
              </div>
              <div class="action-item">
                <p><strong>What They'll Cover:</strong> Detailed analysis of your IT setup, recommendations tailored to your challenges, and options that fit your timeline and budget.</p>
              </div>
              <div class="action-item">
                <p><strong>Your Role:</strong> Just be ready to answer a few follow-up questions so we can give you the most relevant recommendations possible.</p>
              </div>
            </div>

            ${recordingUrl ? `
            <div class="section">
              <div class="section-title">🎙️ Call Recording</div>
              <p>You can review the conversation at your own pace:</p>
              <a href="${recordingUrl}" class="recording-link">Listen to Your Recording</a>
            </div>
            ` : ''}

            <div class="cta-section">
              <p><strong>Have questions in the meantime?</strong></p>
              <p>Feel free to reach out. We're here to help and there's no pressure—just honest conversations about what might work for your situation.</p>
            </div>

            <div class="signature">
              <p>Best regards,</p>
              <p><strong>FMSIT Tech Team</strong></p>
              <p style="margin-top: 8px; font-size: 12px; color: #999;">We're committed to providing thoughtful, consultative IT solutions that actually fit your needs.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
    `;

    // Send email via GHL conversations
    await axios.post(
      'https://services.leadconnectorhq.com/conversations/messages',
      {
        type: 'Email',
        contactId: contact.id,
        subject: `${name}, here's your call summary from FMSIT – next steps included`,
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
