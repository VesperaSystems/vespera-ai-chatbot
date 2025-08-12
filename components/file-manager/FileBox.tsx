'use client';

import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FileIcon,
  FolderIcon,
  ImageIcon,
  VideoIcon,
  FileTextIcon,
  DownloadIcon,
  ShareIcon,
  TrashIcon,
} from '@/components/icons';
import { useFileManagerContext, type File } from './FileManagerProvider';
import { cn } from '@/lib/utils';

interface FileBoxProps {
  file: File;
}

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
      return <FileTextIcon className="size-8 text-red-500" />;
    case 'doc':
    case 'docx':
      return <FileTextIcon className="size-8 text-blue-600" />;
    case 'xls':
    case 'xlsx':
      return <FileTextIcon className="size-8 text-green-600" />;
    case 'ppt':
    case 'pptx':
      return <FileTextIcon className="size-8 text-orange-600" />;
    case 'txt':
      return <FileTextIcon className="size-8 text-gray-500" />;
    case 'zip':
    case 'rar':
    case '7z':
      return <FileIcon className="size-8 text-yellow-500" />;
    default:
      return <FileIcon className="size-8 text-gray-500" />;
  }
};

const getFileTypeColor = (type: string) => {
  switch (type) {
    case 'folder':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'image':
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'video':
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'pdf':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'doc':
    case 'docx':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'xls':
    case 'xlsx':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'ppt':
    case 'pptx':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'txt':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'zip':
    case 'rar':
    case '7z':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const FileBox = ({ file }: FileBoxProps) => {
  const {
    checkedFileIds,
    setCheckedFileIds,
    selectedFile,
    setSelectedFile,
    downloadFile,
    deleteFile,
    shareFile,
  } = useFileManagerContext();

  const [isPlaying, setIsPlaying] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isChecked = checkedFileIds.includes(file.id);
  const isSelected = selectedFile?.id === file.id;

  const handleSingleClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('.file-actions')) return;

    clickTimeoutRef.current && clearTimeout(clickTimeoutRef.current);

    clickTimeoutRef.current = setTimeout(() => {
      setCheckedFileIds(
        isChecked
          ? checkedFileIds.filter((id) => id !== file.id)
          : [...checkedFileIds, file.id],
      );
    }, 200);
  };

  const handleDoubleClick = () => {
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    if (file.type === 'folder') {
      // Navigate to folder
      console.log('Navigate to folder:', file.name);
    } else {
      // Open file preview
      setSelectedFile(file);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadFile(file.id);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteFile(file.id);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const handleShare = async () => {
    const email = prompt('Enter email address to share with:');
    if (email) {
      try {
        await shareFile(file.id, email);
      } catch (error) {
        console.error('Failed to share file:', error);
      }
    }
  };

  return (
    <Card
      className={cn(
        'relative cursor-pointer transition-all duration-200 hover:shadow-md group',
        isSelected && 'ring-2 ring-primary',
        isChecked && 'bg-primary/5',
      )}
      onClick={handleSingleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent className="p-4">
        {/* Checkbox */}
        <div className="absolute top-2 left-2 z-10">
          <Checkbox
            checked={isChecked}
            onChange={() => {
              setCheckedFileIds(
                isChecked
                  ? checkedFileIds.filter((id) => id !== file.id)
                  : [...checkedFileIds, file.id],
              );
            }}
            className="file-checkbox"
          />
        </div>

        {/* File Preview */}
        <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-muted flex items-center justify-center">
          {file.type === 'image' && file.img && (
            <img
              src={file.img}
              alt={file.name}
              className="size-full object-cover"
            />
          )}

          {file.type === 'video' && file.video && (
            <div className="relative size-full">
              <video
                ref={videoRef}
                src={file.video}
                className="size-full object-cover"
                muted
                onMouseEnter={() => setIsPlaying(true)}
                onMouseLeave={() => setIsPlaying(false)}
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-80"
                onClick={handlePlayPause}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </Button>
            </div>
          )}

          {!file.img && !file.video && (
            <div className="flex items-center justify-center">
              {getFileIcon(file)}
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="space-y-1">
          <h4 className="font-medium text-sm truncate" title={file.name}>
            {file.name}
          </h4>
          <div className="flex items-center justify-between">
            <Badge
              variant="outline"
              className={cn('text-xs', getFileTypeColor(file.type))}
            >
              {file.type.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {file.size || file.itemCount}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Modified {file.modified}
          </p>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="absolute top-2 right-2 flex gap-1 file-actions">
            <Button
              size="sm"
              variant="secondary"
              className="size-8 p-0 opacity-80 hover:opacity-100"
              onClick={handleDownload}
              title="Download"
            >
              <DownloadIcon className="size-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="size-8 p-0 opacity-80 hover:opacity-100"
              onClick={handleShare}
              title="Share"
            >
              <ShareIcon className="size-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="size-8 p-0 opacity-80 hover:opacity-100"
              onClick={handleDelete}
              title="Delete"
            >
              <TrashIcon className="size-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
