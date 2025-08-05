import { z } from 'zod';
import { tool } from 'ai';
import { generateUUID } from '@/lib/utils';
import mammoth from 'mammoth';

const extractDocumentTextSchema = z.object({
  fileUrl: z.string().describe('URL of the uploaded document file'),
  fileName: z.string().describe('Name of the uploaded file'),
  fileType: z.string().describe('MIME type of the uploaded file'),
});

export const extractDocumentText = ({
  session,
  dataStream,
}: { session: any; dataStream: any }) => {
  return tool({
    description:
      'Extract text content from uploaded documents (DOCX, PDF, TXT) for basic analysis and processing.',
    parameters: extractDocumentTextSchema,
    execute: async (params: z.infer<typeof extractDocumentTextSchema>) => {
      try {
        const { fileUrl, fileName, fileType } = params;

        let extractedText = '';

        // Download the file from the URL
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to download file: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();

        // Extract text based on file type
        if (
          fileType ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          fileType === 'application/msword' ||
          fileName.toLowerCase().endsWith('.docx') ||
          fileName.toLowerCase().endsWith('.doc')
        ) {
          const result = await mammoth.extractRawText({
            buffer: Buffer.from(buffer),
          });
          extractedText = result.value;
          if (result.messages.length > 0) {
            console.log('Mammoth warnings:', result.messages);
          }
        } else if (
          fileType === 'application/pdf' ||
          fileName.toLowerCase().endsWith('.pdf')
        ) {
          extractedText = `PDF file "${fileName}" detected. PDF text extraction is not yet implemented. Please convert to DOCX or TXT format for analysis.`;
        } else if (
          fileType === 'text/plain' ||
          fileName.toLowerCase().endsWith('.txt')
        ) {
          extractedText = new TextDecoder().decode(buffer);
        } else {
          throw new Error(`Unsupported file type: ${fileType}`);
        }

        // Clean up the extracted text
        extractedText = extractedText
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

        if (!extractedText) {
          throw new Error(
            'No text content could be extracted from this document.',
          );
        }

        const documentName = fileName.replace(/\.[^/.]+$/, ''); // Remove file extension

        // Create a text artifact with the extracted content
        dataStream.writeData({
          type: 'kind',
          content: 'text',
        });

        dataStream.writeData({
          type: 'id',
          content: generateUUID(),
        });

        dataStream.writeData({
          type: 'title',
          content: `Document Text: ${documentName}`,
        });

        dataStream.writeData({
          type: 'clear',
          content: '',
        });

        dataStream.writeData({
          type: 'text',
          content: `# Document Text: ${documentName}\n\n## Extracted Content\n\n\`\`\`\n${extractedText}\n\`\`\`\n\n**Document Information:**\n- File Name: ${fileName}\n- File Type: ${fileType}\n- Characters Extracted: ${extractedText.length}\n- Extraction Timestamp: ${new Date().toISOString()}\n\n*Text extraction completed. You can now analyze, summarize, or answer questions about this content.*`,
        });

        dataStream.writeData({ type: 'finish', content: '' });

        return {
          success: true,
          message: `Text extraction completed successfully. Extracted ${extractedText.length} characters.`,
          extractedText,
          metadata: {
            fileName,
            fileType,
            charactersExtracted: extractedText.length,
            extractionTimestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        console.error('Error in extractDocumentText tool:', error);
        return {
          error: 'Failed to extract document text',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
  });
};
