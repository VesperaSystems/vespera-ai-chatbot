import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { analyzeDocument } from '@/lib/ai/tools/analyze-document';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileUrl, fileName, fileType, userMessage, analysisType } = body;

    if (!fileUrl || !fileName || !fileType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      );
    }

    console.log('🔍 Direct document analysis request:');
    console.log('File URL:', fileUrl);
    console.log('File Name:', fileName);
    console.log('File Type:', fileType);

    // Create a mock data stream to capture the analysis result
    let analysisResult: any = null;
    const mockDataStream = {
      writeData: (data: any) => {
        console.log('📤 DataStream write:', data);
        if (
          data.type === 'redirect-to-json-editor' &&
          data.content?.analysisResult
        ) {
          analysisResult = data.content.analysisResult;
        }
      },
    };

    // Call the analyzeDocument tool directly
    const tool = analyzeDocument({ session, dataStream: mockDataStream });
    const result = await tool.execute({
      fileUrl,
      fileName,
      fileType,
      userMessage: userMessage || '',
      analysisType: analysisType || 'legal',
    });

    console.log('📋 Tool execution result:', result);

    if (analysisResult) {
      return NextResponse.json({
        success: true,
        analysis: analysisResult,
        message: 'Document analysis completed successfully',
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'No analysis result generated',
        message: 'Failed to generate analysis',
      });
    }
  } catch (error) {
    console.error('Error in direct document analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze document' },
      { status: 500 },
    );
  }
}
