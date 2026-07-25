const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.log("No .env.local file found.");
  process.exit(0);
}

const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n');

const keysToCheck = [
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'NEXT_PUBLIC_PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'PAYU_MERCHANT_KEY',
  'PAYU_MERCHANT_SALT'
];

console.log("Checking keys in .env.local:");
keysToCheck.forEach(key => {
  const hasKey = lines.some(line => line.trim().startsWith(`${key}=`));
  console.log(`- ${key}: ${hasKey ? "FOUND" : "MISSING"}`);
});
