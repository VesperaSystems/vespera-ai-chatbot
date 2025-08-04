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
      'Extract text content from uploaded documents (DOCX, PDF, TXT) and provide the extracted text for AI analysis.',
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
          // Extract text from DOCX/DOC files
          const result = await mammoth.extractRawText({ buffer });
          extractedText = result.value;

          if (result.messages.length > 0) {
            console.log('Mammoth warnings:', result.messages);
          }
        } else if (
          fileType === 'application/pdf' ||
          fileName.toLowerCase().endsWith('.pdf')
        ) {
          // PDF parsing is not yet implemented
          extractedText = `PDF file "${fileName}" detected. PDF text extraction is not yet implemented. Please convert to DOCX or TXT format for text extraction.`;
        } else if (
          fileType === 'text/plain' ||
          fileName.toLowerCase().endsWith('.txt')
        ) {
          // Extract text from TXT files
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
          extractedText =
            'No text content could be extracted from this document.';
        }

        // Create a document artifact with the extracted text
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
          content: `Document Text: ${fileName}`,
        });

        dataStream.writeData({
          type: 'clear',
          content: '',
        });

        dataStream.writeData({
          type: 'text',
          content: extractedText,
        });

        dataStream.writeData({ type: 'finish', content: '' });

        return {
          success: true,
          message: `Successfully extracted ${extractedText.length} characters from ${fileName}`,
          document: {
            content: extractedText,
            language: 'markdown',
            filename: `${fileName}_extracted_text.md`,
          },
          details: {
            fileName,
            fileType,
            fileUrl,
            extractionStatus: 'completed',
            charactersExtracted: extractedText.length,
            note: 'Text extraction completed successfully.',
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
