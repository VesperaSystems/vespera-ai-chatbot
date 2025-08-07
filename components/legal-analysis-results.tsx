import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, } from '@/components/ui/card';
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

interface LegalIssue {
  id: string;
  type: string;
  original_text: string;
  recommended_text: string;
  comment: string;
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
    analysisResult.issues || [],
  );
  const [applyingChanges, setApplyingChanges] = useState(false);
  const [applyingIssue, setApplyingIssue] = useState<string | null>(null);

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
            onClick={handleApplyAllChanges}
            disabled={applyingChanges}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="size-4 mr-2" />
            {applyingChanges ? 'Applying...' : 'Apply All Changes'}
          </Button>
          <Button onClick={handleDownload} variant="outline">
            <Download className="size-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

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
            <p className="text-muted-foreground">
              Review and edit the recommended changes above. Use the &quot;Apply
              Changes&quot; buttons to update the document with tracked changes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
