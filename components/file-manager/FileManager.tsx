'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  GridIcon,
  ListIcon,
  UploadIcon,
  SearchIcon,
  FolderIcon,
  FileIcon,
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  DownloadIcon,
  ShareIcon,
  TrashIcon,
} from '@/components/icons';
import { FileBox } from './FileBox';
import { TreeView, defaultTreeViewItems } from './TreeView';
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
    uploadFile,
    deleteFile,
    shareFile,
    downloadFile,
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
          id: Date.now() + i,
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

  const handleBulkDownload = async () => {
    for (const fileId of checkedFileIds) {
      await downloadFile(fileId);
    }
  };

  const getFileTypeStats = () => {
    const stats = {
      folders: 0,
      images: 0,
      videos: 0,
      documents: 0,
      others: 0,
    };

    filteredFiles.forEach((file) => {
      if (file.type === 'folder') stats.folders++;
      else if (
        ['image', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(file.type)
      )
        stats.images++;
      else if (['video', 'mp4', 'avi', 'mov', 'wmv'].includes(file.type))
        stats.videos++;
      else if (
        ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(
          file.type,
        )
      )
        stats.documents++;
      else stats.others++;
    });

    return stats;
  };

  const stats = getFileTypeStats();

  return (
    <div className={cn('flex h-full', className)}>
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 border-r bg-muted/30 p-4 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">File Manager</h3>
            <TreeView items={defaultTreeViewItems} />
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium text-sm">Storage</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Folders</span>
                <Badge variant="secondary">{stats.folders}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Images</span>
                <Badge variant="secondary">{stats.images}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Videos</span>
                <Badge variant="secondary">{stats.videos}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Documents</span>
                <Badge variant="secondary">{stats.documents}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Others</span>
                <Badge variant="secondary">{stats.others}</Badge>
              </div>
            </div>
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
                <FolderIcon className="size-4" />
              </Button>
              <h2 className="text-lg font-semibold">My Files</h2>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsGridView(!isGridView)}
              >
                {isGridView ? (
                  <ListIcon className="size-4" />
                ) : (
                  <GridIcon className="size-4" />
                )}
              </Button>

              <div className="relative">
                <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>

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
                      <UploadIcon className="size-4" />
                    )}
                    <span className="ml-2">Upload</span>
                  </Button>
                </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {checkedFileIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {checkedFileIds.length} file(s) selected
              </span>
              <Button variant="outline" size="sm" onClick={handleBulkDownload}>
                <DownloadIcon className="size-4 mr-1" />
                Download
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                <TrashIcon className="size-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* File Grid/List */}
        <div className="flex-1 p-4">
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <FileIcon className="size-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No files found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Upload your first file to get started'}
              </p>
              {!searchQuery && (
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
                        <UploadIcon className="size-4" />
                      )}
                      <span className="ml-2">Upload Files</span>
                    </Button>
                  </div>
              )}
            </div>
          ) : (
            <div
              className={cn(
                'grid gap-4',
                isGridView
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                  : 'grid-cols-1',
              )}
            >
              {filteredFiles.map((file) => (
                <FileBox key={file.id} file={file} />
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
                <img
                  src={selectedFile.img}
                  alt={selectedFile.name}
                  className="size-full object-cover rounded-lg"
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
                <DownloadIcon className="size-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const email = prompt('Enter email address to share with:');
                  if (email) shareFile(selectedFile.id, email);
                }}
              >
                <ShareIcon className="size-4 mr-2" />
                Share
              </Button>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => deleteFile(selectedFile.id)}
              >
                <TrashIcon className="size-4 mr-2" />
                Delete
              </Button>
            </div>

            {/* Details */}
            <div className="space-y-2">
              <h5 className="font-medium text-sm">Details</h5>
              <div className="space-y-1 text-sm">
                {selectedFile.details.map((detail) => (
                  <div
                    key={`${detail.key}-${detail.value}`}
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
      return <FolderIcon className="size-8 text-blue-500" />;
    case 'image':
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return <ImageIcon className="size-8 text-green-500" />;
    case 'video':
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return <VideoIcon className="size-8 text-purple-500" />;
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'xls':
    case 'xlsx':
    case 'ppt':
    case 'pptx':
    case 'txt':
      return <FileTextIcon className="size-8 text-blue-600" />;
    default:
      return <FileIcon className="size-8 text-gray-500" />;
  }
};
