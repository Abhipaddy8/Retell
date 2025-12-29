require('dotenv').config();
const Retell = require('retell-sdk');

const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY });

async function getPhoneNumber() {
  try {
    console.log('📱 Fetching Sophie\'s phone number from Retell...\n');

    // Get list of agents
    const agents = await retellClient.agent.list();

    // Find FMSIT agent (Sophie)
    const sophieAgent = agents.find(a => a.agent_name === 'Sophie') ||
                        agents.find(a => a.agent_name.includes('FMSIT')) ||
                        agents[0];

    console.log(`Agent: ${sophieAgent.agent_name}`);
    console.log(`Agent ID: ${sophieAgent.agent_id}\n`);

    // Get agent details (use retrieve method)
    let agentDetails;
    try {
      agentDetails = await retellClient.agent.retrieve(sophieAgent.agent_id);
    } catch (e) {
      // Fallback: use list result
      agentDetails = sophieAgent;
    }

    console.log('Agent Details:');
    console.log('='.repeat(50));
    console.log(`Name: ${agentDetails.agent_name}`);
    console.log(`Voice: ${agentDetails.voice_model} / ${agentDetails.voice_name}`);
    console.log(`Speed: ${agentDetails.voice_speed}x`);
    console.log(`Model: ${agentDetails.llm_model}`);
    console.log(`Keywords: ${agentDetails.boosted_keywords?.join(', ')}`);
    console.log('='.repeat(50));

    // Get phone number (from list endpoint with more details)
    console.log('\n📞 Getting phone number...\n');

    const allAgents = await retellClient.agent.list();
    const agent = allAgents.find(a => a.agent_id === sophieAgent.agent_id);

    // Phone number might be in different places depending on Retell API response
    const phoneNumber = agent.phone_number ||
                       agentDetails.phone_number ||
                       agentDetails.public_phone_number ||
                       'Not found in agent details';

    console.log('🎤 SOPHIE VOICE AI - CALL TO ACTION');
    console.log('='.repeat(50));
    console.log(`Agent: Sophie (Female Voice)`);
    console.log(`Approach: Consultative, Value-First`);
    console.log(`Phone Number: ${phoneNumber}`);
    console.log(`Status: Ready to receive calls`);
    console.log('='.repeat(50));

    if (phoneNumber && phoneNumber !== 'Not found in agent details') {
      console.log(`\n☎️  CALL THIS NUMBER: ${phoneNumber}`);
      console.log('\nYou will hear:');
      console.log('- Sophie answering with a warm female voice');
      console.log('- Her asking about your IT challenges');
      console.log('- A consultative, genuine conversation');
      console.log('- No hard selling, just exploring fit');
      console.log('\nAfter the call:');
      console.log('- Beautiful HTML email sent from FMSIT Tech Team');
      console.log('- Call details and next steps included');
      console.log('- Contact created in GoHighLevel');
    } else {
      console.log('\n⚠️  Phone number not found in Retell API response');
      console.log('   This usually means the agent needs to be deployed/published');
      console.log('   Go to Retell Dashboard → Sophie → Deploy/Publish');
      console.log('   Then run this script again to get the phone number');
    }

    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
    process.exit(1);
  }
}

getPhoneNumber();
