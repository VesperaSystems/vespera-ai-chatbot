import { z } from 'zod';
import { tool } from 'ai';
import mammoth from 'mammoth';
import { OpenAI } from 'openai';
import { Ajv } from 'ajv';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const ajv = new Ajv();

// JSON Schema for legal document analysis
const legalAnalysisSchema = {
  type: 'object',
  properties: {
    document: { type: 'string' },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string' },
          original_text: { type: 'string' },
          recommended_text: { type: 'string' },
          comment: { type: 'string' },
        },
        required: [
          'id',
          'type',
          'original_text',
          'recommended_text',
          'comment',
        ],
      },
    },
  },
  required: ['document', 'issues'],
};

const validate = ajv.compile(legalAnalysisSchema);

const analyzeDocumentSchema = z.object({
  fileUrl: z.string().describe('URL of the uploaded document file'),
  fileName: z.string().describe('Name of the uploaded file'),
  fileType: z.string().describe('MIME type of the uploaded file'),
  userMessage: z
    .string()
    .optional()
    .describe('User message or context for analysis'),
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
      'Analyze uploaded documents (DOCX, PDF, TXT) and provide structured legal analysis with issues, recommendations, and corrections.',
    parameters: analyzeDocumentSchema,
    execute: async (params: z.infer<typeof analyzeDocumentSchema>) => {
      try {
        const {
          fileUrl,
          fileName,
          fileType,
          userMessage = '',
          analysisType = 'legal',
        } = params;

        // Console log the analysis parameters
        console.log('🔧 Legal Analysis - Parameters:');
        console.log('File URL:', fileUrl);
        console.log('File Name:', fileName);
        console.log('File Type:', fileType);
        console.log('User Message:', userMessage);
        console.log('Analysis Type:', analysisType);

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

        // Console log the extracted text for debugging
        const documentName = fileName.replace(/\.[^/.]+$/, ''); // Remove file extension
        console.log('📄 Legal Analysis - Extracted Text:');
        console.log('Document Name:', documentName);
        console.log('Text Length:', extractedText.length, 'characters');
        console.log('First 500 characters:', extractedText.substring(0, 500));

        // Create the legal analysis prompt

        const systemPrompt = `You are a legal document analysis API. Analyze the provided document for legal issues, inconsistencies, and areas for improvement. 

Focus on:
- Legal terminology and accuracy
- Contractual language and enforceability
- Regulatory compliance issues
- Ambiguous or unclear language
- Missing important legal clauses
- Potential liability issues

Respond ONLY with valid JSON matching the specified schema.`;

        const userPrompt = `Analyze this document and respond ONLY in JSON matching the schema: ${JSON.stringify(legalAnalysisSchema)}

Document Name: ${documentName}
Document Content:
${extractedText}

${userMessage ? `User Context: ${userMessage}` : ''}

Provide a comprehensive legal analysis with specific issues, recommended text changes, and detailed comments explaining each issue.`;

        // Call OpenAI API with JSON schema validation
        const openaiResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'DocumentIssues',
              schema: legalAnalysisSchema,
            },
          },
          temperature: 0.1, // Lower temperature for more consistent legal analysis
        });

        const content = openaiResponse.choices[0].message.content;
        if (!content) {
          throw new Error('No content received from OpenAI API');
        }
        const parsed = JSON.parse(content);

        // Console log the raw JSON response for debugging
        console.log('🔍 Legal Analysis - Raw OpenAI Response:');
        console.log(JSON.stringify(parsed, null, 2));

        // Validate the response against the schema
        if (!validate(parsed)) {
          console.error('Invalid JSON response:', validate.errors);
          throw new Error('Schema validation failed for OpenAI response');
        }

        // Type assertion after validation
        const validatedParsed = parsed as {
          document: string;
          issues: Array<{
            id: string;
            type: string;
            original_text: string;
            recommended_text: string;
            comment: string;
          }>;
        };

        // Create a structured analysis result
        const analysisResult = {
          document: validatedParsed.document,
          issues: validatedParsed.issues,
          metadata: {
            fileName: fileName,
            fileType: fileType,
            charactersAnalyzed: extractedText.length,
            analysisTimestamp: new Date().toISOString(),
            analysisType: analysisType,
            issuesFound: validatedParsed.issues.length,
          },
        };

        // Console log the final analysis result
        console.log('📋 Legal Analysis - Final Result:');
        console.log(JSON.stringify(analysisResult, null, 2));

        // Instead of sending text to chat, redirect to JSON editor
        console.log('🔄 Sending redirect-to-json-editor command');
        dataStream.writeData({
          type: 'redirect-to-json-editor',
          content: {
            analysisResult: analysisResult,
            fileUrl: fileUrl,
            fileName: fileName,
          },
        });
        console.log('✅ Redirect command sent successfully');

        dataStream.writeData({ type: 'finish', content: '' });

        return {
          success: true,
          message: `Legal analysis completed successfully. Found ${validatedParsed.issues.length} issues.`,
          analysis: analysisResult,
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

// Helper function to format the legal analysis for display
function formatLegalAnalysis(analysis: any): string {
  const { document, issues, metadata } = analysis;

  let formatted = `# Legal Analysis: ${document}\n\n`;
  formatted += `**Analysis Summary:**\n`;
  formatted += `- Document: ${document}\n`;
  formatted += `- Issues Found: ${metadata.issuesFound}\n`;
  formatted += `- Analysis Type: ${metadata.analysisType}\n`;
  formatted += `- Analyzed: ${metadata.charactersAnalyzed} characters\n\n`;

  if (issues.length === 0) {
    formatted += `## ✅ No Issues Found\n\nThis document appears to be legally sound with no significant issues detected.\n`;
  } else {
    formatted += `## 🔍 Issues Found\n\n`;

    issues.forEach((issue: any, index: number) => {
      formatted += `### Issue ${index + 1}: ${issue.type}\n\n`;
      formatted += `**ID:** ${issue.id}\n\n`;
      formatted += `**Original Text:**\n\`\`\`\n${issue.original_text}\n\`\`\`\n\n`;
      formatted += `**Recommended Text:**\n\`\`\`\n${issue.recommended_text}\n\`\`\`\n\n`;
      formatted += `**Comment:**\n${issue.comment}\n\n`;
      formatted += `---\n\n`;
    });
  }

  return formatted;
}
