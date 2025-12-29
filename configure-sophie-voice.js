require('dotenv').config();
const Retell = require('retell-sdk');

const retellClient = new Retell({ apiKey: process.env.RETELL_API_KEY });

async function configureVoice() {
  try {
    console.log('📱 Fetching all agents...\n');

    // Get list of agents
    const agents = await retellClient.agent.list();
    console.log(`Found ${agents.length} agent(s):\n`);

    agents.forEach(agent => {
      console.log(`- ID: ${agent.agent_id}`);
      console.log(`  Name: ${agent.agent_name}`);
      console.log(`  Voice: ${agent.voice_model} (${agent.voice_name || 'default'})`);
      console.log('');
    });

    if (agents.length === 0) {
      console.log('❌ No agents found. Create one in the Retell dashboard first.');
      process.exit(1);
    }

    // Find the FMSIT agent (or use first one)
    const fmsitAgent = agents.find(a => a.agent_name.includes('FMSIT')) || agents[0];
    const agentId = fmsitAgent.agent_id;

    console.log(`\n🎯 Configuring agent: ${fmsitAgent.agent_name} (${agentId})\n`);

    // Read the new agent prompt
    const fs = require('fs');
    const newPrompt = fs.readFileSync('/Users/equipp/fmsit voice ai agent/agent-prompt.md', 'utf-8');

    // Update the agent with female voice and new prompt
    // Using eleven_turbo_v2 (ElevenLabs - excellent quality voices with multiple female options)
    const updatedAgent = await retellClient.agent.update(agentId, {
      agent_name: 'Sophie',
      voice_model: 'eleven_turbo_v2',
      voice_name: 'rachel',  // Rachel - professional, warm female voice
      voice_speed: 1.0,
      llm_model: 'gpt-4-turbo',
      system_prompt: newPrompt,
      boosted_keywords: ['M365', 'Office 365', 'FMSIT', 'Microsoft 365'],
      interruption_threshold: 100,
      max_duration_minutes: 30
    });

    console.log('✅ Agent updated successfully!\n');
    console.log('Configuration Applied:');
    console.log(`- Name: ${updatedAgent.agent_name}`);
    console.log(`- Voice: ${updatedAgent.voice_model} / ${updatedAgent.voice_name}`);
    console.log(`- Speed: ${updatedAgent.voice_speed}x`);
    console.log(`- Model: ${updatedAgent.llm_model}`);
    console.log(`- Boosted Keywords: ${updatedAgent.boosted_keywords.join(', ')}`);
    console.log(`\n🎤 Sophie is now configured with a warm female voice!`);
    console.log(`📧 Email reports are set to beautiful HTML format.`);
    console.log(`💬 Consultative tone active - ready for calls!\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }
    process.exit(1);
  }
}

configureVoice();
