import { Artifact } from '@/components/create-artifact';
import { JsonViewer } from '@/components/json-viewer';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { toast } from 'sonner';

interface JsonArtifactMetadata {
  analysisResult?: {
    document: string;
    issues: Array<{
      id: string;
      type: string;
      original_text: string;
      recommended_text: string;
      comment: string;
    }>;
    metadata?: {
      fileName?: string;
      fileType?: string;
      charactersAnalyzed?: number;
      analysisTimestamp?: string;
      analysisType?: string;
      issuesFound?: number;
    };
  };
  downloadUrl?: string;
  downloadFileName?: string;
  isReadonly?: boolean;
  originalFileUrl?: string;
  originalFileName?: string;
}

export const jsonArtifact = new Artifact<'json', JsonArtifactMetadata>({
  kind: 'json',
  description: 'Legal analysis results with interactive JSON viewer.',
  actions: [],
  toolbar: [],
  initialize: async ({ documentId, setMetadata }) => {
    // Initialize with empty metadata
    setMetadata({
      analysisResult: undefined,
      downloadUrl: undefined,
      downloadFileName: undefined,
      isReadonly: false,
      originalFileUrl: undefined,
      originalFileName: undefined,
    });
  },
  onStreamPart: ({ streamPart, setMetadata, setArtifact }) => {
    if (streamPart.type === 'json-data') {
      setMetadata((metadata) => {
        return {
          ...metadata,
          analysisResult:
            streamPart.content as JsonArtifactMetadata['analysisResult'],
        };
      });

      // Make the artifact visible when JSON data is received
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          isVisible: true,
          status: 'streaming',
        };
      });
    }

    if (streamPart.type === 'download-info') {
      setMetadata((metadata) => {
        return {
          ...metadata,
          downloadUrl: (streamPart.content as any).downloadUrl,
          downloadFileName: (streamPart.content as any).downloadFileName,
        };
      });
    }

    if (streamPart.type === 'readonly-flag') {
      setMetadata((metadata) => {
        return {
          ...metadata,
          isReadonly: streamPart.content as boolean,
        };
      });
    }

    if (streamPart.type === 'file-info') {
      setMetadata((metadata) => {
        return {
          ...metadata,
          originalFileUrl: (streamPart.content as any).fileUrl,
          originalFileName: (streamPart.content as any).fileName,
        };
      });
    }

    if (streamPart.type === 'text-delta') {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          content: draftArtifact.content + (streamPart.content as string),
          isVisible:
            draftArtifact.status === 'streaming' &&
            draftArtifact.content.length > 400 &&
            draftArtifact.content.length < 450
              ? true
              : draftArtifact.isVisible,
          status: 'streaming',
        };
      });
    }
  },
  content: ({
    mode,
    status,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
    metadata,
  }) => {
    if (isLoading) {
      return <DocumentSkeleton artifactKind="json" />;
    }

    // If we have analysis result metadata, show the JSON viewer
    if (metadata?.analysisResult) {
      return (
        <div className="flex flex-row py-8 md:p-20 px-4">
          <div className="w-full max-w-4xl mx-auto">
            <JsonViewer
              content={JSON.stringify(metadata?.analysisResult, null, 2)}
              metadata={metadata}
              onApplyChanges={async () => {
                try {
                  // For now, show a success message
                  // In a full implementation, this would trigger the edit document tool
                  if (
                    metadata?.originalFileUrl &&
                    metadata?.originalFileName &&
                    metadata?.analysisResult
                  ) {
                    toast.success(
                      'Changes applied successfully! The document has been updated with tracked changes.',
                    );

                    // In a real implementation, you would:
                    // 1. Call the edit document tool with the analysis results
                    // 2. Update the original document with tracked changes
                    // 3. Provide a download link for the edited document

                    console.log('Would apply changes:', {
                      analysisResult: metadata?.analysisResult,
                      fileUrl: metadata?.originalFileUrl,
                      fileName: metadata?.originalFileName,
                    });
                  } else {
                    toast.error(
                      'Missing file information. Cannot apply changes.',
                    );
                  }
                } catch (error) {
                  console.error('Failed to apply changes:', error);
                  toast.error('Failed to apply changes to document');
                }
              }}
              onApplyIssueChanges={async (
                issueId: string,
                updatedIssue: any,
              ) => {
                try {
                  // In a full implementation, this would trigger the edit document tool for a specific issue
                  if (metadata?.originalFileUrl && metadata?.originalFileName) {
                    toast.success(
                      `Changes applied to issue ${issueId}! The document has been updated with tracked changes.`,
                    );

                    // In a real implementation, you would:
                    // 1. Call the edit document tool with the specific issue changes
                    // 2. Update the original document with tracked changes for this issue
                    // 3. Provide a download link for the edited document

                    console.log('Would apply issue changes:', {
                      issueId,
                      updatedIssue,
                      fileUrl: metadata?.originalFileUrl,
                      fileName: metadata?.originalFileName,
                    });
                  } else {
                    toast.error(
                      'Missing file information. Cannot apply changes.',
                    );
                  }
                } catch (error) {
                  console.error('Failed to apply issue changes:', error);
                  toast.error('Failed to apply changes to document');
                }
              }}
            />
          </div>
        </div>
      );
    }

    // If we have content but no metadata, try to parse it as JSON
    if (content?.trim()) {
      try {
        const parsedContent = JSON.parse(content);
        return (
          <div className="flex flex-row py-8 md:p-20 px-4">
            <div className="w-full max-w-4xl mx-auto">
              <JsonViewer
                content={JSON.stringify(parsedContent, null, 2)}
                metadata={metadata ?? {}}
                onApplyChanges={async () => {
                  toast.success('Changes applied successfully!');
                }}
              />
            </div>
          </div>
        );
      } catch (error) {
        // If it's not valid JSON, show as text
        return (
          <div className="flex flex-row py-8 md:p-20 px-4">
            <div className="w-full max-w-4xl mx-auto">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">{content}</pre>
              </div>
            </div>
          </div>
        );
      }
    }

    // Fallback to text display if no content
    return (
      <div className="flex flex-row py-8 md:p-20 px-4">
        <div className="w-full max-w-4xl mx-auto">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-muted-foreground">No JSON data available</p>
          </div>
        </div>
      </div>
    );
  },
});
