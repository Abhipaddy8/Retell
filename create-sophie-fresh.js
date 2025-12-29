require('dotenv').config();
const fs = require('fs');
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });

(async () => {
  try {
    console.log('🎯 Creating BRAND NEW Sophie agent with female voice...\n');

    // Read Sophie's prompt
    const prompt = fs.readFileSync('/Users/equipp/fmsit voice ai agent/agent-prompt.md', 'utf-8');

    // Read the knowledge base
    const kb = fs.readFileSync('/Users/equipp/fmsit voice ai agent/knowledge-base.md', 'utf-8');

    console.log('Creating agent with:');
    console.log('- Name: Sophie');
    console.log('- Voice: 11labs-Dorothy (FEMALE)');
    console.log('- Prompt: Consultative approach');
    console.log('');

    // Create the agent
    const newAgent = await client.agent.create({
      agent_name: 'Sophie',
      voice_id: '11labs-Dorothy',  // Female voice
      voice_model: 'eleven_turbo_v2',
      voice_speed: 1.0,
      language: 'en-US',
      system_prompt: prompt,
      llm_model: 'gpt-4o-mini',
      max_call_duration_ms: 1800000,
      webhook_url: 'https://webhook-server-production-78b7.up.railway.app/retell-webhook'
    });

    console.log('✅ Agent Created!');
    console.log('');
    console.log('Agent Details:');
    console.log('ID: ' + newAgent.agent_id);
    console.log('Name: ' + newAgent.agent_name);
    console.log('Voice: ' + newAgent.voice_id);
    console.log('');

    // Now reassign the phone to this new agent
    console.log('Reassigning phone to new Sophie...');
    const phones = await client.phoneNumber.list();
    const phone = phones[0];

    const updatedPhone = await client.phoneNumber.update(phone.phone_number, {
      inbound_agent_id: newAgent.agent_id
    });

    console.log('✅ Phone reassigned!');
    console.log('');
    console.log('='.repeat(60));
    console.log('✅ SOPHIE CREATED FRESH WITH FEMALE VOICE!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Phone: ' + updatedPhone.phone_number_pretty);
    console.log('Agent: Sophie');
    console.log('Voice: Dorothy (Female)');
    console.log('Prompt: Consultative');
    console.log('');
    console.log('📞 Call (480) 422-6055');
    console.log('Sophie will answer with female voice!');

  } catch (error) {
    console.error('Error:', error.message);
  }
})();
