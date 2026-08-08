import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

function generateUUID(str: string) {
  const hash = crypto.createHash('md5').update(str).digest('hex');
  return `${hash.substring(0,8)}-${hash.substring(8,12)}-4${hash.substring(13,16)}-8${hash.substring(17,20)}-${hash.substring(20,32)}`;
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src/lib/data/candidates.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const rawCandidates = JSON.parse(fileContents);
    
    // Seed Supabase with valid UUIDs
    for (const c of rawCandidates) {
      const uuid = generateUUID(c.id);
      await supabase.from('candidates').upsert({
        id: uuid,
        name: c.name,
        email: `${c.id.toLowerCase()}@example.com`
      }, { onConflict: 'id' });
    }

    return NextResponse.json(rawCandidates.map((c: any) => ({
      id: generateUUID(c.id),
      name: c.name,
      role: c.role,
      experience: c.experienceLevel,
      status: 'pending'
    })));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}
