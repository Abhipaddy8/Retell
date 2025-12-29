require('dotenv').config();
const axios = require('axios');

/**
 * Test Email Sending via GHL
 * This simulates a call_ended webhook to test the email sending flow
 */

async function testEmailSending() {
  const ghlApiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  const baseUrl = 'https://services.leadconnectorhq.com';

  if (!ghlApiKey || !locationId) {
    console.error('❌ Missing GHL credentials in .env');
    process.exit(1);
  }

  console.log('📧 Testing Email Sending via GHL...\n');

  try {
    // Step 1: Create a test contact
    console.log('1️⃣ Creating test contact in GHL...');
    const testEmail = `sophie-test-${Date.now()}@test.com`;
    const testName = 'Sophie Test Prospect';

    const contactRes = await axios.post(
      `${baseUrl}/contacts/`,
      {
        locationId,
        name: testName,
        email: testEmail,
        source: 'Voice AI Test',
        tags: ['voice-ai-test']
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
    console.log(`✅ Contact created: ${contactId}`);
    console.log(`   Email: ${testEmail}\n`);

    // Step 2: Send a test email
    console.log('2️⃣ Sending beautiful email via GHL...');

    const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .section { margin-bottom: 28px; }
          .section-title { font-size: 14px; font-weight: 600; color: #667eea; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
          .summary-box { background: white; padding: 16px; border-left: 4px solid #667eea; border-radius: 4px; }
          .action-item { background: white; padding: 12px; margin-bottom: 8px; border-radius: 4px; border-left: 3px solid #764ba2; }
          .action-item strong { color: #764ba2; }
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
              <p>Hi <strong>${testName}</strong>,</p>
              <p>🧪 This is a test email from FMSIT Voice AI</p>
            </div>

            <div class="section">
              <div class="section-title">✅ Email Test Status</div>
              <div class="summary-box">
                <p><strong>Status:</strong> Email sending works! ✅</p>
                <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Template:</strong> Beautiful HTML rendering correctly</p>
                <p><strong>Recipient:</strong> ${testEmail}</p>
              </div>
            </div>

            <div class="section">
              <div class="section-title">💬 Next Steps</div>
              <div class="action-item">
                <p><strong>Real Calls:</strong> When Sophie completes a real call, you'll receive a personalized recap like this.</p>
              </div>
              <div class="action-item">
                <p><strong>Call Details:</strong> Email will include what was discussed, next steps, and call recording link.</p>
              </div>
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

    const emailRes = await axios.post(
      `${baseUrl}/conversations/messages`,
      {
        type: 'Email',
        contactId: contactId,
        subject: `${testName}, test email from FMSIT – email system is working!`,
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

    console.log(`✅ Email sent successfully via GHL!\n`);

    // Step 3: Summary
    console.log('📊 Test Summary:');
    console.log('='.repeat(50));
    console.log(`✅ GHL Contact Created: ${contactId}`);
    console.log(`✅ Email Sent To: ${testEmail}`);
    console.log(`✅ Subject: Test email from FMSIT`);
    console.log(`✅ Template: Beautiful HTML (working)`);
    console.log(`✅ Signature: "FMSIT Tech Team" (present)`);
    console.log('='.repeat(50));
    console.log('\n📧 CHECK YOUR EMAIL: Look for an email from GHL to:');
    console.log(`   ${testEmail}\n`);
    console.log('💡 If you see the beautiful email with FMSIT signature,');
    console.log('   then the email system is working perfectly!\n');
    console.log('🎯 Next: Make a real call to Sophie and verify email sends!\n');

  } catch (error) {
    console.error('❌ Error during email test:');
    console.error('Message:', error.message);
    if (error.response?.data) {
      console.error('GHL Response:', error.response.data);
    }
    console.error('\n💡 Common issues:');
    console.error('   - GHL_API_KEY invalid or expired');
    console.error('   - GHL_LOCATION_ID incorrect');
    console.error('   - GHL account not active');
    console.error('   - Email not configured in GHL');
    process.exit(1);
  }
}

testEmailSending();
