'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';
import { artifactDefinitions, type ArtifactKind } from './artifact';
import type { Suggestion } from '@/lib/db/schema';
import { initialArtifactData, useArtifact } from '@/hooks/use-artifact';

export type DataStreamDelta = {
  type:
    | 'text-delta'
    | 'code-delta'
    | 'sheet-delta'
    | 'image-delta'
    | 'title'
    | 'id'
    | 'suggestion'
    | 'clear'
    | 'finish'
    | 'kind'
    | 'json-data'
    | 'download-info'
    | 'readonly-flag'
    | 'file-info'
    | 'analysis-result'
    | 'redirect-to-json-editor';
  content: string | Suggestion | any;
};

export function DataStreamHandler({ id }: { id: string }) {
  const { data: dataStream } = useChat({ id });
  const { artifact, setArtifact, setMetadata } = useArtifact();
  const lastProcessedIndex = useRef(-1);

  useEffect(() => {
    if (!dataStream?.length) return;

    console.log(
      '🔄 DataStreamHandler: Processing data stream, length:',
      dataStream.length,
    );
    console.log(
      '🔄 DataStreamHandler: Last processed index:',
      lastProcessedIndex.current,
    );

    const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
    console.log(
      '🔄 DataStreamHandler: New deltas to process:',
      newDeltas.length,
    );

    lastProcessedIndex.current = dataStream.length - 1;

    (newDeltas as DataStreamDelta[]).forEach((delta: DataStreamDelta) => {
      console.log('🔄 DataStreamHandler: Processing delta type:', delta.type);
      const artifactDefinition = artifactDefinitions.find(
        (artifactDefinition) => artifactDefinition.kind === artifact.kind,
      );

      if (artifactDefinition?.onStreamPart) {
        artifactDefinition.onStreamPart({
          streamPart: delta,
          setArtifact,
          setMetadata,
        });
      }

      setArtifact((draftArtifact) => {
        if (!draftArtifact) {
          return { ...initialArtifactData, status: 'streaming' };
        }

        switch (delta.type) {
          case 'id':
            return {
              ...draftArtifact,
              documentId: delta.content as string,
              status: 'streaming',
            };

          case 'title':
            return {
              ...draftArtifact,
              title: delta.content as string,
              status: 'streaming',
            };

          case 'kind':
            return {
              ...draftArtifact,
              kind: delta.content as ArtifactKind,
              status: 'streaming',
            };

          case 'clear':
            return {
              ...draftArtifact,
              content: '',
              status: 'streaming',
            };

          case 'finish':
            return {
              ...draftArtifact,
              status: 'idle',
            };

          case 'redirect-to-json-editor':
            // Handle redirect to legal analysis editor
            console.log(
              '🔄 DataStreamHandler: Received redirect-to-json-editor command',
            );
            console.log('📋 Redirect data:', delta.content);

            try {
              if (delta.content?.analysisResult) {
                // Store the analysis data in sessionStorage
                try {
                  sessionStorage.setItem(
                    'legalAnalysisData',
                    JSON.stringify({
                      analysisResult: delta.content.analysisResult,
                      fileUrl: delta.content.fileUrl,
                      fileName: delta.content.fileName,
                    }),
                  );
                  console.log(
                    '💾 DataStreamHandler: Analysis data stored in sessionStorage',
                  );
                } catch (storageError) {
                  console.error(
                    '❌ DataStreamHandler: Failed to store data in sessionStorage:',
                    storageError,
                  );
                  // Continue with redirect even if storage fails
                }

                console.log(
                  '🚀 DataStreamHandler: Redirecting to legal analysis editor',
                );

                // Use a small delay to ensure the data is stored before redirect
                setTimeout(() => {
                  try {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/legal-analysis-editor';
                    } else {
                      console.error(
                        '❌ DataStreamHandler: Window is not defined',
                      );
                    }
                  } catch (redirectError) {
                    console.error(
                      '❌ DataStreamHandler: Redirect failed:',
                      redirectError,
                    );
                    // Fallback: try to navigate programmatically
                    if (typeof window !== 'undefined' && window.history) {
                      try {
                        window.history.pushState(
                          {},
                          '',
                          '/legal-analysis-editor',
                        );
                        window.location.reload();
                      } catch (fallbackError) {
                        console.error(
                          '❌ DataStreamHandler: Fallback redirect also failed:',
                          fallbackError,
                        );
                      }
                    }
                  }
                }, 100);
              } else {
                console.error(
                  '❌ DataStreamHandler: No analysis result in redirect data',
                );
              }
            } catch (error) {
              console.error(
                '❌ DataStreamHandler: Error handling redirect:',
                error,
              );
            }

            return draftArtifact;

          default:
            return draftArtifact;
        }
      });
    });
  }, [dataStream, setArtifact, setMetadata, artifact]);

  return null;
}
