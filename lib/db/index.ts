import { sql } from '@vercel/postgres';
import { NextRequest } from 'next/server';

export interface WaitlistEntry {
  id: number;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  status: 'waiting' | 'approved' | 'rejected';
  position?: number;
  notes?: string;
}

export interface CreateWaitlistEntry {
  email: string;
  name: string;
}

// Rate limiting using database
export async function checkRateLimit(ip: string): Promise<boolean> {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
  
  const result = await sql`
    SELECT COUNT(*) as count 
    FROM waitlist_entries 
    WHERE created_at > ${oneMinuteAgo.toISOString()}
    AND email LIKE ${`%${ip}%`}
  `;
  
  return parseInt(result.rows[0]?.count || '0') < 2; // Max 2 requests per minute
}

// Add new waitlist entry
export async function addWaitlistEntry(entry: CreateWaitlistEntry): Promise<WaitlistEntry> {
  const result = await sql`
    INSERT INTO waitlist_entries (email, name, position)
    VALUES (${entry.email}, ${entry.name}, 
      (SELECT COALESCE(MAX(position), 0) + 1 FROM waitlist_entries WHERE status = 'waiting'))
    RETURNING *
  `;
  
  return result.rows[0] as WaitlistEntry;
}

// Check if email already exists
export async function checkEmailExists(email: string): Promise<boolean> {
  const result = await sql`
    SELECT COUNT(*) as count 
    FROM waitlist_entries 
    WHERE email = ${email}
  `;
  
  return parseInt(result.rows[0]?.count || '0') > 0;
}

// Get waitlist statistics
export async function getWaitlistStats() {
  const result = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN status = 'waiting' THEN 1 END) as waiting,
      COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
      COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
    FROM waitlist_entries
  `;
  
  return result.rows[0];
}

// Get all entries (for admin purposes)
export async function getAllEntries(limit = 100, offset = 0) {
  const result = await sql`
    SELECT * FROM waitlist_entries 
    ORDER BY created_at DESC 
    LIMIT ${limit} OFFSET ${offset}
  `;
  
  return result.rows as WaitlistEntry[];
}

// Update entry status
export async function updateEntryStatus(id: number, status: 'waiting' | 'approved' | 'rejected', notes?: string) {
  const result = await sql`
    UPDATE waitlist_entries 
    SET status = ${status}, notes = ${notes || null}
    WHERE id = ${id}
    RETURNING *
  `;
  
  return result.rows[0] as WaitlistEntry;
}

// Get IP address from request
export function getClientIP(request: NextRequest): string {
  return request.ip || 
         request.headers.get('x-forwarded-for')?.split(',')[0] || 
         request.headers.get('x-real-ip') || 
         '127.0.0.1';
} 