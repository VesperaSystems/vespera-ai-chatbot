'use client';

import { Button } from '@/components/ui/button';

export function TestRedirect() {
  const testRedirect = () => {
    console.log('🧪 TestRedirect: Testing redirect functionality');

    // Store test data
    sessionStorage.setItem(
      'legalAnalysisData',
      JSON.stringify({
        analysisResult: {
          document: 'test_document',
          issues: [
            {
              id: '1',
              type: 'Test Issue',
              original_text: 'Test original text',
              recommended_text: 'Test recommended text',
              comment: 'Test comment',
            },
          ],
          metadata: {
            fileName: 'test.docx',
            fileType:
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            charactersAnalyzed: 100,
            analysisTimestamp: new Date().toISOString(),
            analysisType: 'legal',
            issuesFound: 1,
          },
        },
        fileUrl: 'https://example.com/test.docx',
        fileName: 'test.docx',
      }),
    );

    console.log('💾 TestRedirect: Test data stored');
    console.log('🚀 TestRedirect: Redirecting to /legal-analysis-editor');

    // Try redirect
    window.location.href = '/legal-analysis-editor';
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Test Redirect</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Click the button below to test the redirect functionality.
      </p>
      <Button onClick={testRedirect} variant="outline">
        Test Redirect to Legal Analysis Editor
      </Button>
    </div>
  );
}
