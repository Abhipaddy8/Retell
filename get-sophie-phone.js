require('dotenv').config();
const axios = require('axios');

async function getSophiePhoneNumber() {
  const apiKey = process.env.RETELL_API_KEY;

  console.log('📱 Fetching Sophie\'s phone number...\n');

  try {
    // Method 1: Check via GraphQL if available
    console.log('Checking Retell API for phone number...\n');

    // Try the agents list endpoint - might have phone in there
    const agentsRes = await axios.get(
      'https://api.retellai.com/v2/agents',
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    const agents = agentsRes.data;
    console.log('All agents from API:');
    console.log(JSON.stringify(agents, null, 2));

  } catch (error) {
    console.error('API Error:', error.message);

    // Fallback: Manual instructions
    console.log('\n⚠️  Phone number not available via API');
    console.log('');
    console.log('📋 Manual Steps to Get Phone Number:');
    console.log('');
    console.log('1. Go to: https://dashboard.retellai.com');
    console.log('2. Click: "Agents" in sidebar');
    console.log('3. Find: "Sophie" agent');
    console.log('4. Click on Sophie');
    console.log('5. Look for: "Phone Number" or "Call In Number"');
    console.log('6. Copy that number');
    console.log('');
    console.log('That\'s your number to call!');
  }
}

getSophiePhoneNumber();
