// Test script to simulate Retell conversation flow
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function simulateConversation() {
  console.log('\n🎭 SIMULATING INBOUND SALES CALL\n');
  console.log('─'.repeat(50));

  // Simulate the conversation that would happen with Retell
  const conversation = [
    { speaker: 'CALLER', text: '*calls in*' },
    { speaker: 'ALEX', text: 'Hi, thanks for calling FMSIT! I\'m Alex. How can I help you today?' },
    { speaker: 'CALLER', text: 'Hey, I\'m looking for IT support for my company.' },
    { speaker: 'ALEX', text: 'I\'d be happy to help! What kind of IT challenges are you facing?' },
    { speaker: 'CALLER', text: 'We have about 50 employees and our current IT guy is leaving. We need managed services.' },
    { speaker: 'ALEX', text: 'Got it - 50 employees and you need to replace in-house IT with managed services. What\'s your timeline for making this switch?' },
    { speaker: 'CALLER', text: 'Pretty soon, like next month ideally.' },
    { speaker: 'ALEX', text: 'Perfect, we can definitely help with that timeline. I\'d love to have one of our specialists follow up with more details. What\'s the best email to reach you?' },
    { speaker: 'CALLER', text: 'Sure, it\'s john@acmecorp.com' },
    { speaker: 'ALEX', text: 'Great! And who should they ask for?' },
    { speaker: 'CALLER', text: 'John Smith' },
    { speaker: 'ALEX', text: '➡️ [TRIGGERS capture_lead TOOL]' },
  ];

  // Print conversation
  for (const turn of conversation) {
    const prefix = turn.speaker === 'ALEX' ? '🤖' : '📞';
    console.log(`${prefix} ${turn.speaker}: ${turn.text}`);
    await sleep(500);
  }

  console.log('\n' + '─'.repeat(50));
  console.log('\n📡 TESTING TOOL CALL ENDPOINT\n');

  // Test the actual endpoint
  try {
    const response = await axios.post(`${BASE_URL}/tool-call`, {
      tool_name: 'capture_lead',
      args: {
        name: 'John Smith',
        email: 'john@acmecorp.com'
      },
      call: {
        call_id: 'test-call-001',
        transcript: conversation.map(t => `${t.speaker}: ${t.text}`).join('\n')
      }
    });

    console.log('Tool Response:', JSON.stringify(response.data, null, 2));

    if (response.data.result.success) {
      console.log('\n✅ Lead captured successfully!');
      console.log('   → Contact created in GHL');
      console.log('   → Recap email queued');
    } else {
      console.log('\n⚠️  Lead capture returned:', response.data.result.error);
      console.log('   (This is expected if GHL credentials are not set)');
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  console.log('\n' + '─'.repeat(50));
  console.log('\n🎭 CONVERSATION ENDS\n');

  // Simulate call ended
  console.log('🤖 ALEX: Perfect! Our team will reach out shortly with a personalized recap. Thanks for calling FMSIT!');
  console.log('📞 CALLER: *hangs up*');

  console.log('\n' + '─'.repeat(50));
  console.log('\n✅ TEST COMPLETE\n');
  console.log('Next steps:');
  console.log('1. Add GHL_API_KEY and GHL_LOCATION_ID to .env');
  console.log('2. Deploy to Railway');
  console.log('3. Configure Retell agent with webhook URL');
  console.log('4. Make a real test call!\n');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

simulateConversation();
