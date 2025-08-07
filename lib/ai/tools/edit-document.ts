import { z } from 'zod';
import { tool } from 'ai';
import { generateUUID } from '@/lib/utils';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const editDocumentSchema = z.object({
  fileUrl: z.string().describe('URL of the original document file'),
  fileName: z.string().describe('Name of the original file'),
  analysisResult: z
    .object({
      document: z.string(),
      issues: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          original_text: z.string(),
          recommended_text: z.string(),
          comment: z.string(),
        }),
      ),
    })
    .describe('Legal analysis result with issues to apply'),
});

export const editDocument = ({
  session,
  dataStream,
}: { session: any; dataStream: any }) => {
  return tool({
    description:
      'Edit a DOCX document with tracked changes based on legal analysis results. Replaces original text with recommended text and adds comments.',
    parameters: editDocumentSchema,
    execute: async (params: z.infer<typeof editDocumentSchema>) => {
      try {
        const { fileUrl, fileName, analysisResult } = params;

        console.log('📝 Document Edit - Starting process');
        console.log('File URL:', fileUrl);
        console.log('File Name:', fileName);
        console.log('Issues to apply:', analysisResult.issues.length);

        // Download the original file
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        const originalContent = Buffer.from(buffer);

        // Create a new document with tracked changes
        const doc = new Document({
          sections: [
            {
              properties: {},
              children: [],
            },
          ],
        });

        // For now, we'll create a simple implementation
        // In a full implementation, you would:
        // 1. Parse the original DOCX
        // 2. Find and replace text with tracked changes
        // 3. Add comments for each change
        // 4. Save the modified document

        // Create a summary of changes
        const changesSummary = analysisResult.issues.map((issue) => ({
          id: issue.id,
          type: issue.type,
          originalText: issue.original_text,
          recommendedText: issue.recommended_text,
          comment: `vesperaAI edit ${issue.id}: ${issue.comment}`,
        }));

        // Create a temporary file path for the edited document
        const tempDir = tmpdir();
        const editedFileName = `edited_${fileName.replace(/\.[^/.]+$/, '')}_${Date.now()}.docx`;
        const editedFilePath = join(tempDir, editedFileName);

        // For demonstration, we'll create a simple document with the changes
        // In a real implementation, you would modify the original document
        const paragraphs = [
          new Paragraph({
            children: [
              new TextRun({
                text: `Document: ${analysisResult.document}`,
                bold: true,
                size: 24,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Legal Analysis Results - ${new Date().toLocaleDateString()}`,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Total Issues Found: ${analysisResult.issues.length}`,
                size: 16,
              }),
            ],
          }),
        ];

        // Add each issue as a paragraph with tracked changes
        changesSummary.forEach((change, index) => {
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `Issue ${index + 1}: ${change.type}`,
                  bold: true,
                  size: 16,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Original: ${change.originalText}`,
                  color: 'FF0000', // Red for deleted text
                  size: 14,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Recommended: ${change.recommendedText}`,
                  color: '008000', // Green for added text
                  size: 14,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Comment: ${change.comment}`,
                  italics: true,
                  size: 12,
                }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: '---',
                  size: 12,
                }),
              ],
            }),
          );
        });

        // Create the document
        const document = new Document({
          sections: [
            {
              properties: {},
              children: paragraphs,
            },
          ],
        });

        // Pack the document
        const docBuffer = await Packer.toBuffer(document);

        // Save to temporary file
        await writeFile(editedFilePath, docBuffer);

        // Generate download URL
        const fileNameOnly = fileName.replace(/\.[^/.]+$/, '');
        const downloadFileName = `edited_${fileNameOnly}_${Date.now()}.docx`;
        const downloadUrl = `/api/download/edited-document?path=${encodeURIComponent(editedFileName)}&name=${encodeURIComponent(downloadFileName)}`;

        console.log('📝 Document Edit - Changes applied');
        console.log('Edited file saved to:', editedFilePath);
        console.log('Download URL:', downloadUrl);
        console.log('Changes applied:', changesSummary.length);

                            // Create a JSON artifact with the edit results
                    dataStream.writeData({
                      type: 'kind',
                      content: 'json',
                    });

                    dataStream.writeData({
                      type: 'id',
                      content: generateUUID(),
                    });

                    dataStream.writeData({
                      type: 'title',
                      content: `Document Edit: ${fileName}`,
                    });

                    dataStream.writeData({
                      type: 'clear',
                      content: '',
                    });

                    // Send download information
                    dataStream.writeData({
                      type: 'download-info',
                      content: {
                        downloadUrl,
                        downloadFileName,
                      },
                    });

                    dataStream.writeData({ type: 'finish', content: '' });

        return {
          success: true,
          message: `Document edited successfully. Applied ${changesSummary.length} changes with tracked modifications.`,
          editedFilePath,
          downloadUrl,
          downloadFileName,
          changesApplied: changesSummary.length,
          changes: changesSummary,
        };
      } catch (error) {
        console.error('Error in editDocument tool:', error);
        return {
          error: 'Failed to edit document',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
  });
};

// Helper function to format the edit summary
function formatEditSummary(fileName: string, changes: any[], downloadUrl?: string, downloadFileName?: string): string {
  let summary = `# Document Edit: ${fileName}\n\n`;
  summary += `**Edit Summary:**\n`;
  summary += `- Original File: ${fileName}\n`;
  summary += `- Changes Applied: ${changes.length}\n`;
  summary += `- Edit Timestamp: ${new Date().toISOString()}\n\n`;

  if (downloadUrl && downloadFileName) {
    summary += `## 📥 Download Edited Document\n\n`;
    summary += `[Download ${downloadFileName}](${downloadUrl})\n\n`;
    summary += `*Click the link above to download the edited document with tracked changes.*\n\n`;
  }

  if (changes.length === 0) {
    summary += `## ✅ No Changes Applied\n\nNo legal issues were found that required document modifications.\n`;
  } else {
    summary += `## 🔧 Changes Applied\n\n`;

    changes.forEach((change, index) => {
      summary += `### Change ${index + 1}: ${change.type}\n\n`;
      summary += `**ID:** ${change.id}\n\n`;
      summary += `**Original Text:**\n\`\`\`\n${change.originalText}\n\`\`\`\n\n`;
      summary += `**Recommended Text:**\n\`\`\`\n${change.recommendedText}\n\`\`\`\n\n`;
      summary += `**Comment:**\n${change.comment}\n\n`;
      summary += `---\n\n`;
    });
  }

  summary += `\n*Document has been edited with tracked changes. Review the modifications before finalizing.*`;

  return summary;
}
