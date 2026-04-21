const { execSync } = require('child_process');

const envVars = {
  DB_HOST: "aws-1-ap-south-1.pooler.supabase.com",
  DB_PORT: "6543",
  DB_USER: "postgres.mzkpacbxuvrzrfzytoee",
  DB_PASSWORD: "karthikeya0pc",
  DB_NAME: "postgres",
  DB_SSL: "true",
  JWT_SECRET: "your_super_secret_key_123",
  EMAIL_HOST: "smtp.gmail.com",
  EMAIL_PORT: "587",
  EMAIL_USER: "karthikeya0pc@gmail.com",
  EMAIL_PASS: "sdwyqomsnbqcdlmt",
  PORT: "5000"
};

for (const [key, value] of Object.entries(envVars)) {
  console.log(`Adding ${key}...`);
  try {
    execSync(`npx vercel env add ${key} production --value "${value}" --yes`, { stdio: 'inherit' });
    console.log(`✅ Added ${key}`);
  } catch (error) {
    console.error(`❌ Failed to add ${key}: ${error.message}`);
  }
}
