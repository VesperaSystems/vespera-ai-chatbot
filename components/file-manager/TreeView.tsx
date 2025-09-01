'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  FolderIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@/components/icons';
import { useFileManagerContext } from './FileManagerProvider';
import { cn } from '@/lib/utils';

export interface TreeViewItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  path: string;
  children?: TreeViewItem[];
  badge?: string;
  dot?: string;
}

interface TreeViewProps {
  items: TreeViewItem[];
  className?: string;
}

interface TreeViewItemProps {
  item: TreeViewItem;
  level?: number;
}

const TreeViewItemComponent = ({ item, level = 0 }: TreeViewItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { currentFolder, setCurrentFolder, fileCollection } =
    useFileManagerContext();

  const hasChildren = item.children && item.children.length > 0;
  const isActive = currentFolder === item.path;

  // Calculate file count for this folder
  const fileCount = useMemo(() => {
    if (item.type !== 'folder') return 0;

    const count = fileCollection.filter((file) => {
      if (item.path === '/') {
        // For root "My Files" folder, count files directly in root
        return file.folderPath === '/';
      }
      if (item.path === '/recent') {
        // For recent folder, count files that are marked as recent
        return file._isRecent;
      }
      if (item.path === '/shared') {
        // For shared folder, count files that are marked as shared
        return file._isShared;
      }
      // For other folders, count files that are directly in this folder
      return file.folderPath === item.path;
    }).length;

    // Debug logging for root folder
    if (item.path === '/') {
      console.log(
        'Root folder file count:',
        count,
        'Total files:',
        fileCollection.length,
      );
    }

    return count;
  }, [fileCollection, item.path, item.type]);

  const handleClick = () => {
    if (item.type === 'folder') {
      if (hasChildren) {
        setIsExpanded(!isExpanded);
      }
      setCurrentFolder(item.path);
    }
  };

  return (
    <div className="treeview-item">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'w-full justify-start h-8 px-2 text-sm font-normal',
          level > 0 && 'ml-4',
          isActive && 'bg-primary/10 text-primary',
          'hover:bg-muted',
        )}
        onClick={handleClick}
      >
        <div className="flex items-center w-full">
          {hasChildren && (
            <div className="mr-1">
              {isExpanded ? (
                <ChevronDownIcon size={12} />
              ) : (
                <ChevronRightIcon size={12} />
              )}
            </div>
          )}
          {!hasChildren && <div className="w-4 mr-1" />}

          <FolderIcon size={16} />

          <span className="truncate flex-1">{item.name}</span>

          {/* Show file count badge */}
          {item.type === 'folder' && fileCount > 0 && (
            <span className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
              {fileCount}
            </span>
          )}

          {item.dot && (
            <span
              className={cn('ml-auto w-2 h-2 rounded-full', `bg-${item.dot}`)}
            />
          )}
        </div>
      </Button>

      {hasChildren && isExpanded && item.children && (
        <div className="treeview-children">
          {item.children.map((child) => (
            <TreeViewItemComponent
              key={child.id}
              item={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const TreeView = ({ items, className }: TreeViewProps) => {
  return (
    <div className={cn('treeview space-y-1', className)}>
      {items.map((item) => (
        <TreeViewItemComponent key={item.id} item={item} />
      ))}
    </div>
  );
};

// Updated tree view data with simplified structure
export const defaultTreeViewItems: TreeViewItem[] = [
  {
    id: '1',
    name: 'My Files',
    type: 'folder',
    path: '/',
  },
  {
    id: '2',
    name: 'Shared with me',
    type: 'folder',
    path: '/shared',
  },
  {
    id: '3',
    name: 'Recent',
    type: 'folder',
    path: '/recent',
  },
  {
    id: '4',
    name: 'Trash',
    type: 'folder',
    path: '/trash',
  },
];
