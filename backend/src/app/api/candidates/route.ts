import { NextResponse } from 'next/server';
import { getCandidates, getCandidateProgress } from '@/lib/db';

export async function GET() {
  try {
    const rawCandidates = await getCandidates();

    const formatted = await Promise.all(rawCandidates.map(async (c: any) => {
      // Fetch progress dynamically to attach to candidate for the engine
      const progress = await getCandidateProgress(c.id);
      
      const missions = progress.map((p: any) => ({
        id: p.topic_id, 
        name: p.curriculum_topics?.topic_name || 'Mission',
        status: p.status.toLowerCase(), // frontend expects lowercase 'passed' etc
        attempts: p.attempts
      }));

      return {
        id: c.id,
        name: c.name,
        role: c.job_role,
        experienceLevel: c.years_experience >= 5 ? 'Senior' : c.years_experience >= 3 ? 'Mid-Level' : 'Junior',
        education: c.education,
        status: c.status,
        missions,
        signals: c.metadata?.signals
      };
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch candidates:", error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}
