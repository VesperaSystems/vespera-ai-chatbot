import { z } from 'zod';
import { tool } from 'ai';
import { generateUUID } from '@/lib/utils';
import mammoth from 'mammoth';

const analyzeDocumentSchema = z.object({
  fileUrl: z.string().describe('URL of the uploaded document file'),
  fileName: z.string().describe('Name of the uploaded file'),
  fileType: z.string().describe('MIME type of the uploaded file'),
  analysisType: z
    .enum(['legal', 'finance', 'general'])
    .optional()
    .describe('Type of analysis to perform'),
});

export const analyzeDocument = ({
  session,
  dataStream,
}: { session: any; dataStream: any }) => {
  return tool({
    description:
      'Analyze uploaded documents (DOCX, PDF, TXT) and provide structured feedback with issues, recommendations, and corrections.',
    parameters: analyzeDocumentSchema,
    execute: async (params: z.infer<typeof analyzeDocumentSchema>) => {
      try {
        const {
          fileUrl,
          fileName,
          fileType,
          analysisType = 'general',
        } = params;

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
          extractedText =
            'No text content could be extracted from this document.';
        }

        // Create analysis result based on document type and analysis type
        const documentName = fileName.replace(/\.[^/.]+$/, ''); // Remove file extension

        const analysisResult = {
          document: documentName,
          analysisType: analysisType,
          originalFileUrl: fileUrl,
          originalFileName: fileName,
          issues: [],
          recommendations: [],
          summary: `Analysis of ${documentName} completed.`,
          metadata: {
            charactersAnalyzed: extractedText.length,
            analysisTimestamp: new Date().toISOString(),
            fileType: fileType,
          },
        };

        // For now, return a template structure
        // The AI will populate this with actual analysis
        const analysisJson = JSON.stringify(analysisResult, null, 2);

        // Create a text artifact with the analysis JSON
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
          content: `Document Analysis: ${documentName}`,
        });

        dataStream.writeData({
          type: 'clear',
          content: '',
        });

        dataStream.writeData({
          type: 'text',
          content: `# Document Analysis: ${documentName}\n\n## Document Content\n\n\`\`\`\n${extractedText.substring(0, 1000)}${extractedText.length > 1000 ? '\n\n... (truncated for display)' : ''}\n\`\`\`\n\n*Document processed. Provide analysis in natural language.*`,
        });

        dataStream.writeData({ type: 'finish', content: '' });

        // Return nothing visible to avoid showing any response in chat
        return {
          success: true,
          message: `Document processed successfully`,
        };
      } catch (error) {
        console.error('Error in analyzeDocument tool:', error);
        return {
          error: 'Failed to analyze document',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
  });
};
