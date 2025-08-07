import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { editDocument } from '@/lib/ai/tools/edit-document';

type LegalAnalysisIssue = {
  id: string;
  type: string;
  original_text: string;
  recommended_text: string;
  comment: string;
  position: {
    start: number;
    end: number;
  };
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileUrl, fileName, issues } = body;

    if (!fileUrl || !fileName || !issues || !Array.isArray(issues)) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      );
    }

    console.log('🔧 Applying all issues to document:');
    console.log('File URL:', fileUrl);
    console.log('File Name:', fileName);
    console.log('Issues count:', issues.length);

    // Log each issue for debugging
    issues.forEach((issue, index) => {
      console.log(`Issue ${index + 1}:`);
      console.log(`  Original: "${issue.original_text}"`);
      console.log(`  Recommended: "${issue.recommended_text}"`);
    });

    // Use the editDocument function to apply all issues
    const result = await editDocument({
      fileUrl,
      fileName,
      issues: issues,
    });

    console.log('✅ Document editing completed successfully');

    return NextResponse.json({
      success: true,
      message: `Document edited successfully with ${issues.length} tracked changes`,
      downloadUrl: result.downloadUrl,
      downloadFileName: result.downloadFileName,
      issuesApplied: issues.length,
    });
  } catch (error) {
    console.error('Error in document edit-all API:', error);
    return NextResponse.json(
      { error: 'Failed to edit document' },
      { status: 500 },
    );
  }
}
