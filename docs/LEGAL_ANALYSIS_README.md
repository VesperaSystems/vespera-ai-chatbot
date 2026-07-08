# Legal Document Analysis Application

## Overview

This application provides a comprehensive legal document analysis system that allows users to upload DOCX documents, analyze them for legal issues using OpenAI's GPT-4o model, and apply recommended changes with tracked modifications.

## Features

### 🔍 **Document Upload & Analysis**

- Upload DOCX documents through a user-friendly interface
- Automatic text extraction using mammoth.js
- AI-powered legal analysis using OpenAI GPT-4o
- Structured JSON output with detailed issue identification

### 📋 **Legal Issue Detection**

- **Ambiguous Language**: Identifies vague or unclear contractual terms
- **Enforceability Issues**: Flags potentially unenforceable clauses
- **Regulatory Compliance**: Checks for compliance with legal requirements
- **Missing Clauses**: Identifies important legal provisions that are absent
- **Liability Issues**: Highlights potential liability concerns
- **Legal Terminology**: Validates accuracy of legal terms

### 🛠️ **Interactive Issue Management**

- Review each identified issue with original and recommended text
- Edit recommended changes before applying
- Apply changes individually to create tracked modifications
- Download edited documents with applied changes

### 📥 **Document Download**

- Generate edited DOCX files with tracked changes
- Color-coded modifications (red for deletions, green for additions)
- Comments explaining each change
- Secure temporary file handling

## Technical Architecture

### Frontend

- **Next.js 15** with React 19
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** components for accessibility
- **Sonner** for toast notifications

### Backend

- **Next.js API Routes** for server-side logic
- **OpenAI API** for legal analysis
- **Vercel Blob** for file storage
- **Mammoth.js** for DOCX text extraction
- **Docx.js** for document creation

### Database

- **PostgreSQL** with Drizzle ORM
- **Vercel Postgres** for production
- User authentication and session management

## API Endpoints

### File Upload

```
POST /api/files/upload
```

Uploads DOCX files to Vercel Blob storage.

### Document Analysis

```
POST /api/chat
```

Analyzes uploaded documents using OpenAI's legal analysis tool.

### Document Editing

```
POST /api/document/edit
```

Applies selected changes to documents and generates edited versions.

### Document Download

```
GET /api/download/edited-document
```

Downloads edited documents with applied changes.

## Usage Guide

### 1. Upload Document

1. Navigate to the Legal Analysis Editor
2. Click "Upload Document" and select a .docx file
3. Wait for the file to upload to Vercel Blob storage

### 2. Analyze Document

1. Click "Analyze Document" to start the AI analysis
2. The system will extract text and send it to OpenAI
3. Review the analysis results showing identified issues

### 3. Review Issues

1. Each issue shows:
   - **Original Text**: The problematic language
   - **Recommended Text**: Suggested improvements
   - **Comment**: Explanation of the legal issue
2. Edit the recommended text if needed
3. Modify comments to add context

### 4. Apply Changes

1. Click "Apply Changes" on individual issues
2. The system creates a new DOCX with tracked modifications
3. Changes are color-coded (red for deletions, green for additions)

### 5. Download Edited Document

1. Navigate to the "Download" tab
2. Click "Download Edited Document"
3. The file will be saved with a timestamp

## Legal Analysis Output Format

The AI returns structured JSON with the following format:

```json
{
  "document": "Document Name",
  "issues": [
    {
      "id": "issue-1",
      "type": "ambiguous_language",
      "original_text": "The party shall pay the amount.",
      "recommended_text": "The party shall pay the amount of $X within 30 days.",
      "comment": "Original text is ambiguous as it doesn't specify amount or terms."
    }
  ],
  "metadata": {
    "fileName": "contract.docx",
    "fileType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "charactersAnalyzed": 1500,
    "analysisTimestamp": "2024-01-01T00:00:00.000Z",
    "analysisType": "legal",
    "issuesFound": 3
  }
}
```

## Issue Types

### Ambiguous Language

- Vague or unclear contractual terms
- Missing specific amounts, dates, or conditions
- Unclear party obligations

### Enforceability Issues

- Clauses that may not be legally enforceable
- Overly broad non-compete agreements
- Unreasonable restrictions

### Regulatory Compliance

- Missing required legal provisions
- Non-compliance with industry regulations
- Missing statutory requirements

### Missing Clauses

- Important legal provisions that are absent
- Standard clauses that should be included
- Risk mitigation provisions

### Liability Issues

- Potential liability exposure
- Inadequate indemnification
- Missing limitation of liability

### Legal Terminology

- Inaccurate legal terms
- Inconsistent terminology
- Outdated legal language

## Security & Privacy

### File Handling

- Files are stored securely in Vercel Blob
- Temporary files are automatically cleaned up
- No files are permanently stored on the server

### Authentication

- User authentication required for all operations
- Session-based security
- API endpoints protected with auth middleware

### Data Privacy

- Document content is sent to OpenAI for analysis
- No document content is stored in the database
- Analysis results are temporary and not persisted

## Production Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Configure environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `POSTGRES_URL`: Your Vercel Postgres connection string
   - `BLOB_READ_WRITE_TOKEN`: Your Vercel Blob token
3. Deploy the application

### Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key
POSTGRES_URL=your_postgres_connection_string
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.vercel.app
```

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm package manager
- PostgreSQL database
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd vespera-ai-chatbot

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
pnpm run db:migrate

# Start development server
pnpm run dev
```

### Development Commands

```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Run linting
pnpm run lint

# Run tests
pnpm run test

# Database operations
pnpm run db:generate  # Generate migrations
pnpm run db:migrate   # Run migrations
pnpm run db:studio    # Open Drizzle Studio
```

## Troubleshooting

### Common Issues

1. **File Upload Fails**

   - Check Vercel Blob configuration
   - Verify file size limits (25MB max)
   - Ensure file is in DOCX format

2. **Analysis Fails**

   - Verify OpenAI API key is valid
   - Check API rate limits
   - Ensure document contains extractable text

3. **Download Issues**
   - Check temporary file permissions
   - Verify download URL generation
   - Ensure file cleanup is working

### Error Handling

- All API endpoints include comprehensive error handling
- User-friendly error messages are displayed
- Console logging for debugging
- Graceful fallbacks for failed operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation
- Review the troubleshooting section

---

**Note**: This application is designed for legal document analysis and should be used in conjunction with proper legal review. The AI analysis is a tool to assist legal professionals and should not replace qualified legal advice.
