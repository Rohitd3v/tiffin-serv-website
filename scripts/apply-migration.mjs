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

// Migration file path
const migrationPath = join(
  websiteRoot,
  '..',
  'tiffin-service',
  'supabase',
  'migrations',
  '20260927000000_add_plan_features_and_popular.sql'
);

if (existsSync(migrationPath)) {
  console.log(`Found migration file at: ${migrationPath}`);

  if (dbPassword) {
    console.log('Applying migration via PostgreSQL connection...');
    const poolerHost = process.env.SUPABASE_DB_HOST || 'aws-1-ap-south-1.pooler.supabase.com';
    const poolerPort = process.env.SUPABASE_DB_PORT || '5432';
    const dbUrl = `postgresql://postgres.${projectRef}:${encodeURIComponent(dbPassword)}@${poolerHost}:${poolerPort}/postgres`;

    try {
      execSync(`psql "${dbUrl}" -f "${migrationPath}"`, { stdio: 'inherit' });
      console.log('✅ Migration SQL executed successfully.');
    } catch (err) {
      console.error('⚠️ Direct psql execution failed, checking table status via Supabase client...', err.message);
    }
  } else {
    console.warn('⚠️ No SUPABASE_DB_PASSWORD provided; skipping direct psql execution.');
  }
} else {
  console.warn(`⚠️ Migration file not found at ${migrationPath}`);
}

// Verify plans table structure and content using @supabase/supabase-js
console.log('\nVerifying plans table via Supabase client...');
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const { data: plans, error } = await supabase
  .from('plans')
  .select('*')
  .order('price', { ascending: true });

if (error) {
  console.error('❌ Failed to query plans:', error);
  process.exit(1);
}

console.log('✅ Successfully retrieved plans from database:');
console.table(
  plans.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    price: p.price,
    popular: p.popular,
    features_count: Array.isArray(p.features) ? p.features.length : 0,
    features: Array.isArray(p.features) ? p.features.join(', ') : p.features,
  }))
);

console.log('\nDetailed Plans JSON:');
console.log(JSON.stringify(plans, null, 2));
