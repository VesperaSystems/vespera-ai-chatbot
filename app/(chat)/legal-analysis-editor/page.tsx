'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/icons';
import { toast } from 'sonner';
import { generateUUID } from '@/lib/utils';

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
}

interface LegalAnalysisResult {
  document: string;
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
  const [applyingIssues, setApplyingIssues] = useState<Set<string>>(new Set());
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's a supported file type
    if (!file.name.toLowerCase().endsWith('.docx')) {
      toast.error('Please select a .docx file');
      return;
    }

    setSelectedFile(file);
    setUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      setFileUrl(result.url);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !fileUrl) {
      toast.error('Please upload a document first');
      return;
    }

    setAnalyzing(true);

    try {
      console.log('🔍 Starting legal analysis for:', selectedFile.name);
      console.log('📄 File URL:', fileUrl);

      // Call the analyze document API directly
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: generateUUID(),
          message: {
            id: generateUUID(),
            createdAt: new Date(),
            role: 'user',
            content: `Please analyze this document for legal issues: ${selectedFile.name}`,
            parts: [
              {
                type: 'text',
                text: `Please analyze this document for legal issues: ${selectedFile.name}`,
              },
            ],
            experimental_attachments: [
              {
                url: fileUrl,
                name: selectedFile.name,
                contentType:
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              },
            ],
          },
          selectedChatModel: 'gpt-4',
          selectedVisibilityType: 'private',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze document');
      }

      // For now, let's use a simpler approach to test the AI analysis
      // The chat API returns a stream, but we'll handle it more carefully
      console.log('📤 Response status:', response.status);
      console.log('📤 Response headers:', response.headers);

      // Read the response as text first to debug
      const responseText = await response.text();
      console.log('📤 Full response text:', responseText);

      // Try to parse the response as JSON
      let analysisData: LegalAnalysisResult | null = null;

      try {
        const responseJson = JSON.parse(responseText);
        console.log('📋 Parsed response:', responseJson);

        if (responseJson.analysisResult) {
          analysisData = responseJson.analysisResult;
        }
      } catch (e) {
        console.log('📋 Response is not JSON, trying to parse as stream...');

        // Try to parse as stream data
        const lines = responseText.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              console.log('📋 Stream data:', parsed);

              if (
                parsed.type === 'redirect-to-json-editor' &&
                parsed.content?.analysisResult
              ) {
                console.log(
                  '📋 Found analysis data:',
                  parsed.content.analysisResult,
                );
                analysisData = parsed.content.analysisResult;
                break;
              }
            } catch (e) {
              // Ignore JSON parse errors for non-JSON data
            }
          }
        }
      }

      if (!analysisData) {
        console.error('❌ No analysis data found in response');
        console.log('🔄 Falling back to direct API call...');

        // Try a direct call to the analyzeDocument tool
        const directResponse = await fetch('/api/document/analyze', {
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

        if (directResponse.ok) {
          const directResult = await directResponse.json();
          console.log('📋 Direct API result:', directResult);

          if (directResult.analysis) {
            analysisData = directResult.analysis;
          } else {
            throw new Error('No analysis data from direct API call');
          }
        } else {
          throw new Error('Direct API call failed');
        }
      }

      setLegalData({
        analysisResult: analysisData,
        fileUrl: fileUrl,
        fileName: selectedFile.name,
      });
      setEditableIssues(analysisData.issues);
      toast.success(
        `Analysis completed. Found ${analysisData.issues.length} issues.`,
      );
    } catch (error) {
      console.error('Failed to analyze document:', error);
      toast.error('Failed to analyze document. Please try again.');
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

      // Apply the changes to the document
      const response = await fetch('/api/document/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileUrl: legalData?.fileUrl,
          fileName: legalData?.fileName,
          issue: issue,
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
        toast.success(`Changes applied to issue ${issueId}!`);
      } else {
        throw new Error('No download URL received');
      }
    } catch (error) {
      console.error('Failed to apply issue changes:', error);
      toast.error('Failed to apply changes to document');
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
      toast.error('No issues to apply');
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
        toast.success(`Applied all ${editableIssues.length} changes!`);
      } else {
        throw new Error('No download URL received');
      }
    } catch (error) {
      console.error('Failed to apply all changes:', error);
      toast.error('Failed to apply all changes to document');
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

  if (!legalData) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Legal Document Analysis</h1>
          <p className="text-muted-foreground">
            Upload a DOCX document and analyze it for legal issues,
            inconsistencies, and areas for improvement
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UploadIcon size={20} />
              <span className="ml-2">Upload Document for Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="file-upload"
                className="block text-sm font-medium"
              >
                Select Document (.docx)
              </label>
              <Input
                id="file-upload"
                type="file"
                accept=".docx"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedFile.name}
                </p>
              )}
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
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Legal Analysis Results</h1>
          <p className="text-muted-foreground">
            Review and edit the legal analysis for: {legalData.fileName}
          </p>
        </div>
        <div className="flex gap-2">
          {editableIssues.length > 0 && (
            <Button
              onClick={handleApplyAllChanges}
              disabled={applyingIssues.size > 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {applyingIssues.size > 0 ? (
                <>
                  <div className="animate-spin rounded-full size-4 border-b-2 border-white mr-2" />
                  Applying All Changes...
                </>
              ) : (
                <>
                  <PlayIcon size={16} />
                  <span className="ml-2">Apply All Changes</span>
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
              setDownloadUrl(null);
              setDownloadFileName(null);
            }}
          >
            New Analysis
          </Button>
        </div>
      </div>

      <Tabs defaultValue="issues" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="issues">Issues</TabsTrigger>
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
                  <span className="font-medium">Characters Analyzed:</span>
                  <p className="text-muted-foreground">
                    {legalData.analysisResult.metadata?.charactersAnalyzed ||
                      'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Analysis Date:</span>
                  <p className="text-muted-foreground">
                    {legalData.analysisResult.metadata?.analysisTimestamp
                      ? new Date(
                          legalData.analysisResult.metadata.analysisTimestamp,
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
              <Card key={issue.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getIssueTypeColor(issue.type)}>
                        {issue.type}
                      </Badge>
                      <span className="text-sm text-foreground font-medium">
                        Issue #{index + 1}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApplyIssueChanges(issue.id)}
                      disabled={applyingIssues.has(issue.id)}
                    >
                      {applyingIssues.has(issue.id) ? (
                        <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <PlayIcon size={16} />
                      )}
                      <span className="ml-2">Apply Changes</span>
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
                        handleIssueChange(issue.id, 'comment', e.target.value)
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
                      {legalData.analysisResult.metadata?.analysisType ||
                        'legal'}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="font-medium text-foreground">
                      Characters Analyzed:
                    </span>{' '}
                    <span className="text-muted-foreground">
                      {legalData.analysisResult.metadata?.charactersAnalyzed ||
                        'Unknown'}
                    </span>
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2 text-foreground">
                    Issue Types Found:
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {Array.from(
                      new Set(editableIssues.map((issue) => issue.type)),
                    ).map((type) => (
                      <li key={type} className="text-sm text-muted-foreground">
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
                    Your document has been edited with the selected changes.
                    Click the button below to download the updated version.
                  </p>
                  <Button onClick={handleDownload} className="w-full">
                    <DownloadIcon size={16} />
                    <span className="ml-2">
                      Download {downloadFileName || 'edited-document.docx'}
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
                    Apply changes to individual issues to generate an edited
                    document for download.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
