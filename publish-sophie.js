require('dotenv').config();
const Retell = require('retell-sdk');
const axios = require('axios');

const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY });

async function publishSophie() {
  try {
    console.log('🚀 Publishing Sophie to production...\n');

    // Get Sophie agent
    const agents = await retellClient.agent.list();
    const sophie = agents.find(a => a.agent_name === 'Sophie');

    if (!sophie) {
      console.error('❌ Sophie agent not found');
      process.exit(1);
    }

    console.log(`Agent: ${sophie.agent_name}`);
    console.log(`Agent ID: ${sophie.agent_id}`);
    console.log(`Current Status: ${sophie.is_published ? 'Published' : 'Not Published'}\n`);

    if (sophie.is_published) {
      console.log('✅ Sophie is already published!');
    } else {
      console.log('Publishing Sophie...');

      // Publish the agent using API
      const response = await axios.post(
        `https://api.retellai.com/v2/agents/${sophie.agent_id}/publish`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${process.env.RETELL_API_KEY}`
          }
        }
      );

      console.log('✅ Sophie published successfully!\n');
    }

    // Get the agent again to fetch phone number
    console.log('Fetching phone number...\n');

    const updatedAgents = await retellClient.agent.list();
    const updatedSophie = updatedAgents.find(a => a.agent_id === sophie.agent_id);

    console.log('='.repeat(60));
    console.log('📱 SOPHIE IS LIVE!');
    console.log('='.repeat(60));
    console.log(`Agent: ${updatedSophie.agent_name}`);
    console.log(`Voice: ${updatedSophie.voice_model} (eleven_turbo_v2 - Rachel)`);
    console.log(`Status: ${updatedSophie.is_published ? '✅ PUBLISHED & LIVE' : '⏳ Publishing...'}`);
    console.log(`Keywords: ${updatedSophie.boosted_keywords.join(', ')}`);
    console.log('='.repeat(60));

    // Phone number might appear in the response
    if (updatedSophie.phone_number) {
      console.log(`\n☎️  PHONE NUMBER TO CALL: ${updatedSophie.phone_number}`);
    } else {
      console.log('\n⏳ Phone number will appear in Retell Dashboard shortly');
      console.log('   (Publishing can take a few minutes)\n');
      console.log('To get the phone number:');
      console.log('1. Go to: https://dashboard.retellai.com');
      console.log('2. Click on "Sophie" agent');
      console.log('3. Look for "Phone Number" or "Call In Number"');
    }

    console.log('\n✅ Sophie is configured with:');
    console.log('   - Female voice (Rachel)');
    console.log('   - Consultative approach');
    console.log('   - Beautiful email reports');
    console.log('   - "FMSIT Tech Team" signature');
    console.log('\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
    process.exit(1);
  }
}

publishSophie();
