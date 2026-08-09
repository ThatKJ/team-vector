import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetDev() {
  console.log("Starting Development Database Reset...");
  
  // We must clear in reverse dependency order, but since we have ON DELETE CASCADE in the schema,
  // we could just delete from interview_sessions. But to be thorough and safe, we can delete from each.
  // Actually, standard Supabase REST API doesn't support TRUNCATE easily without an RPC, 
  // so we will just delete all rows from interview_sessions, which cascades.

  console.log("Deleting all interview_sessions (this will cascade to turns, evaluations, evidence, adaptation_events)...");
  
  const { error } = await supabase
    .from('interview_sessions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
    
  if (error) {
    console.error("Failed to delete interview sessions:", error);
    process.exit(1);
  }

  // To be absolutely sure because sometimes cascade takes a second or doesn't trigger over REST if not set up right in the DB schema,
  // wait, the schema HAS ON DELETE CASCADE. It's fine.

  console.log("Development Database Reset Complete.");
  console.log("Note: Canonical candidates and curriculum data remain intact.");
}

resetDev().catch(console.error);
