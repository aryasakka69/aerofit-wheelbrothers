import { NextRequest, NextResponse } from 'next/server';
import { callGeminiNarrative, generateFallbackNarrative } from '@/lib/recommendations/gemini-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cda, bikeName, bikeCategory, recommendations, userLevel } = body;

    if (!cda || !recommendations) {
      return NextResponse.json(
        { error: 'Missing required fields (cda, recommendations)' },
        { status: 400 }
      );
    }

    const narrative = await callGeminiNarrative({
      cda,
      bikeName,
      bikeCategory: bikeCategory || 'ROAD_ALLROUNDER',
      recommendations,
      userLevel
    });

    return NextResponse.json({
      success: true,
      narrative,
      isAiGenerated: !!process.env.GEMINI_API_KEY
    });
  } catch (error) {
    console.error('Narrative API error:', error);
    return NextResponse.json(
      { error: 'Internal server error processing narrative' },
      { status: 500 }
    );
  }
}
