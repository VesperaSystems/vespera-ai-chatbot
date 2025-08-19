'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  GridIcon,
  ListIcon,
  UploadIcon,
  FolderIcon,
  FileIcon,
  DownloadIcon,
  ShareIcon,
  TrashIcon,
  RotateCcwIcon,
  Trash2Icon,
  HistoryIcon,
} from '@/components/icons';
import { FileBox } from './FileBox';
import { TreeView, defaultTreeViewItems } from './TreeView';
import { ShareFileDialog } from './ShareFileDialog';
import { useFileManagerContext, type File } from './FileManagerProvider';
import { cn } from '@/lib/utils';

interface FileManagerProps {
  className?: string;
}

export const FileManager = ({ className }: FileManagerProps) => {
  const {
    filteredFiles,
    isGridView,
    setIsGridView,
    searchQuery,
    setSearchQuery,
    selectedFile,
    setSelectedFile,
    checkedFileIds,
    currentFolder,
    uploadFile,
    deleteFile,
    shareFile,
    downloadFile,
    restoreFile,
    permanentlyDeleteFile,
  } = useFileManagerContext();

  const [showSidebar, setShowSidebar] = useState(true);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileData: File = {
          id: Date.now() + Math.random() * 1000 + i, // More unique ID generation
          name: file.name,
          type: file.type.split('/')[1] || 'file',
          size: formatFileSize(file.size),
          modified: new Date().toLocaleDateString(),
          details: [
            { key: 'File type', value: file.type },
            { key: 'File size', value: formatFileSize(file.size) },
            { key: 'Created date', value: new Date().toLocaleDateString() },
          ],
          admin: { name: 'Current User', avatar: '' },
          assignees: [],
          fileLink: `/files/${file.name}`,
          activities: [],
          blobUrl: URL.createObjectURL(file),
        };

        await uploadFile(fileData, file);
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleBulkDelete = async () => {
    if (checkedFileIds.length === 0) return;

    if (
      confirm(
        `Are you sure you want to delete ${checkedFileIds.length} file(s)?`,
      )
    ) {
      for (const fileId of checkedFileIds) {
        await deleteFile(fileId);
      }
    }
  };

  const handleBulkRestore = async () => {
    if (checkedFileIds.length === 0) return;

    if (
      confirm(
        `Are you sure you want to restore ${checkedFileIds.length} file(s)?`,
      )
    ) {
      for (const fileId of checkedFileIds) {
        await restoreFile(fileId);
      }
    }
  };

  const handleBulkPermanentlyDelete = async () => {
    if (checkedFileIds.length === 0) return;

    if (
      confirm(
        `Are you sure you want to permanently delete ${checkedFileIds.length} file(s)? This action cannot be undone.`,
      )
    ) {
      for (const fileId of checkedFileIds) {
        await permanentlyDeleteFile(fileId);
      }
    }
  };

  const handleBulkDownload = async () => {
    for (const fileId of checkedFileIds) {
      await downloadFile(fileId);
    }
  };

  return (
    <div className={cn('flex h-full', className)}>
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 border-r bg-muted/30 p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">File Manager</h3>
            <TreeView items={defaultTreeViewItems} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                <FolderIcon />
              </Button>
              <h2 className="text-lg font-semibold">My Files</h2>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsGridView(!isGridView)}
              >
                {isGridView ? <ListIcon /> : <GridIcon />}
                <span className="ml-2">
                  {isGridView ? 'List' : 'Thumbnails'}
                </span>
              </Button>

              <div className="relative">
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>

              {/* Hide upload button in trash folder */}
              {currentFolder !== '/trash' && (
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 size-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <Button disabled={uploading}>
                    {uploading ? (
                      <div className="animate-spin rounded-full size-4 border-b-2 border-white" />
                    ) : (
                      <UploadIcon />
                    )}
                    <span className="ml-2">Upload</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Bulk Actions */}
          {checkedFileIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {checkedFileIds.length} file(s) selected
              </span>
              <Button variant="outline" size="sm" onClick={handleBulkDownload}>
                <DownloadIcon size={16} />
                Download
              </Button>

              {/* Show different actions based on current folder */}
              {currentFolder === '/trash' ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkRestore}
                  >
                    <RotateCcwIcon size={16} />
                    Restore
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBulkPermanentlyDelete}
                  >
                    <Trash2Icon size={16} />
                    Permanently Delete
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  <TrashIcon size={16} />
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>

        {/* File Grid/List */}
        <div className="flex-1 p-4">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileIcon size={64} />
              <h3 className="text-lg font-semibold mb-2">
                {currentFolder === '/trash'
                  ? 'Trash is empty'
                  : 'No files found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {currentFolder === '/trash'
                  ? 'Deleted files will appear here for 30 days before being permanently removed'
                  : searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Upload your first file to get started'}
              </p>
              {!searchQuery && currentFolder !== '/trash' && (
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 size-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  <Button disabled={uploading}>
                    {uploading ? (
                      <div className="animate-spin rounded-full size-4 border-b-2 border-white" />
                    ) : (
                      <UploadIcon size={16} />
                    )}
                    <span className="ml-2">Upload Files</span>
                  </Button>
                </div>
              )}
            </div>
          ) : isGridView ? (
            // Grid View (Thumbnails)
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {filteredFiles.map((file) => (
                <FileBox key={file.id} file={file} />
              ))}
            </div>
          ) : (
            // List View
            <div className="space-y-2">
              {/* List Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                <div className="col-span-5">Name</div>
                <div className="col-span-2">Shared</div>
                <div className="col-span-2">Last Modified</div>
                <div className="col-span-2">File Size</div>
                <div className="col-span-1">Actions</div>
              </div>

              {/* List Items */}
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  role="button"
                  tabIndex={0}
                  className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => setSelectedFile(file)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedFile(file);
                    }
                  }}
                >
                  <div className="col-span-5 flex items-center space-x-3">
                    <div className="flex items-center justify-center size-8 bg-muted rounded">
                      {getFileIcon(file)}
                    </div>
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {file.type.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    {file.sharedBy ? (
                      <span className="text-sm text-muted-foreground">
                        Shared by {file.sharedBy}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-muted-foreground">
                      {file.modified}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-muted-foreground">
                      {file.size}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-end">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="size-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(`/file-history/${file.id}`, '_blank');
                        }}
                        title="View History"
                      >
                        <HistoryIcon size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* File Details Sidebar */}
      {selectedFile && (
        <div className="w-80 border-l bg-muted/30 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">File Details</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
            >
              ×
            </Button>
          </div>

          <div className="space-y-4">
            {/* File Preview */}
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              {selectedFile.type === 'image' && selectedFile.img && (
                <Image
                  src={selectedFile.img}
                  alt={selectedFile.name}
                  fill
                  className="object-cover rounded-lg"
                />
              )}
              {selectedFile.type === 'video' && selectedFile.video && (
                <video
                  src={selectedFile.video}
                  className="size-full object-cover rounded-lg"
                  controls
                />
              )}
              {!selectedFile.img && !selectedFile.video && (
                <div className="text-center">
                  {getFileIcon(selectedFile)}
                  <p className="text-sm text-muted-foreground mt-2">
                    {selectedFile.type}
                  </p>
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="space-y-2">
              <h4 className="font-medium">{selectedFile.name}</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{selectedFile.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span>{selectedFile.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modified:</span>
                  <span>{selectedFile.modified}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => downloadFile(selectedFile.id)}
              >
                <DownloadIcon size={16} />
                Download
              </Button>
              <ShareFileDialog
                fileId={selectedFile.id}
                fileName={selectedFile.name}
                onShare={shareFile}
                trigger={
                  <Button variant="outline" className="w-full">
                    <ShareIcon size={16} />
                    Share
                  </Button>
                }
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  window.open(`/file-history/${selectedFile.id}`, '_blank')
                }
              >
                <HistoryIcon size={16} />
                View History
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => deleteFile(selectedFile.id)}
              >
                <TrashIcon size={16} />
                Delete
              </Button>
            </div>

            {/* Details */}
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Details</h5>
              <div className="space-y-1 text-sm">
                {selectedFile.details.map((detail, index) => (
                  <div
                    key={`${selectedFile.id}-detail-${index}-${detail.key}`}
                    className="flex justify-between"
                  >
                    <span className="text-muted-foreground">{detail.key}:</span>
                    <span>{detail.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getFileIcon = (file: File) => {
  switch (file.type) {
    case 'folder':
      return <FolderIcon size={32} />;
    case 'image':
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return <FileIcon size={32} />;
    case 'video':
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return <FileIcon size={32} />;
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'xls':
    case 'xlsx':
    case 'ppt':
    case 'pptx':
    case 'txt':
      return <FileIcon size={32} />;
    default:
      return <FileIcon size={32} />;
  }
};
