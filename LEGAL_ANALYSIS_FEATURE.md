# Legal Analysis Feature

## Overview

The Legal Analysis feature provides comprehensive legal document review and analysis capabilities using OpenAI's GPT-4o model with structured JSON schema validation. This feature can analyze DOCX, PDF, and TXT documents for legal issues, inconsistencies, and areas for improvement.

## Features

### 🔍 **Comprehensive Legal Analysis**

- **Legal Issue Detection**: Identifies ambiguous language, missing clauses, and potential liability issues
- **Contract Analysis**: Reviews contractual language for enforceability and completeness
- **Regulatory Compliance**: Checks for compliance issues and regulatory requirements
- **Legal Terminology**: Validates legal terminology accuracy and consistency

### 📋 **Structured Output**

- **JSON Schema Validation**: Ensures consistent, structured responses using Ajv validation
- **Detailed Issues**: Each issue includes ID, type, original text, recommended text, and detailed comments
- **Before/After Examples**: Provides specific text recommendations with clear before/after examples

### 🛡️ **Error Handling & Validation**

- **Schema Validation**: Validates OpenAI responses against strict JSON schema
- **Fallback Handling**: Graceful error handling with meaningful error messages
- **Type Safety**: Full TypeScript support with proper type assertions

## Technical Implementation

### API Integration

```typescript
// OpenAI API with JSON Schema
const openaiResponse = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "DocumentIssues",
      schema: legalAnalysisSchema,
    },
  },
  temperature: 0.1, // Low temperature for consistent legal analysis
});
```

### JSON Schema Structure

```json
{
  "type": "object",
  "properties": {
    "document": { "type": "string" },
    "issues": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "type": { "type": "string" },
          "original_text": { "type": "string" },
          "recommended_text": { "type": "string" },
          "comment": { "type": "string" }
        },
        "required": [
          "id",
          "type",
          "original_text",
          "recommended_text",
          "comment"
        ]
      }
    }
  },
  "required": ["document", "issues"]
}
```

### Document Processing

- **DOCX Support**: Uses mammoth.js for text extraction from Word documents
- **PDF Support**: Placeholder for future PDF text extraction
- **TXT Support**: Direct text processing for plain text files
- **Text Cleaning**: Removes extra whitespace and normalizes line breaks

## Usage Examples

### Basic Legal Analysis

```
User: "Please analyze this contract for legal issues"
AI: Uses analyzeDocument tool to provide comprehensive legal analysis
```

### Specific Legal Review

```
User: "Review this employment agreement for compliance issues"
AI: Focuses on employment law compliance and regulatory requirements
```

### Contract Improvement

```
User: "Check this document for legal terminology accuracy"
AI: Validates legal terms and suggests improvements
```

## Tool Integration

### Chat API Integration

The legal analysis tool is integrated into the chat system via:

```typescript
// In app/(chat)/api/chat/route.ts
experimental_activeTools: [
  'getWeather',
  'createDocument',
  'updateDocument',
  'requestSuggestions',
  'createChart',
  'analyzeDocument', // Legal analysis tool
  'extractDocumentText', // Basic text extraction
],
```

### Tool Parameters

```typescript
const analyzeDocumentSchema = z.object({
  fileUrl: z.string().describe("URL of the uploaded document file"),
  fileName: z.string().describe("Name of the uploaded file"),
  fileType: z.string().describe("MIME type of the uploaded file"),
  userMessage: z
    .string()
    .optional()
    .describe("User message or context for analysis"),
  analysisType: z
    .enum(["legal", "finance", "general"])
    .optional()
    .describe("Type of analysis to perform"),
});
```

## Error Handling

### Validation Errors

- **Schema Validation**: Uses Ajv to validate OpenAI responses
- **Type Safety**: TypeScript type assertions after validation
- **Graceful Degradation**: Returns meaningful error messages

### File Processing Errors

- **Download Failures**: Handles network errors and file access issues
- **Unsupported Formats**: Provides clear error messages for unsupported file types
- **Empty Content**: Validates that documents contain extractable text

## Output Format

### Analysis Results

```typescript
{
  success: true,
  message: "Legal analysis completed successfully. Found X issues.",
  analysis: {
    document: "Contract Name",
    issues: [
      {
        id: "issue-1",
        type: "ambiguous_language",
        original_text: "The party shall pay the amount.",
        recommended_text: "The party shall pay the amount of $X within 30 days.",
        comment: "Original text is ambiguous as it doesn't specify amount or terms."
      }
    ],
    metadata: {
      fileName: "contract.docx",
      fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      charactersAnalyzed: 1500,
      analysisTimestamp: "2024-01-01T00:00:00.000Z",
      analysisType: "legal",
      issuesFound: 3
    }
  }
}
```

### Display Format

The analysis results are formatted for display in the chat interface:

```markdown
# Legal Analysis: Contract Name

**Analysis Summary:**

- Document: Contract Name
- Issues Found: 3
- Analysis Type: legal
- Analyzed: 1500 characters

## 🔍 Issues Found

### Issue 1: ambiguous_language

**ID:** issue-1

**Original Text:**
```

The party shall pay the amount.

```

**Recommended Text:**
```

The party shall pay the amount of $X within 30 days of invoice receipt.

```

**Comment:**
The original text is ambiguous as it doesn't specify the amount or payment terms.

---
```

## Dependencies

- **OpenAI**: For AI-powered legal analysis
- **Ajv**: For JSON schema validation
- **Mammoth**: For DOCX text extraction
- **Zod**: For parameter validation

## Testing

The feature includes comprehensive tests covering:

- Successful legal analysis with structured output
- Schema validation error handling
- File download error handling
- Type safety validation

## Future Enhancements

- **PDF Text Extraction**: Full PDF support with text extraction
- **Multi-language Support**: Legal analysis in multiple languages
- **Custom Legal Templates**: Industry-specific legal analysis templates
- **Batch Processing**: Analyze multiple documents simultaneously
- **Legal Database Integration**: Reference to legal precedents and regulations
