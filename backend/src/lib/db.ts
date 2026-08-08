import { supabase } from './supabase';

export async function getCandidates() {
  const { data, error } = await supabase.from('candidates').select('*');
  if (error) throw error;
  return data;
}

export async function getCandidate(id: string) {
  const { data, error } = await supabase.from('candidates').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getCandidateProgress(candidateId: string) {
  const { data, error } = await supabase.from('candidate_progress')
    .select('*, curriculum_topics(topic_name)')
    .eq('candidate_id', candidateId);
  if (error) throw error;
  return data;
}

export async function getCurriculumDay(dayNumber: number) {
  const { data, error } = await supabase.from('curriculum_days')
    .select('*, curriculum_modules(*)')
    .eq('day_number', dayNumber)
    .single();
  if (error) throw error;
  return data;
}

export async function getCurriculumModule(moduleNumber: number) {
  const { data, error } = await supabase.from('curriculum_modules')
    .select('*')
    .eq('module_number', moduleNumber)
    .single();
  if (error) throw error;
  return data;
}
