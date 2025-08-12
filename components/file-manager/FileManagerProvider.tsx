'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';

export interface FileDetails {
  key: string;
  value: string;
  modifiedBy?: string;
}

export interface Assignee {
  name: string;
  avatar: string;
}

export interface Activity {
  time: string;
  icon: string;
  iconColor: string;
  title: string;
  tasker: string;
  assignees?: { name: string; avatar: string }[];
  more?: string;
}

export interface File {
  id: number;
  name: string;
  type: string;
  size?: string;
  img?: string;
  video?: string;
  thumb?: string;
  pdf?: string;
  itemCount?: string;
  modified: string;
  details: FileDetails[];
  admin: { name: string; avatar: string };
  assignees: Assignee[];
  fileLink: string;
  activities: Activity[];
  more?: string;
  blobUrl?: string;
  userId?: string;
  tenantId?: string;
}

interface FileManagerContextInterface {
  fileCollection: File[];
  setFileCollection: (files: File[]) => void;
  showFileDetails: boolean;
  setShowFileDetails: (show: boolean) => void;
  checkedFileIds: number[];
  setCheckedFileIds: (ids: number[]) => void;
  isGridView: boolean;
  setIsGridView: (isGrid: boolean) => void;
  isGrouped: boolean;
  setIsGrouped: (isGrouped: boolean) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  currentFolder: string;
  setCurrentFolder: (folder: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredFiles: File[];
  uploadFile: (file: File, blob: Blob) => Promise<void>;
  deleteFile: (fileId: number) => Promise<void>;
  shareFile: (fileId: number, email: string) => Promise<void>;
  downloadFile: (fileId: number) => Promise<void>;
}

const FileManagerContext = createContext<
  FileManagerContextInterface | undefined
>(undefined);

export const useFileManagerContext = () => {
  const context = useContext(FileManagerContext);
  if (!context) {
    throw new Error(
      'useFileManagerContext must be used within a FileManagerProvider',
    );
  }
  return context;
};

interface FileManagerProviderProps {
  children: ReactNode;
}

export const FileManagerProvider = ({ children }: FileManagerProviderProps) => {
  const [fileCollection, setFileCollection] = useState<File[]>([]);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [checkedFileIds, setCheckedFileIds] = useState<number[]>([]);
  const [isGridView, setIsGridView] = useState(true);
  const [isGrouped, setIsGrouped] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFolder, setCurrentFolder] = useState('/');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter files based on search query and current folder
  const filteredFiles = fileCollection.filter((file) => {
    const matchesSearch =
      searchQuery === '' ||
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFolder = file.fileLink.startsWith(currentFolder);

    return matchesSearch && matchesFolder;
  });

  // Load files from API on mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/files');
      if (response.ok) {
        const files = await response.json();
        setFileCollection(files);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const uploadFile = async (file: File, blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', blob, file.name);
      formData.append('metadata', JSON.stringify(file));

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const uploadedFile = await response.json();
        setFileCollection((prev) => [...prev, uploadedFile]);
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  };

  const deleteFile = async (fileId: number) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFileCollection((prev) => prev.filter((file) => file.id !== fileId));
        setCheckedFileIds((prev) => prev.filter((id) => id !== fileId));
      } else {
        throw new Error('Failed to delete file');
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  };

  const shareFile = async (fileId: number, email: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to share file');
      }
    } catch (error) {
      console.error('Failed to share file:', error);
      throw error;
    }
  };

  const downloadFile = async (fileId: number) => {
    try {
      const response = await fetch(`/api/files/${fileId}/download`);

      if (response.ok) {
        const blob = await response.blob();
        const file = fileCollection.find((f) => f.id === fileId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file?.name || 'download';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download file');
      }
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  };

  const value: FileManagerContextInterface = {
    fileCollection,
    setFileCollection,
    showFileDetails,
    setShowFileDetails,
    checkedFileIds,
    setCheckedFileIds,
    isGridView,
    setIsGridView,
    isGrouped,
    setIsGrouped,
    selectedFile,
    setSelectedFile,
    currentFolder,
    setCurrentFolder,
    searchQuery,
    setSearchQuery,
    filteredFiles,
    uploadFile,
    deleteFile,
    shareFile,
    downloadFile,
  };

  return (
    <FileManagerContext.Provider value={value}>
      {children}
    </FileManagerContext.Provider>
  );
};
