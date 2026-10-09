#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const websiteRoot = join(__dirname, '..');

// Load environment variables from .env.local and .env
dotenv.config({ path: join(websiteRoot, '.env.local') });
dotenv.config({ path: join(websiteRoot, '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const projectRef = supabaseUrl.replace(/^https?:\/\//, '').split('.')[0];
console.log(`Connecting to Supabase project: ${projectRef}`);

// Migration file path (check local checkout first, fallback to sibling repo)
const localMigrationPath = join(
  websiteRoot,
  'supabase',
  'migrations',
  '20260927000001_create_polls_and_votes.sql'
);
const siblingMigrationPath = join(
  websiteRoot,
  '..',
  'tiffin-service',
  'supabase',
  'migrations',
  '20260927000001_create_polls_and_votes.sql'
);

const migrationPath = existsSync(localMigrationPath)
  ? localMigrationPath
  : existsSync(siblingMigrationPath)
  ? siblingMigrationPath
  : null;

if (!migrationPath) {
  console.error(`❌ Migration file not found at ${localMigrationPath} or ${siblingMigrationPath}`);
  process.exit(1);
}

console.log(`Found migration file at: ${migrationPath}`);

if (!dbPassword) {
  console.error('❌ Missing SUPABASE_DB_PASSWORD in environment. Cannot execute migration.');
  process.exit(1);
}

console.log('Applying migration via PostgreSQL connection...');
const poolerHost = process.env.SUPABASE_DB_HOST || 'aws-1-ap-south-1.pooler.supabase.com';
const poolerPort = process.env.SUPABASE_DB_PORT || '5432';
const dbUrl = `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@${poolerHost}:${poolerPort}/postgres`;

try {
  execSync(`psql -v ON_ERROR_STOP=1 "${dbUrl}" -f "${migrationPath}"`, { stdio: 'inherit' });
  // Notify PostgREST to reload schema cache so newly created tables are accessible via client immediately
  execSync(`psql -v ON_ERROR_STOP=1 "${dbUrl}" -c "NOTIFY pgrst, 'reload schema';"`, { stdio: 'inherit' });
  console.log('✅ Migration SQL executed successfully and schema cache reloaded.');
} catch (err) {
  console.error('❌ Direct psql execution failed:', err.message);
  process.exit(1);
}

// Verify tables and initial seed using @supabase/supabase-js
console.log('\nVerifying tables via Supabase client...');
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// 1. Verify polls table
const { data: polls, error: pollsError } = await supabase
  .from('polls')
  .select('*')
  .order('created_at', { ascending: false });

if (pollsError) {
  console.error('❌ Failed to query polls table:', pollsError);
  process.exit(1);
}
console.log(`✅ Successfully queried 'polls' table (${polls.length} rows found).`);

// 2. Verify poll_votes table
const { data: votes, error: votesError } = await supabase
  .from('poll_votes')
  .select('*')
  .limit(1);

if (votesError) {
  console.error('❌ Failed to query poll_votes table:', votesError);
  process.exit(1);
}
console.log(`✅ Successfully queried 'poll_votes' table (${votes ? votes.length : 0} rows found).`);

// 3. Verify poll_otps table
const { data: otps, error: otpsError } = await supabase
  .from('poll_otps')
  .select('*')
  .limit(1);

if (otpsError) {
  console.error('❌ Failed to query poll_otps table:', otpsError);
  process.exit(1);
}
console.log(`✅ Successfully queried 'poll_otps' table (${otps ? otps.length : 0} rows found).`);

console.log('\nActive Poll(s) in Database:');
console.dir(polls, { depth: null });
console.log('\n✅ All verification checks passed!');
