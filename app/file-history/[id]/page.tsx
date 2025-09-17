'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeftIcon,
  DownloadIcon,
  HistoryIcon,
  FileTextIcon,
} from '@/components/icons';
import Link from 'next/link';

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

export default function FileHistoryPage() {
  const params = useParams();
  const { data: session } = useSession();
  const fileId = params.id as string;
  const [fileHistory, setFileHistory] = useState<FileHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLegalTenant = session?.user?.tenantType === 'legal';

  useEffect(() => {
    const fetchFileHistory = async () => {
      try {
        setLoading(true);
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
    };

    if (fileId) {
      fetchFileHistory();
    }
  }, [fileId]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full size-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading file history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !fileHistory) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive mb-4">{error || 'File not found'}</p>
            <Link href="/">
              <Button>
                <div className="mr-2">
                  <ArrowLeftIcon size={16} />
                </div>
                Back to Files
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <div className="mr-2">
                <ArrowLeftIcon size={16} />
              </div>
              Back to Files
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{fileHistory.file.name}</h1>
            <p className="text-muted-foreground">
              File History & Tracked Changes
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{fileHistory.file.type.toUpperCase()}</Badge>
          <Badge variant="secondary">{fileHistory.file.size}</Badge>
          {/* Legal editor button removed - only accessible via direct URL */}
        </div>
      </div>

      {/* File Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon size={20} />
            File Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Created
              </p>
              <p className="text-sm">
                {formatDate(fileHistory.file.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Last Modified
              </p>
              <p className="text-sm">
                {formatDate(fileHistory.file.updatedAt)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                File Type
              </p>
              <p className="text-sm">{fileHistory.file.type.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Size</p>
              <p className="text-sm">{fileHistory.file.size}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="access" className="space-y-4">
        <TabsList>
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
                <div className="space-y-3">
                  {fileHistory.accessHistory.map((access) => (
                    <div
                      key={access.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${getActionColor(access.action)}`}
                        >
                          {getActionIcon(access.action)}
                        </div>
                        <div>
                          <p className="font-medium capitalize">
                            {access.action}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {access.ipAddress && `IP: ${access.ipAddress}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatDate(access.accessedAt)}
                        </p>
                      </div>
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
                <p className="text-muted-foreground">No versions available.</p>
              ) : (
                <div className="space-y-3">
                  {fileHistory.versions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">
                            Version {version.version}
                          </p>
                          <Badge
                            variant={
                              version.type === 'document'
                                ? 'default'
                                : 'outline'
                            }
                          >
                            {version.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {version.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(version.updatedAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {/* Legal editor button removed - only accessible via direct URL */}
                        {version.type === 'file' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(fileHistory.file.blobUrl, '_blank')
                            }
                          >
                            Download
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
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
                <div className="text-center py-8">
                  <div className="mx-auto mb-4 text-muted-foreground">
                    <HistoryIcon size={48} />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    No tracked changes available for this file.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tracked changes will appear here when you edit this document
                    using the legal analysis editor.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fileHistory.trackedChanges.map((change, index) => (
                    <div
                      key={`change-${index}-${change.type}`}
                      className="p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={
                            change.status === 'accepted'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {change.type}
                        </Badge>
                        <Badge variant="outline">{change.status}</Badge>
                      </div>

                      {change.originalText && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Original:
                          </p>
                          <p className="text-sm bg-red-50 p-2 rounded border-l-4 border-red-200">
                            {change.originalText}
                          </p>
                        </div>
                      )}

                      {change.newText && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            New:
                          </p>
                          <p className="text-sm bg-green-50 p-2 rounded border-l-4 border-green-200">
                            {change.newText}
                          </p>
                        </div>
                      )}

                      {change.comment && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Comment:
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {change.comment}
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
    </div>
  );
}
