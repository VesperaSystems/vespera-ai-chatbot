import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Download,
  CheckCircle,
  AlertTriangle,
  FileText,
  Shield,
  Scale,
} from 'lucide-react';
import { DocumentEditorWithSuggestions } from '@/components/document-editor-with-suggestions';
import {
  exportDocumentWithChanges,
  convertIssuesToTrackedChanges,
} from '@/lib/document-export';

interface LegalIssue {
  id: string;
  type: string;
  original_text: string;
  recommended_text: string;
  comment: string;
  position?: {
    start: number;
    end: number;
  };
  status?: 'pending' | 'accepted' | 'rejected';
}

interface LegalAnalysisResult {
  document: string;
  issues: LegalIssue[];
  metadata?: {
    fileName?: string;
    fileType?: string;
    charactersAnalyzed?: number;
    analysisTimestamp?: string;
    analysisType?: string;
    issuesFound?: number;
  };
}

interface LegalAnalysisResultsProps {
  analysisResult: LegalAnalysisResult;
  onApplyChanges?: (analysisResult: LegalAnalysisResult) => void;
  onDownload?: () => void;
  fileUrl?: string;
  fileName?: string;
}

const getIssueTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'ambiguity':
      return <AlertTriangle className="size-4" />;
    case 'enforceability':
      return <Scale className="size-4" />;
    case 'regulatory compliance':
      return <Shield className="size-4" />;
    case 'liability':
    case 'potential liability':
      return <AlertTriangle className="size-4" />;
    case 'missing clause':
      return <FileText className="size-4" />;
    default:
      return <FileText className="size-4" />;
  }
};

const getIssueTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'ambiguity':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'enforceability':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'regulatory compliance':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'liability':
    case 'potential liability':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'missing clause':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function LegalAnalysisResults({
  analysisResult,
  onApplyChanges,
  onDownload,
  fileUrl,
  fileName,
}: LegalAnalysisResultsProps) {
  const [editableIssues, setEditableIssues] = useState<LegalIssue[]>(
    analysisResult.issues.map((issue) => ({
      ...issue,
      status: issue.status || 'pending',
    })) || [],
  );
  const [applyingChanges, setApplyingChanges] = useState(false);
  const [applyingIssue, setApplyingIssue] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const handleIssueChange = (
    issueId: string,
    field: keyof LegalIssue,
    value: string,
  ) => {
    setEditableIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId ? { ...issue, [field]: value } : issue,
      ),
    );
  };

  const handleApplyAllChanges = async () => {
    if (!onApplyChanges) {
      toast.error('Apply changes function not available');
      return;
    }

    setApplyingChanges(true);
    try {
      const updatedAnalysisResult = {
        ...analysisResult,
        issues: editableIssues,
      };
      await onApplyChanges(updatedAnalysisResult);
      toast.success('All changes applied successfully!');
    } catch (error) {
      console.error('Failed to apply changes:', error);
      toast.error('Failed to apply changes');
    } finally {
      setApplyingChanges(false);
    }
  };

  const handleApplyIssueChanges = async (issueId: string) => {
    if (!onApplyChanges) {
      toast.error('Apply changes function not available');
      return;
    }

    setApplyingIssue(issueId);
    try {
      const issue = editableIssues.find((i) => i.id === issueId);
      if (issue) {
        const updatedAnalysisResult = {
          ...analysisResult,
          issues: [issue], // Apply only this issue
        };
        await onApplyChanges(updatedAnalysisResult);
        toast.success(`Changes applied to issue ${issueId}!`);
      }
    } catch (error) {
      console.error('Failed to apply issue changes:', error);
      toast.error('Failed to apply changes');
    } finally {
      setApplyingIssue(null);
    }
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else {
      toast.error('Download function not available');
    }
  };

  const handleSuggestionAction = (
    suggestionId: string,
    action: 'accept' | 'reject',
  ) => {
    setEditableIssues((prev) =>
      prev.map((issue) =>
        issue.id === suggestionId
          ? { ...issue, status: action === 'accept' ? 'accepted' : 'rejected' }
          : issue,
      ),
    );
  };

  const handleAddComment = (suggestionId: string, comment: string) => {
    setEditableIssues((prev) =>
      prev.map((issue) =>
        issue.id === suggestionId
          ? {
              ...issue,
              comment: `${issue.comment}\n\nUser Comment: ${comment}`,
            }
          : issue,
      ),
    );
  };

  const handleContentChange = (newContent: string) => {
    // Update the document content when user makes changes
    console.log('Document content changed:', newContent);
  };

  const handleExportDocument = async () => {
    try {
      const trackedChanges = convertIssuesToTrackedChanges(editableIssues);

      const documentWithChanges = {
        content: analysisResult.document,
        changes: trackedChanges,
        metadata: {
          fileName: analysisResult.metadata?.fileName || 'document',
          title: analysisResult.metadata?.fileName || 'Legal Analysis Document',
          author: 'Vespera AI',
          createdDate:
            analysisResult.metadata?.analysisTimestamp ||
            new Date().toISOString(),
        },
      };

      const buffer = await exportDocumentWithChanges(documentWithChanges);

      // Create download link
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${analysisResult.metadata?.fileName || 'document'}_with_changes.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Document exported successfully!');
    } catch (error) {
      console.error('Failed to export document:', error);
      toast.error('Failed to export document');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Legal Analysis Results
          </h1>
          <p className="text-muted-foreground">
            {analysisResult.metadata?.fileName || analysisResult.document}
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span>Issues Found: {analysisResult.issues.length}</span>
            <span>
              Characters Analyzed:{' '}
              {analysisResult.metadata?.charactersAnalyzed || 'N/A'}
            </span>
            <span>
              Analysis Date:{' '}
              {analysisResult.metadata?.analysisTimestamp
                ? new Date(
                    analysisResult.metadata.analysisTimestamp,
                  ).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => setShowEditor(!showEditor)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {showEditor ? 'Hide Editor' : 'Open Editor'}
          </Button>
          <Button
            onClick={handleApplyAllChanges}
            disabled={applyingChanges}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="size-4 mr-2" />
            {applyingChanges ? 'Applying...' : 'Apply All Changes'}
          </Button>
          <Button onClick={handleExportDocument} variant="outline">
            <Download className="size-4 mr-2" />
            Export to Word
          </Button>
          <Button onClick={handleDownload} variant="outline">
            <Download className="size-4 mr-2" />
            Download Original
          </Button>
        </div>
      </div>

      {/* Document Editor with Suggestions */}
      {showEditor && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">
                Document Editor with Suggested Edits
              </h2>
              <p className="text-muted-foreground">
                Review and accept/reject suggested changes in the document.
                Changes are highlighted in the editor.
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-[600px]">
                <DocumentEditorWithSuggestions
                  content={analysisResult.document}
                  suggestions={editableIssues.map((issue) => ({
                    id: issue.id,
                    type: issue.type,
                    originalText: issue.original_text,
                    recommendedText: issue.recommended_text,
                    comment: issue.comment,
                    position: issue.position || { start: 0, end: 0 },
                    status: issue.status || 'pending',
                  }))}
                  onContentChange={handleContentChange}
                  onSuggestionAction={handleSuggestionAction}
                  onAddComment={handleAddComment}
                  isReadOnly={false}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Issues Cards */}
      <div className="grid gap-6">
        {editableIssues.map((issue, index) => (
          <Card key={issue.id} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getIssueTypeIcon(issue.type)}
                  <Badge className={getIssueTypeColor(issue.type)}>
                    {issue.type}
                  </Badge>
                  <span className="text-sm font-medium text-foreground">
                    Issue #{index + 1}
                  </span>
                  {issue.status && (
                    <Badge
                      className={
                        issue.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : issue.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {issue.status}
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={() => handleApplyIssueChanges(issue.id)}
                  disabled={applyingIssue === issue.id}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="size-4 mr-2" />
                  {applyingIssue === issue.id ? 'Applying...' : 'Apply Changes'}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Original Text */}
              <div>
                <h4 className="font-medium mb-2 text-foreground">
                  Original Text:
                </h4>
                <div className="bg-muted p-3 rounded-md text-sm text-foreground">
                  {issue.original_text}
                </div>
              </div>

              {/* Recommended Text */}
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
                  className="w-full bg-green-50 border border-green-200 p-3 rounded-md text-sm resize-none text-foreground"
                  rows={6}
                  placeholder="Enter recommended text..."
                />
              </div>

              {/* Comment */}
              <div>
                <h4 className="font-medium mb-2 text-foreground">Comment:</h4>
                <Textarea
                  value={issue.comment}
                  onChange={(e) =>
                    handleIssueChange(issue.id, 'comment', e.target.value)
                  }
                  className="w-full bg-blue-50 border border-blue-200 p-3 rounded-md text-sm resize-none text-foreground"
                  rows={4}
                  placeholder="Enter comment..."
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Analysis Summary
            </h3>
            <div className="flex justify-center gap-6 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {editableIssues.filter((i) => i.status === 'pending').length}
                </div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {editableIssues.filter((i) => i.status === 'accepted').length}
                </div>
                <div className="text-sm text-muted-foreground">Accepted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {editableIssues.filter((i) => i.status === 'rejected').length}
                </div>
                <div className="text-sm text-muted-foreground">Rejected</div>
              </div>
            </div>
            <p className="text-muted-foreground">
              Review and edit the recommended changes above. Use the editor to
              accept/reject changes and export to Word when ready.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
