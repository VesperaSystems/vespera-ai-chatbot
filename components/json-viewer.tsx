'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileIcon, AlertTriangleIcon, PlayIcon } from './icons';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface LegalAnalysisIssue {
  id: string;
  type: string;
  original_text: string;
  recommended_text: string;
  comment: string;
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

interface JsonViewerProps {
  content: string;
  metadata?: {
    analysisResult?: LegalAnalysisResult;
    downloadUrl?: string;
    downloadFileName?: string;
    isReadonly?: boolean;
    originalFileUrl?: string;
    originalFileName?: string;
  };
  onApplyChanges?: () => Promise<void>;
  onApplyIssueChanges?: (
    issueId: string,
    updatedIssue: LegalAnalysisIssue,
  ) => Promise<void>;
}

// Syntax highlighting for JSON
const syntaxHighlight = (json: string): string => {
  return json
    .replace(/(".*?":)/g, '<span class="text-blue-600 font-semibold">$1</span>')
    .replace(/(".*?")/g, '<span class="text-green-600">$1</span>')
    .replace(
      /(true|false)/g,
      '<span class="text-purple-600 font-semibold">$1</span>',
    )
    .replace(/(\d+)/g, '<span class="text-orange-600">$1</span>')
    .replace(/([{}[\],])/g, '<span class="text-gray-600 font-bold">$1</span>');
};

// Format JSON with proper indentation
const formatJSON = (json: string): string => {
  try {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return json;
  }
};

// Validate JSON
const isValidJSON = (json: string): boolean => {
  try {
    JSON.parse(json);
    return true;
  } catch {
    return false;
  }
};

const getIssueTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'ambiguity':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'enforceability':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'regulatory compliance':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'liability':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'missing clause':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'legal terminology':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'potential liability':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function JsonViewer({
  content,
  metadata,
  onApplyChanges,
  onApplyIssueChanges,
}: JsonViewerProps) {
  const [jsonContent, setJsonContent] = useState(content);
  const [isJsonValid, setIsJsonValid] = useState(isValidJSON(content));
  const [isApplying, setIsApplying] = useState(false);
  const [editableIssues, setEditableIssues] = useState<LegalAnalysisIssue[]>(
    [],
  );
  const [applyingIssues, setApplyingIssues] = useState<Set<string>>(new Set());

  // Get analysis result from metadata or parse content
  let analysisResult: LegalAnalysisResult | null = null;

  if (metadata?.analysisResult) {
    analysisResult = metadata.analysisResult;
  } else {
    try {
      analysisResult = JSON.parse(content);
    } catch (error) {
      // We'll handle this error after all hooks are declared
    }
  }

  // Initialize editable issues when analysis result changes
  useEffect(() => {
    const issues = metadata?.analysisResult?.issues || analysisResult?.issues;
    if (issues && issues.length > 0) {
      console.log('Setting editable issues:', issues);
      setEditableIssues(issues);
    }
  }, [metadata?.analysisResult?.issues, analysisResult?.issues]);

  // Move all hooks to the top before any early returns
  const handleApplyChanges = useCallback(async () => {
    if (!onApplyChanges) return;

    setIsApplying(true);
    try {
      await onApplyChanges();
      toast.success('Changes applied successfully!');
    } catch (error) {
      console.error('Failed to apply changes:', error);
      toast.error('Failed to apply changes to document');
    } finally {
      setIsApplying(false);
    }
  }, [onApplyChanges]);

  const handleApplyIssueChanges = useCallback(
    async (issueId: string) => {
      if (!onApplyIssueChanges) return;

      const issue = editableIssues.find((i) => i.id === issueId);
      if (!issue) return;

      setApplyingIssues((prev) => new Set(prev).add(issueId));
      try {
        await onApplyIssueChanges(issueId, issue);
        toast.success(`Changes applied to issue ${issueId}!`);
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
    },
    [onApplyIssueChanges, editableIssues],
  );

  const handleIssueChange = useCallback(
    (issueId: string, field: keyof LegalAnalysisIssue, value: string) => {
      setEditableIssues((prev) =>
        prev.map((issue) =>
          issue.id === issueId ? { ...issue, [field]: value } : issue,
        ),
      );
    },
    [],
  );

  const handleJsonChange = useCallback((value: string) => {
    setJsonContent(value);
    setIsJsonValid(isValidJSON(value));
  }, []);

  const handleFormatJson = useCallback(() => {
    if (isValidJSON(jsonContent)) {
      setJsonContent(formatJSON(jsonContent));
    }
  }, [jsonContent]);

  // Now handle the JSON parsing error
  if (!analysisResult) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 text-muted-foreground">
            <AlertTriangleIcon size={48} />
          </div>
          <h3 className="text-lg font-semibold mb-2">Invalid JSON Data</h3>
          <p className="text-muted-foreground">
            The provided content is not valid JSON format.
          </p>
        </div>
      </div>
    );
  }

  // Check if we have a valid analysis result
  if (
    !analysisResult ||
    !analysisResult.issues ||
    !Array.isArray(analysisResult.issues)
  ) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 text-muted-foreground">
            <AlertTriangleIcon size={48} />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Analysis Results</h3>
          <p className="text-muted-foreground">
            No valid analysis results found in the data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="size-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">Legal Analysis Results</h2>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="issues" className="flex-1 flex flex-col">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden">
          <TabsContent value="issues" className="h-full mt-0">
            <div className="h-full overflow-y-auto p-6 space-y-4">
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
                        {analysisResult.metadata?.fileName || 'Unknown'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Issues Found:</span>
                      <p className="text-muted-foreground">
                        {analysisResult.issues.length}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Characters Analyzed:</span>
                      <p className="text-muted-foreground">
                        {analysisResult.metadata?.charactersAnalyzed ||
                          'Unknown'}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Analysis Date:</span>
                      <p className="text-muted-foreground">
                        {analysisResult.metadata?.analysisTimestamp
                          ? new Date(
                              analysisResult.metadata.analysisTimestamp,
                            ).toLocaleDateString()
                          : 'Unknown'}
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
                          disabled={
                            applyingIssues.has(issue.id) || metadata?.isReadonly
                          }
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
                        <div className="bg-muted p-3 rounded-md text-sm text-foreground">
                          {issue.original_text}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 text-foreground">
                          Recommended Text:
                        </h4>
                        <textarea
                          value={issue.recommended_text}
                          onChange={(e) =>
                            handleIssueChange(
                              issue.id,
                              'recommended_text',
                              e.target.value,
                            )
                          }
                          className="w-full bg-green-50 border border-green-200 p-3 rounded-md text-sm resize-none text-foreground"
                          rows={8}
                        />
                      </div>

                      <div>
                        <h4 className="font-medium mb-2 text-foreground">
                          Comment:
                        </h4>
                        <textarea
                          value={issue.comment}
                          onChange={(e) =>
                            handleIssueChange(
                              issue.id,
                              'comment',
                              e.target.value,
                            )
                          }
                          className="w-full bg-blue-50 border border-blue-200 p-3 rounded-md text-sm resize-none text-foreground"
                          rows={8}
                          placeholder="Edit comment..."
                          disabled={metadata?.isReadonly}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="editor" className="h-full mt-0">
            <div className="h-full p-6">
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">JSON Editor</h3>
                  <div className="flex items-center space-x-2">
                    {!isJsonValid && (
                      <div className="flex items-center text-red-600 text-sm">
                        <AlertTriangleIcon size={16} />
                        <span className="ml-1">Invalid JSON</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 relative">
                  <Textarea
                    value={jsonContent}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className={cn(
                      'min-h-[80vh] resize-none font-mono text-sm',
                      !isJsonValid && 'border-red-500 focus:border-red-500',
                    )}
                    placeholder="Edit JSON content here..."
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="h-full mt-0">
            <div className="h-full p-6">
              <div className="h-full flex flex-col">
                <h3 className="text-lg font-medium mb-4">JSON Preview</h3>

                <div className="flex-1 bg-muted rounded-md p-4 overflow-auto">
                  <pre
                    className="text-sm font-mono"
                    dangerouslySetInnerHTML={{
                      __html: syntaxHighlight(formatJSON(jsonContent)),
                    }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
