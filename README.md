# Vespera AI Chatbot

A sophisticated AI-powered chatbot built with Next.js 15, featuring advanced chat capabilities, document processing, chart generation, and multimodal interactions.

## 🚀 Features

### Core Functionality

- **AI Chat Interface**: Real-time chat with multiple AI models (xAI Grok, OpenAI, Claude)
- **Document Processing**: Upload and analyze PDFs, images, and text documents
- **Chart Generation**: Create professional financial charts with real-time stock data
- **Code Execution**: Run and edit code with syntax highlighting and error handling
- **Multimodal Input**: Support for text, images, and file uploads
- **Artifact System**: Generate and manage various content types (documents, images, code)

### Technical Features

- **Next.js 15**: App Router with React Server Components
- **TypeScript**: Strict type checking and type safety
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **Authentication**: NextAuth.js with multiple providers
- **File Storage**: Vercel Blob for efficient file handling
- **Real-time Updates**: Streaming responses and live data
- **Responsive Design**: Mobile-first UI with Tailwind CSS

## 🛠️ Tech Stack

### Frontend

- **Next.js 15.3.2**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript 5.8.2**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Smooth animations and transitions

### Backend & AI

- **AI SDK**: Unified API for multiple AI providers
- **xAI Grok**: Primary AI model for chat interactions
- **OpenAI**: Alternative AI provider support
- **Vercel Functions**: Serverless API endpoints
- **Drizzle ORM**: Type-safe database operations
- **PostgreSQL**: Primary database (Vercel Postgres)
- **Redis**: Resumable streams and session management (currently disabled, code ready for future use)

### Development Tools

- **Biome**: Fast linter and formatter
- **ESLint**: Code quality and style enforcement
- **Playwright**: End-to-end testing
- **pnpm**: Fast package manager

## 📦 Dependencies

### Core Dependencies

```json
{
  "@ai-sdk/openai": "^1.3.22",
  "@ai-sdk/react": "^1.2.11",
  "@ai-sdk/xai": "^1.2.15",
  "ai": "4.3.13",
  "next": "15.3.2",
  "react": "19.0.0-rc-45804af1-20241021",
  "drizzle-orm": "^0.34.0",
  "@vercel/postgres": "^0.10.0",
  "@vercel/blob": "^0.24.1",
  "redis": "^5.0.0"
}
```

### Key Features

- **CodeMirror**: Advanced code editing with syntax highlighting
- **Prosemirror**: Rich text editing capabilities
- **React Data Grid**: Tabular data display
- **SWR**: Data fetching and caching
- **Sonner**: Toast notifications
- **Lucide React**: Icon library

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm package manager
- PostgreSQL database
- AI provider API keys

### File Upload & Document Processing

The chatbot supports uploading and processing various file types:

- **Images**: JPEG, PNG, WebP (for vision analysis)
- **Documents**: DOCX, DOC, PDF, TXT (for text extraction and analysis)
- **File Size**: Up to 25MB per file
- **Processing**: AI can analyze, summarize, and answer questions about uploaded documents

**Note**: Document files (DOCX, PDF, TXT) are processed server-side to extract text content before being sent to the AI, as OpenAI's API doesn't support these file types directly in user messages. The system uses:
- **mammoth** for DOCX/DOC files
- **TextDecoder** for TXT files
- **PDF support** - Coming soon (currently shows conversion message)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd vespera-ai-chatbot
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.local
   ```

   Configure your environment variables:

   ```env
   # Database
   POSTGRES_URL=your_postgres_connection_string

   # Redis (for resumable streams - currently disabled)
   # REDIS_URL=your_redis_connection_string

   # AI Providers
   XAI_API_KEY=your_xai_api_key
   OPENAI_API_KEY=your_openai_api_key

   # Authentication
   AUTH_SECRET=your_auth_secret
   NEXTAUTH_URL=http://localhost:3000

   # File Storage
   BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
   ```

4. **Database Setup**

   ```bash
   pnpm run db:generate
   pnpm run db:migrate
   ```

5. **Start Development Server**
   ```bash
   pnpm run dev
   ```

## 🏗️ Development

### Available Scripts

```bash
# Development
pnpm run dev          # Start development server
pnpm run build        # Production build
pnpm run start        # Start production server

# Code Quality
pnpm run lint         # Run ESLint + Biome
pnpm run lint:fix     # Auto-fix linting issues
pnpm run format       # Format code with Biome

# Database
pnpm run db:generate  # Generate migrations
pnpm run db:migrate   # Run migrations
pnpm run db:studio    # Open Drizzle Studio
pnpm run db:push      # Push schema changes

# Testing
pnpm run test         # Run Playwright tests
```

### Code Quality Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **Linting**: ESLint + Biome for consistent code style
- **Formatting**: Automatic formatting on save
- **Testing**: Playwright for E2E testing

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables for Production

```env
# Required
POSTGRES_URL=your_production_postgres_url
# REDIS_URL=your_production_redis_url (currently disabled)
AUTH_SECRET=your_production_auth_secret
NEXTAUTH_URL=https://your-domain.com

# AI Providers (at least one required)
XAI_API_KEY=your_xai_api_key
OPENAI_API_KEY=your_openai_api_key

# File Storage
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Optional
NEXTAUTH_SECRET=your_nextauth_secret
```

## 📊 Database Schema

### Core Tables

- **users**: User accounts and authentication
- **chats**: Chat sessions and metadata
- **messages**: Individual chat messages
- **artifacts**: Generated content (documents, images, code)
- **subscription_types**: User subscription plans
- **user_message_counts**: Usage tracking

### Key Features

- **Type-safe**: Full TypeScript integration with Drizzle
- **Migrations**: Automated schema versioning
- **Relationships**: Proper foreign key constraints
- **Indexing**: Optimized for query performance

## 🔧 Configuration

### AI Model Configuration

The app supports multiple AI providers:

- **xAI Grok**: Default model for chat interactions
- **OpenAI GPT-4**: Alternative for complex reasoning
- **Claude**: Anthropic's model for specific tasks

### Redis Configuration

- **Resumable Streams**: Currently disabled but code is ready for future use
- **Stream Context**: Uses Redis for session persistence and recovery (when enabled)
- **Graceful Fallback**: App continues without resumable streams if Redis is unavailable
- **Local Development**: Redis is disabled locally to avoid connection issues
- **Production**: Uses Vercel KV (Redis-compatible) for resumable streams (when enabled)

#### Re-enabling Redis/Resumable Streams

To re-enable Redis and resumable streams functionality:

1. **Environment Variables**:

   ```env
   # Uncomment and configure Redis URL
   REDIS_URL=your_redis_connection_string
   ```

2. **Code Changes** (`app/(chat)/api/chat/route.ts`):

   ```typescript
   // Uncomment the global stream context
   let globalStreamContext: ResumableStreamContext | null = null;

   // Replace the disabled getStreamContext function with:
   function getStreamContext() {
     if (!globalStreamContext) {
       try {
         globalStreamContext = createResumableStreamContext({
           waitUntil: after,
         });
       } catch (error: any) {
         if (error.message.includes("REDIS_URL")) {
           console.log(
             " > Resumable streams are disabled due to missing REDIS_URL"
           );
         } else {
           console.error(error);
         }
       }
     }
     return globalStreamContext;
   }

   // In POST function, replace the simplified return with:
   const streamContext = getStreamContext();
   if (streamContext) {
     return new Response(
       await streamContext.resumableStream(streamId, () => stream)
     );
   } else {
     return new Response(stream);
   }

   // In GET function, restore the full resumable stream logic
   ```

3. **Database**: The stream table and related queries are already in place and ready to use.

4. **Dependencies**: Redis and resumable-stream packages are already installed.

5. **Testing**: After re-enabling, test with:
   ```bash
   pnpm run build
   pnpm run test
   ```

**📖 For detailed setup instructions, see [REDIS_SETUP.md](REDIS_SETUP.md)**

### File Upload Limits

- **Images**: 10MB max, PNG/JPG/WebP
- **Documents**: 25MB max, PDF/TXT/DOCX/DOC
- **Code Files**: 5MB max, various programming languages

## 🧪 Testing

### Test Structure

```
tests/
├── e2e/           # End-to-end tests
│   ├── chat.test.ts
│   ├── artifacts.test.ts
│   └── session.test.ts
├── pages/         # Page-specific tests
└── routes/        # API route tests
```

### Running Tests

```bash
pnpm run test              # Run all tests
pnpm run test:headed      # Run with browser UI
pnpm run test:debug       # Run with debugging
```

## 📈 Performance

### Optimizations

- **Server Components**: Reduced client-side JavaScript
- **Streaming**: Real-time response streaming
- **Image Optimization**: Next.js Image component
- **Code Splitting**: Automatic route-based splitting
- **Caching**: SWR for data fetching optimization

### Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **Error Tracking**: Automatic error reporting
- **Database Monitoring**: Query performance tracking

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run quality checks: `pnpm run lint && pnpm run test`
5. Submit a pull request

### Code Standards

- Follow TypeScript strict mode
- Use proper error handling
- Write comprehensive tests
- Document new features
- Follow existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Check the [Developer Checklist](DEVELOPER_CHECKLIST.md)
- Review existing issues on GitHub
- Create a new issue with detailed information

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**
