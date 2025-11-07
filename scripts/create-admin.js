#!/usr/bin/env node
/**
 * Script to create the first admin user for OnNepal
 *
 * Usage: node scripts/create-admin.js <email> <username> <password>
 * Example: node scripts/create-admin.js admin@onnepal.com admin MySecurePass123
 */

import { createHash, randomBytes } from 'crypto';
import { execSync } from 'child_process';

const [email, username, password] = process.argv.slice(2);

if (!email || !username || !password) {
  console.error('❌ Missing required arguments');
  console.error('\nUsage: node scripts/create-admin.js <email> <username> <password>');
  console.error('Example: node scripts/create-admin.js admin@onnepal.com admin MySecurePass123\n');
  process.exit(1);
}

// Validate password strength
if (password.length < 8) {
  console.error('❌ Password must be at least 8 characters long');
  process.exit(1);
}

console.log('🔐 Creating admin user...\n');
console.log(`Email: ${email}`);
console.log(`Username: ${username}`);
console.log(`Password: ${'*'.repeat(password.length)}\n`);

// Generate a bcrypt-like hash (simplified for demo - in production use proper bcrypt)
// Note: For real use, install bcrypt: npm install bcrypt
try {
  // Try to use bcrypt if available
  const bcrypt = await import('bcrypt');

  console.log('📝 Generating secure password hash with bcrypt...');
  const passwordHash = await bcrypt.hash(password, 10);

  const userId = `admin-${randomBytes(8).toString('hex')}`;
  const now = Math.floor(Date.now() / 1000);

  // Escape single quotes in SQL
  const escapedHash = passwordHash.replace(/'/g, "''");

  const sql = `INSERT INTO users (id, email, username, password_hash, display_name, role, is_banned, created_at, updated_at) VALUES ('${userId}', '${email}', '${username}', '${escapedHash}', 'Administrator', 'admin', 0, ${now}, ${now});`;

  console.log('\n✅ Password hash generated!');
  console.log('\n📋 Now run this command to create the admin user:\n');
  console.log(`npx wrangler d1 execute onnepal-db --remote --command="${sql}"`);
  console.log('\n---\n');
  console.log('Or manually insert in Cloudflare Dashboard with:');
  console.log(`\nUser ID: ${userId}`);
  console.log(`Password Hash: ${passwordHash}`);
  console.log(`Created At: ${now}`);

} catch (error) {
  console.error('\n⚠️  bcrypt not installed. Installing now...\n');

  try {
    execSync('npm install bcrypt', { stdio: 'inherit' });
    console.log('\n✅ bcrypt installed! Please run the script again.\n');
  } catch (installError) {
    console.error('\n❌ Failed to install bcrypt. Please install it manually:');
    console.error('   npm install bcrypt\n');
    console.error('Then run this script again.');
  }

  process.exit(1);
}
