'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  AlertTriangleIcon,
  FileIcon,
  DownloadIcon,
  UploadIcon,
  PlayIcon,
  FolderIcon,
} from '@/components/icons';
import { toast } from '@/components/toast';
import { FileManagerProvider } from '@/components/file-manager/FileManagerProvider';
import { FileManager } from '@/components/file-manager/FileManager';
import { Editor } from '@/components/text-editor';

interface LegalAnalysisIssue {
  id: string;
  type: string;
  original_text: string;
  recommended_text: string;
  comment: string;
  position: {
    start: number;
    end: number;
  };
  status?: 'pending' | 'accepted' | 'rejected';
}

interface LegalAnalysisResult {
  document: string;
  content: string; // Add the actual document content
  issues: LegalAnalysisIssue[];
  metadata?: {
    fileName?: string;
    fileType?: string;
    charactersAnalyzed?: number;
    analysisTimestamp?: string;
    analysisType?: string;
    issuesFound?: number;
  };
}

interface LegalAnalysisData {
  analysisResult: LegalAnalysisResult;
  fileUrl: string;
  fileName: string;
}

export default function LegalAnalysisEditorPage() {
  const [legalData, setLegalData] = useState<LegalAnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [editableIssues, setEditableIssues] = useState<LegalAnalysisIssue[]>(
    [],
  );
  const [showEditor, setShowEditor] = useState(false);
  const [applyingIssues, setApplyingIssues] = useState<Set<string>>(new Set());
  const [appliedIssues, setAppliedIssues] = useState<Set<string>>(new Set());
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'analysis'>('files');
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');

  // Load data from sessionStorage on component mount
  useEffect(() => {
    console.log('🔄 LegalAnalysisEditor: Loading data from sessionStorage');

    try {
      if (typeof window === 'undefined') {
        console.log(
          '📭 LegalAnalysisEditor: Window is not defined (server-side)',
        );
        return;
      }

      const storedData = sessionStorage.getItem('legalAnalysisData');
      if (storedData) {
        console.log('💾 LegalAnalysisEditor: Found stored data:', storedData);

        try {
          const parsedData = JSON.parse(storedData);
          console.log('📋 LegalAnalysisEditor: Parsed data:', parsedData);

          if (
            parsedData.analysisResult &&
            parsedData.fileUrl &&
            parsedData.fileName
          ) {
            setLegalData(parsedData);
            setEditableIssues(
              parsedData.analysisResult.issues.map((issue: any) => ({
                ...issue,
                status: issue.status || 'pending',
              })),
            );
            setFileUrl(parsedData.fileUrl);

            // Create a mock File object for the selectedFile state
            const mockFile = new File([], parsedData.fileName, {
              type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });
            setSelectedFile(mockFile);

            console.log('✅ LegalAnalysisEditor: Data loaded successfully');
            toast({
              type: 'success',
              description: `Analysis loaded. Found ${parsedData.analysisResult.issues.length} issues.`,
            });

            // Switch to analysis tab
            setActiveTab('analysis');

            // Clear the sessionStorage after loading
            try {
              sessionStorage.removeItem('legalAnalysisData');
            } catch (clearError) {
              console.error(
                '❌ LegalAnalysisEditor: Failed to clear sessionStorage:',
                clearError,
              );
            }
          } else {
            console.error(
              '❌ LegalAnalysisEditor: Invalid data structure in sessionStorage',
            );
          }
        } catch (parseError) {
          console.error(
            '❌ LegalAnalysisEditor: Failed to parse stored data:',
            parseError,
          );
        }
      } else {
        console.log('📭 LegalAnalysisEditor: No data found in sessionStorage');
      }
    } catch (error) {
      console.error(
        '❌ LegalAnalysisEditor: Error loading data from sessionStorage:',
        error,
      );
    }
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's a supported file type
    if (!file.name.toLowerCase().endsWith('.docx')) {
      toast({
        type: 'error',
        description: 'Please select a .docx file',
      });
      return;
    }

    setSelectedFile(file);
    setUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'metadata',
        JSON.stringify({
          name: file.name,
          folder: '/legal-analysis',
        }),
      );

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      setFileUrl(result.blob?.url || result.file?.blobUrl);
      toast({
        type: 'success',
        description: 'File uploaded successfully',
      });
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast({
        type: 'error',
        description: 'Failed to upload file. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !fileUrl) {
      toast({
        type: 'error',
        description: 'Please upload a document first',
      });
      return;
    }

    setAnalyzing(true);

    try {
      console.log('🔍 Starting legal analysis for:', selectedFile.name);
      console.log('📄 File URL:', fileUrl);

      // Use the direct analyze API instead of the chat API
      const response = await fetch('/api/document/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl: fileUrl,
          fileName: selectedFile.name,
          fileType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          userMessage: 'Please analyze this document for legal issues',
          analysisType: 'legal',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to analyze document: ${response.status}`);
      }

      const result = await response.json();
      console.log('📋 Analysis result:', result);

      if (result.success && result.analysis) {
        setLegalData({
          analysisResult: result.analysis,
          fileUrl: fileUrl,
          fileName: selectedFile.name,
        });
        setEditableIssues(
          result.analysis.issues.map((issue: any) => ({
            ...issue,
            status: issue.status || 'pending',
          })),
        );
        setActiveTab('analysis');
        toast({
          type: 'success',
          description: `Analysis completed. Found ${result.analysis.issues.length} issues.`,
        });
      } else {
        throw new Error(result.error || 'No analysis data received');
      }
    } catch (error) {
      console.error('Failed to analyze document:', error);
      toast({
        type: 'error',
        description: 'Failed to analyze document. Please try again.',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleApplyIssueChanges = async (issueId: string) => {
    const issue = editableIssues.find((i) => i.id === issueId);
    if (!issue) return;

    setApplyingIssues((prev) => new Set(prev).add(issueId));

    try {
      console.log('🔧 Applying issue:', issue);
      console.log('📄 Original text:', issue.original_text);
      console.log('📄 Recommended text:', issue.recommended_text);

      // Get all issues that should be applied (including this one and any previously applied)
      const issuesToApply = editableIssues.filter(
        (i) => appliedIssues.has(i.id) || i.id === issueId,
      );

      // Apply all changes to the document at once
      const response = await fetch('/api/document/edit-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl: legalData?.fileUrl,
          fileName: legalData?.fileName,
          issues: issuesToApply,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to apply changes: ${response.status}`);
      }

      const result = await response.json();
      console.log('📋 Edit result:', result);

      if (result.downloadUrl) {
        setDownloadUrl(result.downloadUrl);
        setDownloadFileName(result.downloadFileName);
        setAppliedIssues((prev) => new Set(prev).add(issueId));
        toast({
          type: 'success',
          description: `Changes applied to issue ${issueId}!`,
        });
      } else {
        throw new Error('No download URL received');
      }
    } catch (error) {
      console.error('Failed to apply issue changes:', error);
      toast({
        type: 'error',
        description: 'Failed to apply changes to document',
      });
    } finally {
      setApplyingIssues((prev) => {
        const newSet = new Set(prev);
        newSet.delete(issueId);
        return newSet;
      });
    }
  };

  const handleApplyAllChanges = async () => {
    if (!editableIssues.length) {
      toast({
        type: 'error',
        description: 'No issues to apply',
      });
      return;
    }

    setApplyingIssues(new Set(editableIssues.map((i) => i.id)));

    try {
      console.log('🔧 Applying all issues:', editableIssues.length);

      // Apply all changes to the document
      const response = await fetch('/api/document/edit-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl: legalData?.fileUrl,
          fileName: legalData?.fileName,
          issues: editableIssues,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Failed to apply all changes: ${response.status}`);
      }

      const result = await response.json();
      console.log('📋 Edit all result:', result);

      if (result.downloadUrl) {
        setDownloadUrl(result.downloadUrl);
        setDownloadFileName(result.downloadFileName);
        // Mark all issues as applied
        setAppliedIssues(new Set(editableIssues.map((issue) => issue.id)));
        toast({
          type: 'success',
          description: `Applied all ${editableIssues.length} changes!`,
        });
      } else {
        throw new Error('No download URL received');
      }
    } catch (error) {
      console.error('Failed to apply all changes:', error);
      toast({
        type: 'error',
        description: 'Failed to apply all changes to document',
      });
    } finally {
      setApplyingIssues(new Set());
    }
  };

  const handleIssueChange = (
    issueId: string,
    field: keyof LegalAnalysisIssue,
    value: string,
  ) => {
    setEditableIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, [field]: value } : issue,
      ),
    );
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = downloadFileName || 'edited-document.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleContentChange = (newContent: string) => {
    // Update the document content when user makes changes
    console.log('Document content changed:', newContent);
  };

  const getIssueTypeColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'ambiguous_language':
      case 'ambiguity':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200 dark:text-yellow-300 dark:border-yellow-800';
      case 'enforceability':
        return 'bg-red-500/10 text-red-700 border-red-200 dark:text-red-300 dark:border-red-800';
      case 'regulatory_compliance':
      case 'compliance':
        return 'bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-300 dark:border-blue-800';
      case 'liability':
      case 'potential_liability':
        return 'bg-orange-500/10 text-orange-700 border-orange-200 dark:text-orange-300 dark:border-orange-800';
      case 'missing_clause':
      case 'missing_benefits_clause':
        return 'bg-purple-500/10 text-purple-700 border-purple-200 dark:text-purple-300 dark:border-purple-800';
      case 'legal_terminology':
      case 'vague_confidentiality':
        return 'bg-indigo-500/10 text-indigo-700 border-indigo-200 dark:text-indigo-300 dark:border-indigo-800';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200 dark:text-gray-300 dark:border-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Legal Team Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your legal documents and perform legal analysis
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'files' | 'analysis')}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FolderIcon size={16} />
            File Manager
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <FileIcon size={16} />
            Legal Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-4">
          <div className="h-[calc(100vh-200px)]">
            <FileManagerProvider>
              <FileManager />
            </FileManagerProvider>
          </div>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {!legalData ? (
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UploadIcon size={20} />
                  <span className="ml-2">Upload Document for Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Upload document"
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      uploading
                        ? 'border-muted bg-muted/50'
                        : 'border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/25'
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const files = Array.from(e.dataTransfer.files);
                      if (files.length > 0) {
                        const file = files[0];
                        if (file.name.toLowerCase().endsWith('.docx')) {
                          handleFileUpload({
                            target: { files: [file] },
                          } as any);
                        } else {
                          toast({
                            type: 'error',
                            description: 'Please select a .docx file',
                          });
                        }
                      }
                    }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.docx';
                      input.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files && target.files.length > 0) {
                          handleFileUpload({
                            target: { files: target.files },
                          } as any);
                        }
                      };
                      input.click();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.docx';
                        input.onchange = (e) => {
                          const target = e.target as HTMLInputElement;
                          if (target.files && target.files.length > 0) {
                            handleFileUpload({
                              target: { files: target.files },
                            } as any);
                          }
                        };
                        input.click();
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    {uploading ? (
                      <div className="space-y-4">
                        <div className="animate-spin rounded-full size-8 border-b-2 border-primary mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          Uploading file...
                        </p>
                      </div>
                    ) : selectedFile ? (
                      <div className="space-y-4">
                        <div className="mx-auto text-primary">
                          <FileIcon size={48} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {selectedFile.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Click or drop to change file
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="mx-auto text-muted-foreground">
                          <UploadIcon size={48} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            Drop your .docx file here
                          </p>
                          <p className="text-sm text-muted-foreground">
                            or click to browse files
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={!selectedFile || !fileUrl || analyzing}
                  className="w-full"
                >
                  {analyzing ? (
                    <>
                      <div className="animate-spin rounded-full size-4 border-b-2 border-white mr-2" />
                      Analyzing Document...
                    </>
                  ) : (
                    <>
                      <PlayIcon size={16} />
                      <span className="ml-2">Analyze Document</span>
                    </>
                  )}
                </Button>

                {uploading && (
                  <p className="text-sm text-muted-foreground text-center">
                    Uploading file...
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Legal Analysis Results
                  </h2>
                  <p className="text-muted-foreground">
                    Review and edit the legal analysis for: {legalData.fileName}
                  </p>
                </div>
                <div className="flex gap-2">
                  {editableIssues.length > 0 && (
                    <Button
                      onClick={handleApplyAllChanges}
                      disabled={
                        applyingIssues.size > 0 ||
                        appliedIssues.size === editableIssues.length
                      }
                      className={`${
                        applyingIssues.size > 0
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : appliedIssues.size === editableIssues.length
                            ? 'bg-green-100 border-green-300 text-green-800'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {applyingIssues.size > 0 ? (
                        <>
                          <div className="animate-spin rounded-full size-4 border-b-2 border-current mr-2" />
                          Applying...
                        </>
                      ) : appliedIssues.size === editableIssues.length ? (
                        <>
                          <div className="size-4 mr-2">✓</div>
                          <span className="ml-2">All Applied</span>
                        </>
                      ) : (
                        <>
                          <PlayIcon size={16} />
                          <span className="ml-2">Apply All</span>
                        </>
                      )}
                    </Button>
                  )}
                  {downloadUrl && (
                    <Button onClick={handleDownload} variant="outline">
                      <DownloadIcon size={16} />
                      <span className="ml-2">Download Edited Document</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setLegalData(null);
                      setSelectedFile(null);
                      setFileUrl(null);
                      setEditableIssues([]);
                      setAppliedIssues(new Set());
                      setDownloadUrl(null);
                      setDownloadFileName(null);
                    }}
                  >
                    New Analysis
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="issues" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="issues">Issues</TabsTrigger>
                  <TabsTrigger value="editor">Document Editor</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="download">Download</TabsTrigger>
                </TabsList>

                <TabsContent value="issues" className="space-y-4">
                  {/* Analysis metadata */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileIcon size={20} />
                        <span className="ml-2">Analysis Summary</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">File:</span>
                          <p className="text-muted-foreground">
                            {legalData.analysisResult.metadata?.fileName ||
                              legalData.fileName}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Issues Found:</span>
                          <p className="text-muted-foreground">
                            {legalData.analysisResult.issues.length}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">
                            Characters Analyzed:
                          </span>
                          <p className="text-muted-foreground">
                            {legalData.analysisResult.metadata
                              ?.charactersAnalyzed || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Analysis Date:</span>
                          <p className="text-muted-foreground">
                            {legalData.analysisResult.metadata
                              ?.analysisTimestamp
                              ? new Date(
                                  legalData.analysisResult.metadata
                                    .analysisTimestamp,
                                ).toLocaleDateString()
                              : new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Issues list */}
                  <div className="space-y-4">
                    {editableIssues.map((issue, index) => (
                      <Card
                        key={issue.id}
                        className="border-l-4 border-l-primary"
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge className={getIssueTypeColor(issue.type)}>
                                {issue.type}
                              </Badge>
                              <span className="text-sm text-foreground font-medium">
                                Issue #{index + 1}
                              </span>
                              {issue.status && (
                                <Badge
                                  className={
                                    issue.status === 'accepted'
                                      ? 'bg-green-100 text-green-800 border-green-200'
                                      : issue.status === 'rejected'
                                        ? 'bg-red-100 text-red-800 border-red-200'
                                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  }
                                >
                                  {issue.status}
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApplyIssueChanges(issue.id)}
                              disabled={
                                applyingIssues.has(issue.id) ||
                                appliedIssues.has(issue.id)
                              }
                              className={
                                applyingIssues.has(issue.id)
                                  ? 'bg-green-50 border-green-200 text-green-700'
                                  : appliedIssues.has(issue.id)
                                    ? 'bg-green-100 border-green-300 text-green-800'
                                    : ''
                              }
                            >
                              {applyingIssues.has(issue.id) ? (
                                <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                              ) : appliedIssues.has(issue.id) ? (
                                <div className="size-4 mr-2">✓</div>
                              ) : (
                                <PlayIcon size={16} />
                              )}
                              <span className="ml-2">
                                {appliedIssues.has(issue.id)
                                  ? 'Applied'
                                  : 'Apply'}
                              </span>
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2 text-foreground">
                              Original Text:
                            </h4>
                            <div className="bg-muted p-3 rounded-md text-sm text-foreground border">
                              {issue.original_text}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2 text-foreground">
                              Recommended Text:
                            </h4>
                            <Textarea
                              value={issue.recommended_text}
                              onChange={(e) =>
                                handleIssueChange(
                                  issue.id,
                                  'recommended_text',
                                  e.target.value,
                                )
                              }
                              className="w-full bg-background border border-input text-foreground p-3 rounded-md text-sm resize-none focus:ring-2 focus:ring-ring focus:border-ring"
                              rows={4}
                            />
                          </div>

                          <div>
                            <h4 className="font-medium mb-2 text-foreground">
                              Comment:
                            </h4>
                            <Textarea
                              value={issue.comment}
                              onChange={(e) =>
                                handleIssueChange(
                                  issue.id,
                                  'comment',
                                  e.target.value,
                                )
                              }
                              className="w-full bg-background border border-input text-foreground p-3 rounded-md text-sm resize-none focus:ring-2 focus:ring-ring focus:border-ring"
                              rows={4}
                              placeholder="Edit comment..."
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="editor" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileIcon size={20} />
                        <span className="ml-2">
                          Document Editor with Suggested Edits
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[600px]">
                        <Editor
                          content={
                            legalData.analysisResult.content ||
                            legalData.analysisResult.document
                          }
                          onSaveContent={handleContentChange}
                          status="idle"
                          isCurrentVersion={true}
                          currentVersionIndex={0}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="summary" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2 text-foreground">
                            Document: {legalData.analysisResult.document}
                          </h3>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium text-foreground">
                              Total Issues Found:
                            </span>{' '}
                            <span className="text-muted-foreground">
                              {legalData.analysisResult.issues.length}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-foreground">
                              Analysis Type:
                            </span>{' '}
                            <span className="text-muted-foreground">
                              {legalData.analysisResult.metadata
                                ?.analysisType || 'legal'}
                            </span>
                          </p>
                          <p className="text-sm">
                            <span className="font-medium text-foreground">
                              Characters Analyzed:
                            </span>{' '}
                            <span className="text-muted-foreground">
                              {legalData.analysisResult.metadata
                                ?.charactersAnalyzed || 'Unknown'}
                            </span>
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2 text-foreground">
                            Issue Types Found:
                          </h4>
                          <ul className="list-disc list-inside space-y-1">
                            {Array.from(
                              new Set(
                                editableIssues.map((issue) => issue.type),
                              ),
                            ).map((type) => (
                              <li
                                key={type}
                                className="text-sm text-muted-foreground"
                              >
                                {type}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="download" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DownloadIcon size={20} />
                        <span className="ml-2">Download Edited Document</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {downloadUrl ? (
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            Your document has been edited with the selected
                            changes. Click the button below to download the
                            updated version.
                          </p>
                          <Button onClick={handleDownload} className="w-full">
                            <DownloadIcon size={16} />
                            <span className="ml-2">
                              Download{' '}
                              {downloadFileName || 'edited-document.docx'}
                            </span>
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <div className="mx-auto mb-4 text-muted-foreground">
                            <AlertTriangleIcon size={48} />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">
                            No Edited Document Available
                          </h3>
                          <p className="text-muted-foreground">
                            Apply changes to individual issues to generate an
                            edited document for download.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
