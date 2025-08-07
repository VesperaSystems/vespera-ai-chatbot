import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

type LegalAnalysisIssue = {
  id: string;
  type: string;
  original_text: string;
  recommended_text: string;
  comment: string;
};

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileUrl, fileName, issue } = body;

    if (!fileUrl || !fileName || !issue) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      );
    }

    // Download the original file
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const originalContent = Buffer.from(buffer);

    // Create a new document with the changes
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Document: ${fileName}`,
                  bold: true,
                  size: 24,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Legal Analysis Edit - ${new Date().toLocaleDateString()}`,
                  size: 20,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Issue Applied: ${issue.type}`,
                  size: 16,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Original Text:',
                  bold: true,
                  size: 14,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: issue.original_text,
                  color: 'FF0000', // Red for deleted text
                  size: 14,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Recommended Text:',
                  bold: true,
                  size: 14,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: issue.recommended_text,
                  color: '008000', // Green for added text
                  size: 14,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Comment:',
                  bold: true,
                  size: 14,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: issue.comment,
                  italics: true,
                  size: 12,
                }),
              ],
            }),
          ],
        },
      ],
    });

    // Pack the document
    const docBuffer = await Packer.toBuffer(doc);

    // Create a temporary file path for the edited document
    const tempDir = tmpdir();
    const editedFileName = `edited_${fileName.replace(/\.[^/.]+$/, '')}_${Date.now()}.docx`;
    const editedFilePath = join(tempDir, editedFileName);

    // Save to temporary file
    await writeFile(editedFilePath, docBuffer);

    // Generate download URL
    const fileNameOnly = fileName.replace(/\.[^/.]+$/, '');
    const downloadFileName = `edited_${fileNameOnly}_${Date.now()}.docx`;
    const downloadUrl = `/api/download/edited-document?path=${encodeURIComponent(editedFileName)}&name=${encodeURIComponent(downloadFileName)}`;

    return NextResponse.json({
      success: true,
      message: 'Document edited successfully',
      downloadUrl,
      downloadFileName,
      issueApplied: issue.id,
    });
  } catch (error) {
    console.error('Error in document edit API:', error);
    return NextResponse.json(
      { error: 'Failed to edit document' },
      { status: 500 },
    );
  }
}
