require('dotenv').config();
const axios = require('axios');

async function sendTestEmail() {
  const ghlApiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  const testEmail = 'abhipaddy8@gmail.com';

  console.log('📧 Sending beautiful test email...\n');
  console.log('To: ' + testEmail);
  console.log('');

  try {
    // Step 1: Create a test contact
    console.log('Step 1: Creating contact...');

    const contactRes = await axios.post(
      'https://services.leadconnectorhq.com/contacts/',
      {
        locationId,
        name: 'Test Prospect',
        email: testEmail,
        source: 'Sophie Email Test',
        tags: ['email-test']
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
    console.log('✅ Contact created: ' + contactId);
    console.log('');

    // Step 2: Send the beautiful HTML email
    console.log('Step 2: Sending beautiful HTML email...');

    const callDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

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
              <p>Hi <strong>Test Prospect</strong>,</p>
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
                <p>This is a test email to verify that the beautiful HTML email system is working correctly. When you call Sophie at (480) 422-6055, you'll receive an email just like this one with your actual call details and next steps.</p>
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

    const emailRes = await axios.post(
      'https://services.leadconnectorhq.com/conversations/messages',
      {
        type: 'Email',
        contactId: contactId,
        subject: 'Test Prospect, test email from FMSIT – Email system is working!',
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

    console.log('✅ Email sent successfully!\n');

    console.log('='.repeat(70));
    console.log('📧 TEST EMAIL SENT');
    console.log('='.repeat(70));
    console.log('');
    console.log('To: ' + testEmail);
    console.log('Subject: Test Prospect, test email from FMSIT – Email system is working!');
    console.log('');
    console.log('Format: Beautiful HTML with:');
    console.log('  ✅ Purple gradient header');
    console.log('  ✅ Call details section');
    console.log('  ✅ What we discussed section');
    console.log('  ✅ Next steps (3 items)');
    console.log('  ✅ Call to action');
    console.log('  ✅ Signed by "FMSIT Tech Team"');
    console.log('');
    console.log('🎯 Check your email inbox at ' + testEmail);
    console.log('');
    console.log('If you see this email with the beautiful formatting,');
    console.log('then the email system is working perfectly!');
    console.log('');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('❌ Error sending email:');
    console.error('Message:', error.message);
    if (error.response?.data) {
      console.error('GHL Response:', error.response.data);
    }
    process.exit(1);
  }
}

sendTestEmail();
