'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
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
  RotateCcwIcon,
  Trash2Icon,
} from '@/components/icons';
import { useFileManagerContext, type File } from './FileManagerProvider';
import { ShareFileDialog } from './ShareFileDialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FileBoxProps {
  file: File;
}

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
      return <ImageIcon size={32} />;
    case 'video':
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return <VideoIcon size={32} />;
    case 'pdf':
      return <FileTextIcon size={32} />;
    case 'doc':
    case 'docx':
      return <FileTextIcon size={32} />;
    case 'xls':
    case 'xlsx':
      return <FileTextIcon size={32} />;
    case 'ppt':
    case 'pptx':
      return <FileTextIcon size={32} />;
    case 'txt':
      return <FileTextIcon size={32} />;
    case 'zip':
    case 'rar':
    case '7z':
      return <FileIcon size={32} />;
    default:
      return <FileIcon size={32} />;
  }
};

const getFileTypeColor = (type: string) => {
  switch (type) {
    case 'folder':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'image':
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'video':
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
    case 'pdf':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    case 'doc':
    case 'docx':
      return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    case 'xls':
    case 'xlsx':
      return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
    case 'ppt':
    case 'pptx':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'txt':
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    case 'zip':
    case 'rar':
    case '7z':
      return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
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
    restoreFile,
    permanentlyDeleteFile,
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
      console.log('Attempting to delete file:', file.id, file.name);
      const result = await deleteFile(file.id);
      console.log('Delete result:', result);

      // Show appropriate message based on the action
      if (result?.action === 'moved_to_trash') {
        toast.success('File moved to trash successfully');
      } else if (result?.action === 'removed_access') {
        toast.success('File access removed successfully');
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete file';
      toast.error(errorMessage);
    }
  };

  const handleRestore = async () => {
    try {
      console.log('Attempting to restore file:', file.id, file.name);
      const result = await restoreFile(file.id);
      console.log('Restore result:', result);

      toast.success('File restored successfully');
    } catch (error) {
      console.error('Failed to restore file:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to restore file';
      toast.error(errorMessage);
    }
  };

  const handlePermanentlyDelete = async () => {
    try {
      console.log('Attempting to permanently delete file:', file.id, file.name);
      const result = await permanentlyDeleteFile(file.id);
      console.log('Permanently delete result:', result);

      toast.success('File permanently deleted');
    } catch (error) {
      console.error('Failed to permanently delete file:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to permanently delete file';
      toast.error(errorMessage);
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
            <Image
              src={file.img}
              alt={file.name}
              fill
              className="object-cover"
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
              <DownloadIcon size={16} />
            </Button>

            {/* Show different actions based on whether file is in trash */}
            {file._isTrash ? (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  className="size-8 p-0 opacity-80 hover:opacity-100"
                  onClick={handleRestore}
                  title="Restore"
                >
                  <RotateCcwIcon size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="size-8 p-0 opacity-80 hover:opacity-100"
                  onClick={handlePermanentlyDelete}
                  title="Permanently Delete"
                >
                  <Trash2Icon size={16} />
                </Button>
              </>
            ) : (
              <>
                <ShareFileDialog
                  fileId={file.id}
                  fileName={file.name}
                  onShare={shareFile}
                  trigger={
                    <Button
                      size="sm"
                      variant="secondary"
                      className="size-8 p-0 opacity-80 hover:opacity-100"
                      title="Share"
                    >
                      <ShareIcon size={16} />
                    </Button>
                  }
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="size-8 p-0 opacity-80 hover:opacity-100"
                  onClick={handleDelete}
                  title="Delete"
                >
                  <TrashIcon size={16} />
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
