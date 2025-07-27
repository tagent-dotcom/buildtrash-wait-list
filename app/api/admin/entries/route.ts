import { NextResponse } from 'next/server';
import { getAllEntries } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const entries = await getAllEntries(limit, offset);
    
    return NextResponse.json({
      success: true,
      entries
    });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 