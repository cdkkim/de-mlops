import { NextResponse } from 'next/server';
import { getProcessedDataForPath } from '@/lib/data';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pathParam = searchParams.get('path');
    const daysParam = searchParams.get('days');
    
    let path: string[] = ['All'];
    if (pathParam) {
      try {
        const decodedPathParam = decodeURIComponent(pathParam);
        path = JSON.parse(decodedPathParam);
        if (!Array.isArray(path)) {
          path = ['All'];
        }
      } catch (e) {
        console.warn('Failed to parse path param, using default.', e);
        path = ['All'];
      }
    }
    
    const days = daysParam ? parseInt(daysParam, 10) : 14;
    if (isNaN(days) || days <= 0) {
      return NextResponse.json({ message: 'Invalid "days" parameter.' }, { status: 400 });
    }
    
    const data = getProcessedDataForPath(path, days);
    return NextResponse.json(data);

  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ message: `Internal Server Error: ${errorMessage}` }, { status: 500 });
  }
} 