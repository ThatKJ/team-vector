import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'src', 'lib', 'data', 'candidates.json');
    const fileContents = fs.readFileSync(dataPath, 'utf8');
    const candidates = JSON.parse(fileContents);

    // Ensure they have the status 'pending' unless they have completed a session (which we could compute, but let's just return the static data first)
    // The frontend maps missions, so we can just return candidates.
    // If the frontend needs experience instead of experienceLevel, map it:
    const formatted = candidates.map((c: any) => ({
      ...c,
      experience: c.experienceLevel, // map for frontend
      status: 'pending' // base status
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch candidates:", error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}
