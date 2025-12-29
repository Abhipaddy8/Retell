require('dotenv').config();
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });

(async () => {
  try {
    console.log('🎤 Changing voice from Adrian (male) to female...\n');

    // Get all Sophie agents
    const agents = await client.agent.list();
    const sophies = agents.filter(a => a.agent_id === 'agent_e50eaa04dd45d3e5fbcc6bdfcd');

    console.log(`Found ${sophies.length} Sophie agent(s)\n`);

    // Female voice options in ElevenLabs:
    // 11labs-Rachel (professional, warm)
    // 11labs-Bella (friendly)
    // 11labs-Sage (calm, professional)

    for (const sophie of sophies) {
      console.log(`Updating ${sophie.agent_id}...`);
      console.log(`Current voice: ${sophie.voice_id}`);

      // Update to female voice
      const updated = await client.agent.update(sophie.agent_id, {
        voice_id: '11labs-Rachel'  // Rachel is a warm, professional female voice
      });

      console.log(`✅ Changed to: 11labs-Rachel (female)\n`);
    }

    console.log('='.repeat(60));
    console.log('✅ VOICE CHANGED TO FEMALE!');
    console.log('='.repeat(60));
    console.log('');
    console.log('📞 Call (480) 422-6055 now');
    console.log('');
    console.log('You should now hear:');
    console.log('✅ Sophie (female voice - Rachel)');
    console.log('✅ Warm, professional tone');
    console.log('✅ Consultative approach');
    console.log('✅ Her script');
    console.log('');

  } catch (error) {
    console.error('Error:', error.message);
  }
})();
