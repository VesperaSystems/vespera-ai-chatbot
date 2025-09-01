# File Manager Implementation

This document describes the file manager implementation that has been integrated into the Vespera legal analysis platform.

## Overview

The file manager provides a comprehensive file management system for legal team members, allowing them to:

- Upload and organize documents
- View files in grid and list layouts
- Search and filter files
- Share files with team members
- Download files
- Navigate through folder structures
- Preview file details

## Features

### Core Functionality

- **File Upload**: Drag and drop or click to upload multiple files
- **File Organization**: Hierarchical folder structure with tree view navigation
- **File Preview**: Thumbnail previews for images, videos, and documents
- **File Actions**: Download, share, and delete files
- **Bulk Operations**: Select multiple files for bulk download or deletion
- **Search**: Real-time search through file names and types
- **Grid/List Views**: Toggle between grid and list view modes

### UI Components

- **FileManagerProvider**: Context provider for state management
- **FileManager**: Main file manager interface
- **FileBox**: Individual file display component
- **TreeView**: Folder navigation sidebar
- **File Details Panel**: Sidebar showing file information and actions

### Database Schema

The file manager uses a `Files` table with the following structure:

- `id`: Primary key
- `name`: File name
- `type`: File type (image, video, document, etc.)
- `size`: File size
- `blobUrl`: URL to the stored file
- `folder`: Folder path
- `thumbnailUrl`: Thumbnail image URL
- `videoUrl`: Video file URL
- `pdfUrl`: PDF file URL
- `itemCount`: Number of items (for folders)
- `userId`: Owner user ID
- `tenantId`: Tenant ID for multi-tenancy
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## API Endpoints

### Files API

- `GET /api/files` - List files with optional filtering
- `POST /api/files` - Upload new files
- `GET /api/files/[id]` - Get file details
- `PUT /api/files/[id]` - Update file metadata
- `DELETE /api/files/[id]` - Delete file
- `GET /api/files/[id]/download` - Download file
- `POST /api/files/[id]/share` - Share file with email

## Integration

The file manager is integrated into the legal analysis editor page as a tab-based interface:

- **File Manager Tab**: Main file management interface
- **Legal Analysis Tab**: Document analysis and editing functionality

## Usage

### For Legal Team Members

1. Navigate to the Legal Analysis Editor page
2. Use the "File Manager" tab to manage documents
3. Upload legal documents for analysis
4. Organize files into appropriate folders
5. Share files with team members as needed
6. Switch to the "Legal Analysis" tab to analyze uploaded documents

### File Types Supported

- Images: JPG, PNG, GIF, WebP
- Videos: MP4, AVI, MOV, WMV
- Documents: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT
- Archives: ZIP, RAR, 7Z
- Other file types

## Security Features

- User-based file access control
- Tenant isolation for multi-tenant deployments
- Secure file upload and storage
- File sharing with email validation

## Future Enhancements

- File versioning
- Advanced search filters
- File collaboration features
- Integration with external storage providers
- File encryption
- Audit logging

## Technical Implementation

### Frontend

- React components with TypeScript
- Tailwind CSS for styling
- Context API for state management
- Responsive design for mobile and desktop

### Backend

- Next.js API routes
- Drizzle ORM for database operations
- Supabase for authentication and storage
- File upload handling with proper validation

### Database

- PostgreSQL with Drizzle ORM
- Proper foreign key relationships
- Indexed queries for performance
- Multi-tenant support

