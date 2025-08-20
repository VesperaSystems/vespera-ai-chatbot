'use client';

import React, { useState } from 'react';
import { Editor } from './text-editor';

const testContent = `This employment agreement between Company XYZ and Employee John Doe is entered into on January 1, 2024. The Employee shall receive a salary of $X per year, payable in accordance with the Company's standard payroll practices. Either party may terminate this Agreement at any time with or without cause. The Employee agrees to maintain confidentiality of all proprietary information.`;

const testSuggestions = [
  {
    id: 'issue-1',
    type: 'ambiguous_compensation',
    originalText:
      "The Employee shall receive a salary of $X per year, payable in accordance with the Company's standard payroll practices.",
    recommendedText:
      "The Employee shall receive a salary of $85,000 per year, payable bi-weekly in accordance with the Company's standard payroll practices.",
    comment:
      "The original text uses a placeholder '$X' which is ambiguous and unenforceable. Specific compensation amounts should be clearly stated to avoid disputes.",
    position: {
      start: 89,
      end: 189,
    },
    status: 'pending' as 'pending' | 'accepted' | 'rejected',
  },
  {
    id: 'issue-2',
    type: 'missing_termination_notice',
    originalText:
      'Either party may terminate this Agreement at any time with or without cause.',
    recommendedText:
      'Either party may terminate this Agreement with 30 days written notice, or immediately for cause as defined in Section 7.',
    comment:
      "The original clause lacks specific notice requirements and definition of 'cause,' which could lead to legal disputes and potential wrongful termination claims.",
    position: {
      start: 190,
      end: 250,
    },
    status: 'pending' as 'pending' | 'accepted' | 'rejected',
  },
];

export function TestDocumentEditor() {

  const [content, setContent] = useState(testContent);
  const [contentType, setContentType] = useState<'correct' | 'filename'>(
    'correct',
  );

  // Test different content types
  const testContents = {
    correct: testContent,
    filename: 'employment_agreement_test',
  };



  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    console.log('Content changed:', newContent);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Document Editor</h1>

      {/* Content type selector */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Test Content Type:</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setContentType('correct');
              setContent(testContents.correct);
            }}
            className={`px-3 py-1 rounded text-sm ${
              contentType === 'correct'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Correct Content (Full Text)
          </button>
          <button
            type="button"
            onClick={() => {
              setContentType('filename');
              setContent(testContents.filename);
            }}
            className={`px-3 py-1 rounded text-sm ${
              contentType === 'filename'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Filename Only (Current Issue)
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Current content:{' '}
          {contentType === 'correct' ? 'Full document text' : 'Filename only'}
        </p>
      </div>

      <div className="h-[600px] border rounded-lg">
        <Editor
          content={content}
          onSaveContent={handleContentChange}
          status="idle"
          isCurrentVersion={true}
          currentVersionIndex={0}
        />
      </div>
      <div className="mt-4 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p>Content length: {content.length}</p>
      </div>
    </div>
  );
}
