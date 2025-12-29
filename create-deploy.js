require('dotenv').config();
const axios = require('axios');

async function deployFMSIT() {
  const token = 'dd515e7d-1135-452c-9ede-6bbede936d3d';

  console.log('🚀 Creating FMSIT Voice AI project on Railway...\n');

  try {
    // Create new project
    console.log('📝 Step 1: Creating project...');

    const createRes = await axios.post(
      'https://backboard.railway.app/graphql/v2',
      {
        query: `
          mutation {
            projectCreate(input: {name: "FMSIT Voice AI"}) {
              project {
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

    const projectId = createRes.data.data?.projectCreate?.project?.id;
    const projectName = createRes.data.data?.projectCreate?.project?.name;

    if (!projectId) {
      console.error('Failed to create project');
      console.log(JSON.stringify(createRes.data, null, 2));
      process.exit(1);
    }

    console.log(`✅ Project created: ${projectName} (${projectId})\n`);

    // Now connect GitHub repository
    console.log('📝 Step 2: Setting up GitHub connection...');
    console.log('   Repository: Abhipaddy8/Retell');
    console.log('   Branch: main\n');

    // Create a service (deployment) from GitHub
    const serviceRes = await axios.post(
      'https://backboard.railway.app/graphql/v2',
      {
        query: `
          mutation {
            serviceCreate(input: {
              projectId: "${projectId}"
              name: "Sophie Voice AI"
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

    const serviceId = serviceRes.data.data?.serviceCreate?.service?.id;

    if (!serviceId) {
      console.error('Failed to create service');
      console.log(JSON.stringify(serviceRes.data, null, 2));
    } else {
      console.log(`✅ Service created: Sophie Voice AI\n`);
    }

    // Get project info
    const getRes = await axios.post(
      'https://backboard.railway.app/graphql/v2',
      {
        query: `
          query {
            project(id: "${projectId}") {
              id
              name
              teams {
                edges {
                  node {
                    id
                  }
                }
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

    console.log('✅ FMSIT Voice AI Project Created!\n');
    console.log('📊 Project Details:');
    console.log('='.repeat(60));
    console.log(`Project ID: ${projectId}`);
    console.log(`Project Name: ${projectName}`);
    console.log(`Service: Sophie Voice AI`);
    console.log('='.repeat(60));

    console.log('\n📋 Next Steps:');
    console.log('1. Go to: https://dashboard.railway.app');
    console.log(`2. Select: ${projectName}`);
    console.log('3. Connect GitHub:');
    console.log('   - Click "+ New Service"');
    console.log('   - Select "GitHub Repo"');
    console.log('   - Choose: Abhipaddy8/Retell');
    console.log('   - Branch: main');
    console.log('4. Add Environment Variables:');
    console.log('   RETELL_API_KEY=' + process.env.RETELL_API_KEY);
    console.log('   GHL_API_KEY=' + process.env.GHL_API_KEY);
    console.log('   GHL_LOCATION_ID=' + process.env.GHL_LOCATION_ID);
    console.log('   PORT=3000');
    console.log('5. Deploy!');
    console.log('');
    console.log('✅ Once deployed, Railway will give you a public URL');
    console.log('   Update Retell webhook to that URL');
    console.log('');

  } catch (error) {
    if (error.response?.data?.errors) {
      console.error('GraphQL Error:', error.response.data.errors[0].message);
    } else {
      console.error('Error:', error.message);
    }

    console.log('\n💡 Manual Alternative:');
    console.log('1. Go to: https://dashboard.railway.app');
    console.log('2. Click "+ New Project"');
    console.log('3. Select "Deploy from GitHub"');
    console.log('4. Authorize and select: Abhipaddy8/Retell');
    console.log('5. Add environment variables');
    console.log('6. Deploy');
  }
}

deployFMSIT();
