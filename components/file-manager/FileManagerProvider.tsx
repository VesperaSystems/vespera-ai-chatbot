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
  folderPath?: string; // Add folder path for better organization
}

// Comprehensive file structure data - loaded once on page load
const fileStructureData: File[] = [
  // Root level files
  {
    id: 1,
    name: 'Welcome Document.pdf',
    type: 'pdf',
    size: '2.4 MB',
    modified: '2024-01-15',
    folderPath: '/',
    fileLink: '/files/welcome-document.pdf',
    details: [
      { key: 'File type', value: 'PDF Document' },
      { key: 'File size', value: '2.4 MB' },
      { key: 'Created date', value: '2024-01-15' },
    ],
    admin: { name: 'System Admin', avatar: '' },
    assignees: [],
    activities: [],
  },
  
  // Documents folder
  {
    id: 2,
    name: 'Contract Template.docx',
    type: 'docx',
    size: '1.8 MB',
    modified: '2024-01-14',
    folderPath: '/documents',
    fileLink: '/files/documents/contract-template.docx',
    details: [
      { key: 'File type', value: 'Word Document' },
      { key: 'File size', value: '1.8 MB' },
      { key: 'Created date', value: '2024-01-14' },
    ],
    admin: { name: 'Legal Team', avatar: '' },
    assignees: [],
    activities: [],
  },
  {
    id: 3,
    name: 'Meeting Notes.docx',
    type: 'docx',
    size: '856 KB',
    modified: '2024-01-13',
    folderPath: '/documents',
    fileLink: '/files/documents/meeting-notes.docx',
    details: [
      { key: 'File type', value: 'Word Document' },
      { key: 'File size', value: '856 KB' },
      { key: 'Created date', value: '2024-01-13' },
    ],
    admin: { name: 'Project Manager', avatar: '' },
    assignees: [],
    activities: [],
  },
  
  // Legal subfolder
  {
    id: 4,
    name: 'Employment Agreement.pdf',
    type: 'pdf',
    size: '3.2 MB',
    modified: '2024-01-12',
    folderPath: '/documents/legal',
    fileLink: '/files/documents/legal/employment-agreement.pdf',
    details: [
      { key: 'File type', value: 'PDF Document' },
      { key: 'File size', value: '3.2 MB' },
      { key: 'Created date', value: '2024-01-12' },
    ],
    admin: { name: 'HR Department', avatar: '' },
    assignees: [],
    activities: [],
  },
  {
    id: 5,
    name: 'NDA Template.docx',
    type: 'docx',
    size: '1.1 MB',
    modified: '2024-01-11',
    folderPath: '/documents/legal',
    fileLink: '/files/documents/legal/nda-template.docx',
    details: [
      { key: 'File type', value: 'Word Document' },
      { key: 'File size', value: '1.1 MB' },
      { key: 'Created date', value: '2024-01-11' },
    ],
    admin: { name: 'Legal Team', avatar: '' },
    assignees: [],
    activities: [],
  },
  
  // Contracts subfolder
  {
    id: 6,
    name: 'Vendor Contract.pdf',
    type: 'pdf',
    size: '4.7 MB',
    modified: '2024-01-10',
    folderPath: '/documents/contracts',
    fileLink: '/files/documents/contracts/vendor-contract.pdf',
    details: [
      { key: 'File type', value: 'PDF Document' },
      { key: 'File size', value: '4.7 MB' },
      { key: 'Created date', value: '2024-01-10' },
    ],
    admin: { name: 'Procurement', avatar: '' },
    assignees: [],
    activities: [],
  },
  {
    id: 7,
    name: 'Service Agreement.docx',
    type: 'docx',
    size: '2.1 MB',
    modified: '2024-01-09',
    folderPath: '/documents/contracts',
    fileLink: '/files/documents/contracts/service-agreement.docx',
    details: [
      { key: 'File type', value: 'Word Document' },
      { key: 'File size', value: '2.1 MB' },
      { key: 'Created date', value: '2024-01-09' },
    ],
    admin: { name: 'Legal Team', avatar: '' },
    assignees: [],
    activities: [],
  },
  
  // Images folder
  {
    id: 8,
    name: 'Company Logo.png',
    type: 'png',
    size: '245 KB',
    modified: '2024-01-08',
    folderPath: '/images',
    fileLink: '/files/images/company-logo.png',
    img: '/images/company-logo.png',
    details: [
      { key: 'File type', value: 'PNG Image' },
      { key: 'File size', value: '245 KB' },
      { key: 'Created date', value: '2024-01-08' },
    ],
    admin: { name: 'Marketing Team', avatar: '' },
    assignees: [],
    activities: [],
  },
  {
    id: 9,
    name: 'Product Screenshot.jpg',
    type: 'jpg',
    size: '1.2 MB',
    modified: '2024-01-07',
    folderPath: '/images',
    fileLink: '/files/images/product-screenshot.jpg',
    img: '/images/product-screenshot.jpg',
    details: [
      { key: 'File type', value: 'JPEG Image' },
      { key: 'File size', value: '1.2 MB' },
      { key: 'Created date', value: '2024-01-07' },
    ],
    admin: { name: 'Product Team', avatar: '' },
    assignees: [],
    activities: [],
  },
  
  // Videos folder
  {
    id: 10,
    name: 'Product Demo.mp4',
    type: 'mp4',
    size: '15.7 MB',
    modified: '2024-01-06',
    folderPath: '/videos',
    fileLink: '/files/videos/product-demo.mp4',
    video: '/videos/product-demo.mp4',
    details: [
      { key: 'File type', value: 'MP4 Video' },
      { key: 'File size', value: '15.7 MB' },
      { key: 'Created date', value: '2024-01-06' },
    ],
    admin: { name: 'Product Team', avatar: '' },
    assignees: [],
    activities: [],
  },
  
  // Downloads folder
  {
    id: 11,
    name: 'Software Installer.exe',
    type: 'exe',
    size: '45.2 MB',
    modified: '2024-01-05',
    folderPath: '/downloads',
    fileLink: '/files/downloads/software-installer.exe',
    details: [
      { key: 'File type', value: 'Executable' },
      { key: 'File size', value: '45.2 MB' },
      { key: 'Created date', value: '2024-01-05' },
    ],
    admin: { name: 'IT Department', avatar: '' },
    assignees: [],
    activities: [],
  },
  
  // Shared folder
  {
    id: 12,
    name: 'Shared Document.pdf',
    type: 'pdf',
    size: '1.5 MB',
    modified: '2024-01-04',
    folderPath: '/shared',
    fileLink: '/files/shared/shared-document.pdf',
    details: [
      { key: 'File type', value: 'PDF Document' },
      { key: 'File size', value: '1.5 MB' },
      { key: 'Created date', value: '2024-01-04' },
    ],
    admin: { name: 'External User', avatar: '' },
    assignees: [],
    activities: [],
  },
  
  // Recent folder (same files but for recent view)
  {
    id: 13,
    name: 'Recent Document.docx',
    type: 'docx',
    size: '892 KB',
    modified: '2024-01-03',
    folderPath: '/recent',
    fileLink: '/files/recent/recent-document.docx',
    details: [
      { key: 'File type', value: 'Word Document' },
      { key: 'File size', value: '892 KB' },
      { key: 'Created date', value: '2024-01-03' },
    ],
    admin: { name: 'Current User', avatar: '' },
    assignees: [],
    activities: [],
  },
];

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

    // For root folder, show files directly in root
    if (currentFolder === '/') {
      const matchesFolder = file.folderPath === '/';
      return matchesSearch && matchesFolder;
    }
    
    // For other folders, show files in that folder or its subfolders
    const matchesFolder = file.folderPath?.startsWith(currentFolder);

    return matchesSearch && matchesFolder;
  });

  // Load files from JSON data on mount (no API calls needed)
  useEffect(() => {
    setFileCollection(fileStructureData);
  }, []);

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
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileCollection.find((f) => f.id === fileId)?.name || 'download';
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
