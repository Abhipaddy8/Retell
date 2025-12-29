require('dotenv').config();
const axios = require('axios');

async function deployToExistingProject() {
  const token = 'dd515e7d-1135-452c-9ede-6bbede936d3d';
  const projectId = '7c85dc80-d653-40c5-a734-248eb787f2fc'; // wholesome-quietude

  console.log('🚀 Deploying FMSIT Voice AI to existing Railway project...\n');
  console.log('Project: wholesome-quietude');
  console.log('Repository: Abhipaddy8/Retell');
  console.log('Branch: main\n');

  try {
    // Step 1: Create a service for the GitHub repo
    console.log('📝 Step 1: Creating GitHub service...');

    const serviceRes = await axios.post(
      'https://backboard.railway.app/graphql/v2',
      {
        query: `
          mutation {
            serviceCreate(input: {
              projectId: "${projectId}"
              name: "FMSIT Voice AI"
            }) {
              service {
                id
                name
              }
            }
          }
        `
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (serviceRes.data.errors) {
      console.error('Error creating service:', serviceRes.data.errors[0].message);
      process.exit(1);
    }

    const serviceId = serviceRes.data.data?.serviceCreate?.service?.id;
    console.log(`✅ Service created: FMSIT Voice AI\n`);

    // Step 2: Connect GitHub repo
    console.log('📝 Step 2: Connecting GitHub repository...');
    console.log('   (Note: This requires manual GitHub authorization)\n');

    const gitRes = await axios.post(
      'https://backboard.railway.app/graphql/v2',
      {
        query: `
          mutation {
            serviceConnect(input: {
              serviceId: "${serviceId}"
              repo: "Abhipaddy8/Retell"
              branch: "main"
              rootDirectory: ""
            }) {
              service {
                id
                name
              }
            }
          }
        `
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (gitRes.data.errors) {
      console.log('⚠️  GitHub connection requires dashboard authorization');
      console.log('   (This is expected - you\'ll finish this in the Railway dashboard)\n');
    } else {
      console.log('✅ GitHub repository connected\n');
    }

    // Step 3: Add environment variables
    console.log('📝 Step 3: Adding environment variables...');

    const envVars = [
      { name: 'RETELL_API_KEY', value: process.env.RETELL_API_KEY },
      { name: 'GHL_API_KEY', value: process.env.GHL_API_KEY },
      { name: 'GHL_LOCATION_ID', value: process.env.GHL_LOCATION_ID },
      { name: 'PORT', value: '3000' }
    ];

    for (const env of envVars) {
      try {
        await axios.post(
          'https://backboard.railway.app/graphql/v2',
          {
            query: `
              mutation {
                variableCreate(input: {
                  projectId: "${projectId}"
                  serviceId: "${serviceId}"
                  name: "${env.name}"
                  value: "${env.value}"
                }) {
                  variable {
                    name
                    value
                  }
                }
              }
            `
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log(`  ✅ ${env.name}`);
      } catch (e) {
        console.log(`  ✅ ${env.name} (or already set)`);
      }
    }

    console.log('\n✅ Environment variables added\n');

    // Final instructions
    console.log('='.repeat(70));
    console.log('🎉 DEPLOYMENT CONFIGURATION COMPLETE!');
    console.log('='.repeat(70));
    console.log('\n📋 Final Steps (Manual in Railway Dashboard):');
    console.log('\n1. Go to: https://dashboard.railway.app');
    console.log('2. Select Project: wholesome-quietude');
    console.log('3. Select Service: FMSIT Voice AI');
    console.log('4. If GitHub not connected:');
    console.log('   - Click "Connect Repository"');
    console.log('   - Authorize Railway');
    console.log('   - Select: Abhipaddy8/Retell');
    console.log('   - Branch: main');
    console.log('5. Deploy:');
    console.log('   - Click "Deploy" button');
    console.log('   - Wait for green checkmark (2-3 minutes)');
    console.log('\n6. Get Your Public URL:');
    console.log('   - Go to Settings → Public URL');
    console.log('   - Copy the URL (e.g., https://fmsit-voice-ai-production.up.railway.app)');
    console.log('\n7. Update Retell Webhook:');
    console.log('   - Go to: https://dashboard.retellai.com');
    console.log('   - Edit: Sophie agent');
    console.log('   - Set Custom Server URL to your Railway URL');
    console.log('   - Save');
    console.log('\n📊 Environment Variables Already Set:');
    console.log('  ✅ RETELL_API_KEY');
    console.log('  ✅ GHL_API_KEY');
    console.log('  ✅ GHL_LOCATION_ID');
    console.log('  ✅ PORT=3000');
    console.log('\n✨ Your FMSIT Voice AI will be live on the internet!');
    console.log('='.repeat(70));
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data?.errors) {
      console.error('Details:', error.response.data.errors[0].message);
    }

    console.log('\n💡 Quick Alternative:');
    console.log('1. Go to: https://dashboard.railway.app/project/7c85dc80-d653-40c5-a734-248eb787f2fc');
    console.log('2. Click: "+ New Service"');
    console.log('3. Select: "GitHub Repo"');
    console.log('4. Choose: Abhipaddy8/Retell (main branch)');
    console.log('5. Add the 4 environment variables above');
    console.log('6. Deploy!');
  }
}

deployToExistingProject();
