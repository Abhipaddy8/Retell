require('dotenv').config();
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });

(async () => {
  try {
    console.log('🔍 Finding published Sophie...\n');

    const agents = await client.agent.list();
    const sophies = agents.filter(a => a.agent_name === 'Sophie');

    console.log('Sophie agents found: ' + sophies.length);
    console.log('');

    sophies.forEach((s, i) => {
      console.log(`[${i}] Agent ID: ${s.agent_id}`);
      console.log(`    Published: ${s.is_published ? 'YES' : 'NO'}`);
      console.log('');
    });

    // Find a published Sophie
    const publishedSophie = sophies.find(s => s.is_published);

    if (!publishedSophie) {
      console.log('No published Sophie found');
      process.exit(1);
    }

    console.log('---');
    console.log('Using published Sophie: ' + publishedSophie.agent_id);
    console.log('');

    // Get the phone
    const phones = await client.phoneNumber.list();
    const phone = phones[0];

    console.log('Current phone: ' + phone.phone_number_pretty);
    console.log('Currently assigned to: ' + phone.inbound_agent_id);
    console.log('');

    console.log('Reassigning phone...');
    const updated = await client.phoneNumber.update(phone.phone_number, {
      inbound_agent_id: publishedSophie.agent_id
    });

    console.log('✅ Phone reassigned!');
    console.log('');
    console.log('📞 Phone: ' + updated.phone_number_pretty);
    console.log('✅ Now assigned to published Sophie');
    console.log('🎤 Voice: Rachel (Female)');
    console.log('Ready for calls!');

  } catch (error) {
    console.error('Error:', error.message);
  }
})();
