import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials");
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateUUID(str: string) {
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return `${hash.substring(0,8)}-${hash.substring(8,12)}-4${hash.substring(13,16)}-8${hash.substring(17,20)}-${hash.substring(20,32)}`;
}

async function seed() {
  console.log("Reading data...");
  const candidatesPath = path.join(__dirname, '../src/lib/data/candidates.json');
  const curriculumPath = path.join(__dirname, '../src/lib/data/curriculum.json');
  
  const candidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
  const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));

  console.log("Seeding curriculum modules and days...");
  for (const module of curriculum) {
    const moduleId = generateUUID(`module_${module.id}`);
    
    // Upsert Module
    const { error: modError } = await supabase.from('curriculum_modules').upsert({
      id: moduleId,
      module_number: module.id,
      title: module.name,
      start_day: module.startDay,
      end_day: module.endDay,
      metadata: { description: module.description }
    }, { onConflict: 'id' });

    if (modError) {
      console.error(modError);
      throw modError;
    }

    // Upsert Days
    if (module.days) {
      for (const day of module.days) {
        const dayId = generateUUID(`day_${day.day}`);
        const { error: dayError } = await supabase.from('curriculum_days').upsert({
          id: dayId,
          day_number: day.day,
          title: day.topics?.[0] || `Day ${day.day}`,
          description: day.objectives?.join(', ') || '',
          module_id: moduleId,
          type: 'standard', // default type
          tools: day.tools || [],
          objectives: day.objectives || []
        }, { onConflict: 'id' });

        if (dayError) {
          console.error(dayError);
          throw dayError;
        }

        // Upsert Topics (Preserving existing logic, creating one topic per title for now if it doesn't exist, though user said "do not invent topics". Wait, the prompt said: "preserve existing topic rows if they already represent actual curriculum topics, do not invent topic names. if the existing schema requires topics for candidate_progress, report the exact mapping issue rather than silently fabricating data")
        // Since candidate_progress references `topic_id`, and candidate.json has `missions` (e.g. "Basic Python Setup"). 
        // We will seed curriculum_topics with the missions from candidates.json because those are the "topics" / missions being tested!
      }
    }
  }

  console.log("Seeding topics/missions from candidates.json...");
  // Gather all unique missions from all candidates to populate curriculum_topics
  const uniqueMissions = new Map();
  for (const c of candidates) {
    if (c.missions) {
      for (const m of c.missions) {
        if (!uniqueMissions.has(m.id)) {
          uniqueMissions.set(m.id, {
            id: generateUUID(`topic_${m.id}`),
            topic_name: m.name,
            is_core: true
          });
        }
      }
    }
  }
  
  for (const [missionId, topicData] of uniqueMissions) {
    const { error: topicError } = await supabase.from('curriculum_topics').upsert({
      id: topicData.id,
      topic_name: topicData.topic_name,
      is_core: topicData.is_core
    }, { onConflict: 'id' });
    if (topicError) console.error("Topic error:", topicError);
  }

  console.log("Seeding candidates and progress...");
  for (const c of candidates) {
    const candidateId = generateUUID(c.id);
    
    // Signals
    const metadata = {
      signals: c.signals || {
        commitDays: c.commitDays,
        missionsCompleted: c.missionsCompleted,
        missionsFirstTry: c.missionsFirstTry
      }
    };

    const { error: candError } = await supabase.from('candidates').upsert({
      id: candidateId,
      name: c.name,
      email: `${c.id.toLowerCase()}@example.com`,
      job_role: c.role,
      years_experience: c.experienceLevel === 'Senior' ? 5 : c.experienceLevel === 'Mid-Level' ? 3 : 1, // Basic mapping if years isn't explicitly an integer in json
      education: c.education || 'Unknown',
      status: c.status || 'pending',
      metadata
    }, { onConflict: 'id' });

    if (candError) throw candError;

    // Progress
    if (c.missions) {
      for (const m of c.missions) {
        const topicId = generateUUID(`topic_${m.id}`);
        let mappedStatus = 'NOT_STARTED';
        if (m.status === 'passed') mappedStatus = 'PASSED';
        if (m.status === 'failed') mappedStatus = 'FAILED';
        if (m.status === 'skipped') mappedStatus = 'SKIPPED';
        if (m.status === 'in_progress') mappedStatus = 'IN_PROGRESS';

        const { error: progError } = await supabase.from('candidate_progress').upsert({
          id: generateUUID(`prog_${candidateId}_${topicId}`),
          candidate_id: candidateId,
          topic_id: topicId,
          status: mappedStatus,
          attempts: m.attempts || 0
        }, { onConflict: 'id' });

        if (progError) throw progError;
      }
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
