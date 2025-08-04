import type { Attachment } from 'ai';
import { useState } from 'react';
import Image from 'next/image';
import {
  FileText,
  FileImage,
  FileCode,
  FileSpreadsheet,
  File,
} from 'lucide-react';

import { LoaderIcon } from './icons';

// Function to get the appropriate icon based on file type
const getFileIcon = (contentType: string, fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  // Document types
  if (
    contentType.includes('word') ||
    contentType.includes('document') ||
    extension === 'docx' ||
    extension === 'doc'
  ) {
    return <FileText className="w-8 h-8 text-blue-600" />;
  }

  // PDF files
  if (contentType.includes('pdf') || extension === 'pdf') {
    return <FileText className="w-8 h-8 text-red-600" />;
  }

  // Text files
  if (
    contentType.includes('text') ||
    extension === 'txt' ||
    extension === 'md'
  ) {
    return <FileText className="w-8 h-8 text-gray-600" />;
  }

  // Code files
  if (
    extension === 'js' ||
    extension === 'ts' ||
    extension === 'jsx' ||
    extension === 'tsx' ||
    extension === 'py' ||
    extension === 'java' ||
    extension === 'cpp' ||
    extension === 'c' ||
    extension === 'html' ||
    extension === 'css' ||
    extension === 'json' ||
    extension === 'xml' ||
    extension === 'php' ||
    extension === 'rb' ||
    extension === 'go' ||
    extension === 'rs' ||
    extension === 'swift' ||
    extension === 'kt'
  ) {
    return <FileCode className="w-8 h-8 text-green-600" />;
  }

  // Spreadsheet files
  if (
    contentType.includes('spreadsheet') ||
    extension === 'xlsx' ||
    extension === 'xls' ||
    extension === 'csv'
  ) {
    return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
  }

  // Image files (fallback)
  if (contentType.startsWith('image')) {
    return <FileImage className="w-8 h-8 text-purple-600" />;
  }

  // Default file icon
  return <File className="w-8 h-8 text-gray-600" />;
};

// Function to get file type label
const getFileTypeLabel = (contentType: string, fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (
    contentType.includes('word') ||
    contentType.includes('document') ||
    extension === 'docx' ||
    extension === 'doc'
  ) {
    return 'Word';
  }

  if (contentType.includes('pdf') || extension === 'pdf') {
    return 'PDF';
  }

  if (
    contentType.includes('text') ||
    extension === 'txt' ||
    extension === 'md'
  ) {
    return 'Text';
  }

  if (
    extension === 'js' ||
    extension === 'ts' ||
    extension === 'jsx' ||
    extension === 'tsx' ||
    extension === 'py' ||
    extension === 'java' ||
    extension === 'cpp' ||
    extension === 'c' ||
    extension === 'html' ||
    extension === 'css' ||
    extension === 'json' ||
    extension === 'xml' ||
    extension === 'php' ||
    extension === 'rb' ||
    extension === 'go' ||
    extension === 'rs' ||
    extension === 'swift' ||
    extension === 'kt'
  ) {
    return 'Code';
  }

  if (
    contentType.includes('spreadsheet') ||
    extension === 'xlsx' ||
    extension === 'xls' ||
    extension === 'csv'
  ) {
    return 'Sheet';
  }

  if (contentType.startsWith('image')) {
    return 'Image';
  }

  return 'File';
};

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) => {
  const { name, url, contentType } = attachment;
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleImageClick = () => {
    if (contentType?.startsWith('image')) {
      setIsImageModalOpen(true);
    }
  };

  const handleImageDoubleClick = () => {
    if (contentType?.startsWith('image')) {
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <div
        data-testid="input-attachment-preview"
        className="flex flex-col gap-2"
      >
        <div className="w-32 h-24 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center">
          {contentType ? (
            contentType.startsWith('image') ? (
              <Image
                key={url}
                src={url}
                alt={name ?? 'An image attachment'}
                fill
                className="rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleImageClick}
                onDoubleClick={handleImageDoubleClick}
                unoptimized
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-1">
                {getFileIcon(contentType, name || '')}
                <div className="text-xs text-muted-foreground mt-1 text-center leading-tight max-w-full overflow-hidden">
                  {getFileTypeLabel(contentType, name || '')}
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-1">
              <File className="w-8 h-8 text-gray-600" />
              <div className="text-xs text-muted-foreground mt-1 leading-tight">
                Document
              </div>
            </div>
          )}

          {isUploading && (
            <div
              data-testid="input-attachment-loader"
              className="animate-spin absolute text-zinc-500"
            >
              <LoaderIcon />
            </div>
          )}
        </div>
        <div className="text-xs text-zinc-500 max-w-32 truncate">{name}</div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && contentType?.startsWith('image') && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="relative max-w-full max-h-full">
            <Image
              src={url}
              alt={name ?? 'Full size image'}
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              unoptimized
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full size-8 flex items-center justify-center hover:bg-black/70 transition-colors"
              onClick={() => setIsImageModalOpen(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};
