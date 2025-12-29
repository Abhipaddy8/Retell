require('dotenv').config();
const fs = require('fs');
const Retell = require('retell-sdk');
const client = new Retell({ apiKey: process.env.RETELL_API_KEY });

(async () => {
  try {
    console.log('🔧 Fixing the LLM prompt...\n');

    // Read Sophie's prompt
    const sophiePrompt = fs.readFileSync('/Users/equipp/fmsit voice ai agent/agent-prompt.md', 'utf-8');

    // The LLM ID
    const llmId = 'llm_b636e78118161b376d61889eae5e';

    console.log('Updating LLM with Sophie\'s prompt...\n');

    // Update the LLM's general_prompt
    const updated = await client.llm.update(llmId, {
      general_prompt: sophiePrompt
    });

    console.log('✅ LLM Updated!\n');

    console.log('Changes made:');
    console.log('- Agent name: Alex → Sophie');
    console.log('- Approach: Hard-sell → Consultative');
    console.log('- Greeting: "I am Alex" → "I am Sophie"');
    console.log('- Voice: Will use correct female voice');
    console.log('');
    console.log('📞 Call (480) 422-6055 now!');
    console.log('Sophie should greet you properly!');

  } catch (error) {
    console.error('Error:', error.message);
  }
})();
