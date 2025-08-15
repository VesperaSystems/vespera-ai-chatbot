import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
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
          position: {
            type: 'object',
            properties: {
              start: { type: 'number' },
              end: { type: 'number' },
            },
            required: ['start', 'end'],
          },
        },
        required: [
          'id',
          'type',
          'original_text',
          'recommended_text',
          'comment',
          'position',
        ],
      },
    },
  },
  required: ['document', 'issues'],
};

const validate = ajv.compile(legalAnalysisSchema);

async function analyzeDocumentDirectly({
  fileUrl,
  fileName,
  fileType,
  userMessage = '',
  analysisType = 'legal',
}: {
  fileUrl: string;
  fileName: string;
  fileType: string;
  userMessage?: string;
  analysisType?: string;
}) {
  try {
    // Console log the analysis parameters
    console.log('🔧 Legal Analysis - Parameters:');
    console.log('File URL:', fileUrl);
    console.log('File Name:', fileName);
    console.log('File Type:', fileType);
    console.log('User Message:', userMessage);
    console.log('Analysis Type:', analysisType);

    let extractedText = '';

    // Download the file from the URL
    console.log('📥 Downloading file from URL:', fileUrl);
    const response = await fetch(fileUrl);
    console.log('📥 Download response status:', response.status);

    if (!response.ok) {
      console.error(
        '❌ File download failed:',
        response.status,
        response.statusText,
      );
      throw new Error(
        `Failed to download file: ${response.status} ${response.statusText}`,
      );
    }

    const buffer = await response.arrayBuffer();
    console.log('📥 File downloaded, buffer size:', buffer.byteLength);

    // Extract text based on file type
    console.log('📄 Extracting text from file type:', fileType);

    if (
      fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword' ||
      fileName.toLowerCase().endsWith('.docx') ||
      fileName.toLowerCase().endsWith('.doc')
    ) {
      console.log('📄 Using mammoth to extract text from DOCX/DOC file');
      const result = await mammoth.extractRawText({
        buffer: Buffer.from(buffer),
      });
      extractedText = result.value;
      console.log('📄 Text extracted, length:', extractedText.length);
      if (result.messages.length > 0) {
        console.log('⚠️ Mammoth warnings:', result.messages);
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
      throw new Error('No text content could be extracted from this document.');
    }

    // Console log the extracted text for debugging
    const documentName = fileName.replace(/\.[^/.]+$/, ''); // Remove file extension
    console.log('📄 Legal Analysis - Extracted Text:');
    console.log('Document Name:', documentName);
    console.log('Text Length:', extractedText.length, 'characters');
    console.log('Full Extracted Text:');
    console.log(extractedText);

    // Create the legal analysis prompt
    const systemPrompt = `You are a legal document analysis API. Analyze ONLY the actual text content provided in the document for legal issues, inconsistencies, and areas for improvement. 

CRITICAL INSTRUCTIONS:
- ONLY analyze the exact text provided in the document
- DO NOT generate examples or hypothetical text
- ONLY identify issues in the actual document content
- If the document text is clear and legally sound, return an empty issues array
- Each issue must reference EXACT text from the document

Return a JSON object with this structure:
{
  "document": "Document name or title",
  "issues": [
    {
      "id": "unique-issue-id",
      "type": "issue_type",
      "original_text": "exact text from document",
      "recommended_text": "improved version",
      "comment": "explanation of the issue",
      "position": {
        "start": 0,
        "end": 0
      }
    }
  ]
}`;

    const userPrompt = `Analyze this ${analysisType} document for legal issues, inconsistencies, and areas for improvement:

Document: ${documentName}
User Context: ${userMessage}

Document Content:
${extractedText}

Provide a structured analysis with specific issues found in the document.`;

    // Call OpenAI API with JSON schema validation
    console.log('🤖 Calling OpenAI API for document analysis...');
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
    console.log('🤖 OpenAI API response received');

    const content = openaiResponse.choices[0].message.content;
    console.log('🤖 OpenAI response content length:', content?.length || 0);

    if (!content) {
      console.error('❌ No content received from OpenAI API');
      throw new Error('No content received from OpenAI API');
    }

    console.log('🤖 Parsing OpenAI response as JSON...');
    const parsed = JSON.parse(content);
    console.log('🤖 JSON parsing successful');

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
        position: {
          start: number;
          end: number;
        };
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

    return {
      success: true,
      message: `Legal analysis completed successfully. Found ${validatedParsed.issues.length} issues.`,
      analysis: analysisResult,
    };
  } catch (error) {
    console.error('Error in analyzeDocumentDirectly:', error);
    return {
      error: 'Failed to analyze document',
      message:
        error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Document analysis request received');

    const session = await auth();
    console.log(
      'Session check:',
      session ? 'authenticated' : 'not authenticated',
    );

    if (!session?.user) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { fileUrl, fileName, fileType, userMessage, analysisType } = body;

    console.log('📋 Request parameters:', {
      fileUrl: fileUrl ? 'provided' : 'missing',
      fileName: fileName ? 'provided' : 'missing',
      fileType: fileType ? 'provided' : 'missing',
      userMessage: userMessage ? 'provided' : 'missing',
      analysisType: analysisType ? 'provided' : 'missing',
    });

    if (!fileUrl || !fileName || !fileType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      );
    }

    console.log('🔍 Direct document analysis request:');
    console.log('File URL:', fileUrl);
    console.log('File Name:', fileName);
    console.log('File Type:', fileType);

    // Call the standalone analysis function
    const result = await analyzeDocumentDirectly({
      fileUrl,
      fileName,
      fileType,
      userMessage: userMessage || '',
      analysisType: analysisType || 'legal',
    });

    console.log('📋 Analysis result:', result);

    if (result.success && result.analysis) {
      return NextResponse.json({
        success: true,
        analysis: result.analysis,
        message: result.message,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'No analysis result generated',
        message: result.message || 'Failed to generate analysis',
      });
    }
  } catch (error) {
    console.error('Error in direct document analysis:', error);
    return NextResponse.json(
      { error: 'Failed to analyze document' },
      { status: 500 },
    );
  }
}
