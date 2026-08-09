const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'backend/.env.local' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('candidates').select('*').then(res => console.log(JSON.stringify(res.data, null, 2))).catch(e => console.error(e));
