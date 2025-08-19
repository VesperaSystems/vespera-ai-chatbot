'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoryIcon, FileTextIcon, DownloadIcon } from '@/components/icons';

interface FileHistoryModalProps {
  fileId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

interface FileHistory {
  file: {
    id: number;
    name: string;
    type: string;
    size: string;
    createdAt: string;
    updatedAt: string;
    blobUrl: string;
  };
  accessHistory: Array<{
    id: number;
    action: string;
    accessedAt: string;
    ipAddress: string | null;
    userAgent: string | null;
  }>;
  versions: Array<{
    id: string;
    version: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    type: 'file' | 'document';
    content?: string;
    changes: any[];
  }>;
  trackedChanges: any[];
  hasDocumentVersions: boolean;
}

export function FileHistoryModal({
  fileId,
  isOpen,
  onClose,
}: FileHistoryModalProps) {
  const [fileHistory, setFileHistory] = useState<FileHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFileHistory = useCallback(async () => {
    if (!fileId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/files/${fileId}/history`);
      if (!response.ok) {
        throw new Error('Failed to fetch file history');
      }
      const data = await response.json();
      setFileHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [fileId]);

  useEffect(() => {
    if (isOpen && fileId) {
      fetchFileHistory();
    }
  }, [isOpen, fileId, fetchFileHistory]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view':
        return <FileTextIcon size={16} />;
      case 'upload':
        return <DownloadIcon size={16} />;
      case 'download':
        return <DownloadIcon size={16} />;
      default:
        return <HistoryIcon size={16} />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'view':
        return 'bg-blue-100 text-blue-800';
      case 'upload':
        return 'bg-green-100 text-green-800';
      case 'download':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HistoryIcon size={20} />
            File History
            {fileHistory && (
              <Badge variant="outline">{fileHistory.file.name}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full size-8 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading file history...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchFileHistory}>Retry</Button>
          </div>
        )}

        {fileHistory && !loading && (
          <div className="space-y-4">
            {/* File Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">File Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-muted-foreground">Created</p>
                    <p>{formatDate(fileHistory.file.createdAt)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">
                      Last Modified
                    </p>
                    <p>{formatDate(fileHistory.file.updatedAt)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Type</p>
                    <p>{fileHistory.file.type.toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="font-medium text-muted-foreground">Size</p>
                    <p>{fileHistory.file.size}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="access" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="access">Access History</TabsTrigger>
                <TabsTrigger value="versions">Versions</TabsTrigger>
                <TabsTrigger value="changes">Tracked Changes</TabsTrigger>
              </TabsList>

              <TabsContent value="access" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Access History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {fileHistory.accessHistory.length === 0 ? (
                      <p className="text-muted-foreground">
                        No access history available.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {fileHistory.accessHistory
                          .slice(0, 10)
                          .map((access) => (
                            <div
                              key={access.id}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`p-1 rounded ${getActionColor(access.action)}`}
                                >
                                  {getActionIcon(access.action)}
                                </div>
                                <span className="text-sm capitalize">
                                  {access.action}
                                </span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(access.accessedAt)}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="versions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      File Versions
                      {fileHistory.hasDocumentVersions && (
                        <Badge variant="secondary">Has Document Versions</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {fileHistory.versions.length === 0 ? (
                      <p className="text-muted-foreground">
                        No versions available.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {fileHistory.versions.map((version) => (
                          <div
                            key={version.id}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  v{version.version}
                                </span>
                                <Badge
                                  variant={
                                    version.type === 'document'
                                      ? 'default'
                                      : 'outline'
                                  }
                                  className="text-xs"
                                >
                                  {version.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {version.description}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {version.type === 'document' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() =>
                                    window.open(
                                      `/legal-analysis-editor?documentId=${version.id}`,
                                      '_blank',
                                    )
                                  }
                                >
                                  Open
                                </Button>
                              )}
                              {version.type === 'file' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() =>
                                    window.open(
                                      fileHistory.file.blobUrl,
                                      '_blank',
                                    )
                                  }
                                >
                                  Download
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="changes" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tracked Changes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {fileHistory.trackedChanges.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="mx-auto mb-2 text-muted-foreground">
                          <HistoryIcon size={32} />
                        </div>
                        <p className="text-muted-foreground text-sm">
                          No tracked changes available for this file.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {fileHistory.trackedChanges.map((change, index) => (
                          <div
                            key={`change-${index}-${change.type}`}
                            className="p-2 border rounded"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={
                                  change.status === 'accepted'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="text-xs"
                              >
                                {change.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {change.status}
                              </Badge>
                            </div>

                            {change.originalText && (
                              <div className="mb-1">
                                <p className="text-xs font-medium text-muted-foreground">
                                  Original:
                                </p>
                                <p className="text-xs bg-red-50 p-1 rounded border-l-2 border-red-200">
                                  {change.originalText.substring(0, 100)}...
                                </p>
                              </div>
                            )}

                            {change.newText && (
                              <div className="mb-1">
                                <p className="text-xs font-medium text-muted-foreground">
                                  New:
                                </p>
                                <p className="text-xs bg-green-50 p-1 rounded border-l-2 border-green-200">
                                  {change.newText.substring(0, 100)}...
                                </p>
                              </div>
                            )}

                            {change.comment && (
                              <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                  Comment:
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {change.comment.substring(0, 100)}...
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              {fileHistory.file.type === 'docx' && (
                <Button
                  onClick={() =>
                    window.open(
                      `/legal-analysis-editor?fileId=${fileHistory.file.id}`,
                      '_blank',
                    )
                  }
                >
                  Open in Legal Editor
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() =>
                  window.open(`/file-history/${fileHistory.file.id}`, '_blank')
                }
              >
                View Full History
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
