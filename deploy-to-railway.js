require('dotenv').config();
const axios = require('axios');

/**
 * Deploy to Railway via REST API
 */

async function deployToRailway() {
  const railwayToken = 'dd515e7d-1135-452c-9ede-6bbede936d3d';

  if (!railwayToken) {
    console.error('❌ RAILWAY_TOKEN not found in environment');
    process.exit(1);
  }

  console.log('🚀 Deploying FMSIT Voice AI to Railway...\n');

  try {
    // Railway uses GraphQL API
    console.log('📋 Checking existing Railway projects...\n');

    const response = await axios.post(
      'https://backboard.railway.app/graphql/v2',
      {
        query: `
          query {
            projects(first: 50) {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
        `
      },
      {
        headers: {
          'Authorization': `Bearer ${railwayToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const projects = response.data.data?.projects?.edges || [];

    console.log(`Found ${projects.length} Railway project(s):\n`);
    projects.forEach(p => {
      console.log(`- ${p.node.name} (ID: ${p.node.id})`);
    });

    if (projects.length === 0) {
      console.log('\n⚠️  No Railway projects found.');
      console.log('   Create one via the dashboard: https://dashboard.railway.app');
      console.log('   Then connect your GitHub repo: Abhipaddy8/Retell');
      process.exit(0);
    }

    console.log('\n✅ Railway projects found.');
    console.log('\n📝 To deploy:');
    console.log('1. Go to: https://dashboard.railway.app');
    console.log('2. Select a project or create new one');
    console.log('3. Connect GitHub: Abhipaddy8/Retell');
    console.log('4. Add environment variables:');
    console.log('   - RETELL_API_KEY');
    console.log('   - GHL_API_KEY');
    console.log('   - GHL_LOCATION_ID');
    console.log('   - PORT=3000');
    console.log('5. Railway auto-deploys from main branch');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Details:', error.response.data);
    }

    console.log('\n💡 Alternative: Deploy via Dashboard');
    console.log('1. Visit: https://dashboard.railway.app');
    console.log('2. "+ New Project" → "Deploy from GitHub"');
    console.log('3. Select: Abhipaddy8/Retell');
    console.log('4. Add environment variables');
  }
}

deployToRailway();
