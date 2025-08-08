'use client';

import { useEffect } from 'react';

interface LegalAnalysisRedirectProps {
  analysisResult: any;
  fileUrl: string;
  fileName: string;
}

export function LegalAnalysisRedirect({
  analysisResult,
  fileUrl,
  fileName,
}: LegalAnalysisRedirectProps) {
  useEffect(() => {
    console.log('🔄 LegalAnalysisRedirect: Starting redirect process');

    // Store the analysis data in sessionStorage for the JSON editor to access
    sessionStorage.setItem(
      'legalAnalysisData',
      JSON.stringify({
        analysisResult,
        fileUrl,
        fileName,
      }),
    );
    console.log('💾 LegalAnalysisRedirect: Data stored in sessionStorage');

    // Try multiple redirect methods for better compatibility
    const redirectUrl = '/legal-analysis-editor';
    console.log('🚀 LegalAnalysisRedirect: Redirecting to:', redirectUrl);
    console.log(
      '📍 LegalAnalysisRedirect: Current location:',
      window.location.href,
    );

    // Method 1: Try window.location.replace first (more reliable than href)
    try {
      window.location.replace(redirectUrl);
    } catch (error) {
      console.error(
        '❌ LegalAnalysisRedirect: window.location.replace failed:',
        error,
      );

      // Method 2: Fallback to window.location.href
      try {
        window.location.href = redirectUrl;
      } catch (error2) {
        console.error(
          '❌ LegalAnalysisRedirect: window.location.href also failed:',
          error2,
        );

        // Method 3: Last resort - try to navigate programmatically
        if (typeof window !== 'undefined' && window.history) {
          window.history.pushState({}, '', redirectUrl);
          window.location.reload();
        }
      }
    }
  }, [analysisResult, fileUrl, fileName]);

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full size-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">
          Redirecting to legal analysis editor...
        </p>
      </div>
    </div>
  );
}
