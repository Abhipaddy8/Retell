require('dotenv').config();
const fs = require('fs');
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });

(async () => {
  try {
    console.log('📝 Updating Sophie with correct system prompt...\n');

    // Read the agent prompt
    const prompt = fs.readFileSync('/Users/equipp/fmsit voice ai agent/agent-prompt.md', 'utf-8');

    // Get all Sophie agents
    const agents = await client.agent.list();
    const sophies = agents.filter(a => a.agent_name === 'Sophie');

    console.log(`Found ${sophies.length} Sophie agents\n`);

    // Update each one with the system prompt
    for (const sophie of sophies) {
      console.log(`Updating ${sophie.agent_id}...`);

      const updated = await client.agent.update(sophie.agent_id, {
        system_prompt: prompt
      });

      console.log(`✅ Updated\n`);
    }

    console.log('Done! Sophie now has the correct prompt:');
    console.log('- Introduces herself as Sophie');
    console.log('- Consultative approach');
    console.log('- Listens and explores fit');
    console.log('- Asks for name and email at the end');
    console.log('');
    console.log('📞 Try calling (480) 422-6055 now!');
    console.log('Sophie should greet you with her warm voice');

  } catch (error) {
    console.error('Error:', error.message);
  }
})();
