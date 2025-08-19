'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView, Decoration, DecorationSet } from 'prosemirror-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  AlertTriangle,
  Scale,
  Shield,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { documentSchema, handleTransaction, headingRule } from '@/lib/editor/config';
import {
  buildDocumentFromContent,
  buildContentFromDocument,
} from '@/lib/editor/functions';
import { exampleSetup } from 'prosemirror-example-setup';
import { inputRules } from 'prosemirror-inputrules';

interface Suggestion {
  id: string;
  type: string;
  originalText: string;
  recommendedText: string;
  comment: string;
  position: {
    start: number;
    end: number;
  };
  status: 'pending' | 'accepted' | 'rejected';
}

interface TrackedChange {
  id: string;
  type: 'insertion' | 'deletion' | 'comment' | 'suggestion';
  originalText?: string;
  newText?: string;
  comment?: string;
  position: {
    start: number;
    end: number;
  };
  status: 'pending' | 'accepted' | 'rejected';
  suggestionId?: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentEditorWithSuggestionsProps {
  content: string;
  suggestions: Suggestion[];
  onContentChange: (content: string) => void;
  onSuggestionAction: (
    suggestionId: string,
    action: 'accept' | 'reject',
  ) => void;
  onAddComment: (suggestionId: string, comment: string) => void;
  isReadOnly?: boolean;
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

export function DocumentEditorWithSuggestions({
  content,
  suggestions,
  onContentChange,
  onSuggestionAction,
  onAddComment,
  isReadOnly = false,
}: DocumentEditorWithSuggestionsProps) {
  // Debug: Log the content being received
  console.log('DocumentEditorWithSuggestions received content:', content);
  console.log('Content type:', typeof content);
  console.log('Content length:', content?.length);
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(
    null,
  );
  const [commentText, setCommentText] = useState<string>('');
  const [trackedChanges, setTrackedChanges] = useState<TrackedChange[]>([]);
  const [showTrackedChanges, setShowTrackedChanges] = useState(false);

  // Plugin for handling suggestions
  const suggestionsPlugin = useMemo(() => {
    // Create decorations for suggestions
    const createSuggestionDecorations = (state: EditorState): DecorationSet => {
      const decorations: Decoration[] = [];

      suggestions.forEach((suggestion) => {
        if (suggestion.position && suggestion.status !== 'rejected') {
          const from = Math.max(0, suggestion.position.start);
          const to = Math.min(state.doc.content.size, suggestion.position.end);

          // Debug: Log position information
          console.log(`Suggestion ${suggestion.id}:`, {
            originalText: suggestion.originalText,
            position: suggestion.position,
            calculatedFrom: from,
            calculatedTo: to,
            docSize: state.doc.content.size,
            isValid:
              from < to &&
              from < state.doc.content.size &&
              to <= state.doc.content.size,
          });

          // Only create decoration if the range is valid and within bounds
          if (
            from < to &&
            from < state.doc.content.size &&
            to <= state.doc.content.size
          ) {
            try {
              // Get the text at this position to verify it matches
              const textAtPosition = state.doc.textBetween(from, to);
              console.log(`Text at position ${from}-${to}: "${textAtPosition}"`);
              console.log(`Expected text: "${suggestion.originalText}"`);
              console.log(`Match: ${textAtPosition === suggestion.originalText}`);

              decorations.push(
                Decoration.inline(from, to, {
                  class: cn('border-l-4 px-1 rounded', {
                    'border-yellow-400 bg-yellow-50':
                      suggestion.status === 'pending',
                    'border-green-400 bg-green-50':
                      suggestion.status === 'accepted',
                  }),
                  'data-suggestion-id': suggestion.id,
                }),
              );
            } catch (error) {
              console.warn(
                'Failed to create decoration for suggestion:',
                suggestion.id,
                error,
              );
            }
          } else {
            console.warn(`Invalid position for suggestion ${suggestion.id}:`, {
              from,
              to,
              docSize: state.doc.content.size,
            });

            // Fallback: Try to find the text in the document
            const docText = state.doc.textContent;
            const fallbackIndex = docText.indexOf(suggestion.originalText);
            if (fallbackIndex !== -1) {
              const fallbackFrom = fallbackIndex;
              const fallbackTo = fallbackIndex + suggestion.originalText.length;

              console.log(`Found fallback position for ${suggestion.id}:`, {
                fallbackFrom,
                fallbackTo,
                text: docText.substring(fallbackFrom, fallbackTo),
              });

              try {
                decorations.push(
                  Decoration.inline(fallbackFrom, fallbackTo, {
                    class: cn('border-l-4 px-1 rounded', {
                      'border-yellow-400 bg-yellow-50':
                        suggestion.status === 'pending',
                      'border-green-400 bg-green-50':
                        suggestion.status === 'accepted',
                    }),
                    'data-suggestion-id': suggestion.id,
                  }),
                );
              } catch (error) {
                console.warn(
                  'Failed to create fallback decoration for suggestion:',
                  suggestion.id,
                  error,
                );
              }
            }
          }
        }
      });

      return DecorationSet.create(state.doc, decorations);
    };

    return new Plugin({
    state: {
      init(_, state) {
        try {
          return createSuggestionDecorations(state);
        } catch (error) {
          console.warn('Failed to initialize suggestions plugin:', error);
          return DecorationSet.empty;
        }
      },
      apply(tr, oldState) {
        try {
          return createSuggestionDecorations(tr.doc as unknown as EditorState);
        } catch (error) {
          console.warn('Failed to apply suggestions plugin:', error);
          return DecorationSet.empty;
        }
      },
    },
    props: {
      decorations(state) {
        try {
          return this.getState(state);
        } catch (error) {
          console.warn('Failed to get decorations:', error);
          return DecorationSet.empty;
        }
      },
    },
  }), [suggestions]);

  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      console.log('Creating editor with content:', content);

      try {
        // Use the proper helper function to build document from content
        const doc = buildDocumentFromContent(content || '');
        console.log('Created document:', doc);

        const state = EditorState.create({
          doc,
          plugins: [
            ...exampleSetup({ schema: documentSchema, menuBar: false }),
            inputRules({
              rules: [
                headingRule(1),
                headingRule(2),
                headingRule(3),
                headingRule(4),
                headingRule(5),
                headingRule(6),
              ],
            }),
            suggestionsPlugin,
          ],
        });

        viewRef.current = new EditorView(editorRef.current, {
          state,
          editable: () => !isReadOnly,
          dispatchTransaction(transaction) {
            handleTransaction({
              transaction,
              editorRef: viewRef,
              onSaveContent: (updatedContent, debounce) => {
                onContentChange(updatedContent);
              },
            });
          },
        });

        console.log('Editor view created:', viewRef.current);
        console.log('Editor DOM element:', editorRef.current);
        console.log('Editor state:', viewRef.current.state);
      } catch (error) {
        console.error('Error creating editor:', error);
      }
    }

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [content, isReadOnly, onContentChange, suggestionsPlugin]);

  useEffect(() => {
    if (viewRef.current && content) {
      const currentContent = buildContentFromDocument(
        viewRef.current.state.doc,
      );
      if (currentContent !== content) {
        try {
          console.log('Updating content from:', currentContent, 'to:', content);

          // Use the proper helper function to build document from content
          const newDoc = buildDocumentFromContent(content);

          const newState = viewRef.current.state.apply(
            viewRef.current.state.tr.replaceWith(
              0,
              viewRef.current.state.doc.content.size,
              newDoc.content,
            ),
          );
          viewRef.current.updateState(newState);
        } catch (error) {
          console.error('Error updating document content:', error);
        }
      }
    }
  }, [content]);

  const handleAcceptSuggestion = (suggestionId: string) => {
    onSuggestionAction(suggestionId, 'accept');
    setSelectedSuggestion(null);
  };

  const handleRejectSuggestion = (suggestionId: string) => {
    onSuggestionAction(suggestionId, 'reject');
    setSelectedSuggestion(null);
  };

  const handleAddComment = (suggestionId: string) => {
    if (commentText.trim()) {
      onAddComment(suggestionId, commentText);
      setCommentText('');
      setSelectedSuggestion(null);
    }
  };

  // Convert suggestions to tracked changes
  const convertSuggestionsToTrackedChanges = (): TrackedChange[] => {
    return suggestions.map((suggestion) => ({
      id: `tracked-${suggestion.id}`,
      type: 'suggestion' as const,
      originalText: suggestion.originalText,
      newText: suggestion.recommendedText,
      comment: suggestion.comment,
      position: suggestion.position,
      status: suggestion.status,
      suggestionId: suggestion.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Save tracked changes
  const saveTrackedChanges = async () => {
    try {
      const changes = convertSuggestionsToTrackedChanges();
      const currentContent = viewRef.current
        ? buildContentFromDocument(viewRef.current.state.doc)
        : content;

      const response = await fetch('/api/document/tracked-changes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: `doc-${Date.now()}`, // In a real app, you'd have a proper document ID
          changes: changes,
          content: currentContent,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Tracked changes saved:', result);
        setTrackedChanges(changes);
        setShowTrackedChanges(true);
      } else {
        console.error('Failed to save tracked changes');
      }
    } catch (error) {
      console.error('Error saving tracked changes:', error);
    }
  };

  const pendingSuggestions = suggestions.filter((s) => s.status === 'pending');
  const acceptedSuggestions = suggestions.filter(
    (s) => s.status === 'accepted',
  );
  const rejectedSuggestions = suggestions.filter(
    (s) => s.status === 'rejected',
  );

  return (
    <div className="flex h-full min-w-0">
      {/* Editor */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 border rounded-lg p-4 overflow-auto">
          <div
            ref={editorRef}
            className="min-h-[400px] prose max-w-none prose-sm"
            style={{
              outline: 'none',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
            }}
          />
          {/* Fallback content display */}
          {!viewRef.current && (
            <div className="text-sm text-muted-foreground">
              <p>Loading editor...</p>
              <p className="mt-2">Content preview:</p>
              <div className="mt-2 p-3 bg-muted rounded text-xs">
                {content || 'No content available'}
              </div>
            </div>
          )}
          {/* Debug info */}
          <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
            <p>
              <strong>Debug:</strong> Editor ref exists:{' '}
              {editorRef.current ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Debug:</strong> View ref exists:{' '}
              {viewRef.current ? 'Yes' : 'No'}
            </p>
            <p>
              <strong>Debug:</strong> Content: {content}
            </p>
            <p>
              <strong>Debug:</strong> Editor DOM children:{' '}
              {editorRef.current?.children?.length || 0}
            </p>
            {viewRef.current && (
              <p>
                <strong>Debug:</strong> Editor state content:{' '}
                {viewRef.current.state.doc.textContent}
              </p>
            )}
          </div>

          {/* Fallback content display if editor is not working */}
          {viewRef.current && !viewRef.current.state.doc.textContent && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-800 font-medium">
                Editor not rendering content properly
              </p>
              <p className="text-red-600 text-sm mt-2">
                Content should be: {content}
              </p>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex gap-4 text-sm mb-3">
            <span>Pending: {pendingSuggestions.length}</span>
            <span>Accepted: {acceptedSuggestions.length}</span>
            <span>Rejected: {rejectedSuggestions.length}</span>
          </div>
          <Button
            onClick={saveTrackedChanges}
            className="w-full"
            variant="outline"
            size="sm"
          >
            Save Tracked Changes
          </Button>
        </div>
      </div>

      {/* Suggestions Panel */}
      <div className="w-80 border-l p-4 overflow-y-auto min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Suggested Edits</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTrackedChanges(!showTrackedChanges)}
          >
            {showTrackedChanges ? 'Show Suggestions' : 'Show Tracked Changes'}
          </Button>
        </div>

        {showTrackedChanges ? (
          // Tracked Changes View
          <div>
            <h4 className="text-md font-medium mb-3">Tracked Changes</h4>
            {trackedChanges.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No tracked changes saved yet. Click &quot;Save Tracked Changes&quot; to
                create them.
              </p>
            ) : (
              trackedChanges.map((change) => (
                <Card key={change.id} className="mb-3">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          change.status === 'accepted' ? 'default' : 'secondary'
                        }
                      >
                        {change.type}
                      </Badge>
                      <Badge variant="outline">{change.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {change.originalText && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            Original:
                          </p>
                          <p className="text-sm bg-red-50 p-2 rounded border-l-4 border-red-200">
                            {change.originalText}
                          </p>
                        </div>
                      )}
                      {change.newText && (
                        <div>
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
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ) : (
          // Suggestions View
          <div>
            {pendingSuggestions.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No pending suggestions
              </p>
            )}

            {pendingSuggestions.map((suggestion) => (
              <Card key={suggestion.id} className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getIssueTypeIcon(suggestion.type)}
                    <Badge className={getIssueTypeColor(suggestion.type)}>
                      {suggestion.type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Original:</h4>
                    <p className="text-sm bg-muted p-2 rounded break-words">
                      {suggestion.originalText}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-1 text-black">
                      Suggested:
                    </h4>
                    <p className="text-sm bg-green-50 p-2 rounded border border-green-200 break-words">
                      {suggestion.recommendedText}
                    </p>
                  </div>

                  {suggestion.comment && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Comment:</h4>
                      <p className="text-sm text-muted-foreground break-words">
                        {suggestion.comment}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => handleAcceptSuggestion(suggestion.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="size-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectSuggestion(suggestion.id)}
                    >
                      <XCircle className="size-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedSuggestion(suggestion.id)}
                    >
                      <MessageSquare className="size-4 mr-1" />
                      Comment
                    </Button>
                  </div>

                  {selectedSuggestion === suggestion.id && (
                    <div className="mt-3 p-3 bg-muted rounded">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add your comment..."
                        className="w-full text-sm p-2 border rounded resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <Button
                          size="sm"
                          onClick={() => handleAddComment(suggestion.id)}
                        >
                          Add Comment
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedSuggestion(null);
                            setCommentText('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
