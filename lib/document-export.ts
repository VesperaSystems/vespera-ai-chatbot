import { Document, Packer, Paragraph, TextRun } from 'docx';

export interface TrackedChange {
  id: string;
  type: 'insertion' | 'deletion' | 'comment';
  originalText?: string;
  newText?: string;
  comment?: string;
  position: {
    start: number;
    end: number;
  };
  status: 'pending' | 'accepted' | 'rejected';
}

export interface DocumentWithChanges {
  content: string;
  changes: TrackedChange[];
  metadata?: {
    fileName?: string;
    title?: string;
    author?: string;
    createdDate?: string;
  };
}

/**
 * Export document with tracked changes to DOCX format
 */
export async function exportDocumentWithChanges(
  document: DocumentWithChanges,
): Promise<Buffer> {
  const doc = new Document({
    title: document.metadata?.title || 'Document with Tracked Changes',
    creator: document.metadata?.author || 'Vespera AI',
    sections: [
      {
        properties: {},
        children: createParagraphsWithChanges(
          document.content,
          document.changes,
        ),
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

/**
 * Create paragraphs with tracked changes
 */
function createParagraphsWithChanges(
  content: string,
  changes: TrackedChange[],
): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Split content into paragraphs
  const contentParagraphs = content.split('\n\n').filter((p) => p.trim());

  contentParagraphs.forEach((paragraphText, index) => {
    const paragraphChanges = changes.filter((change) => {
      const paragraphStart = content.indexOf(paragraphText);
      const paragraphEnd = paragraphStart + paragraphText.length;
      return (
        change.position.start >= paragraphStart &&
        change.position.end <= paragraphEnd
      );
    });

    if (paragraphChanges.length === 0) {
      // No changes in this paragraph
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: paragraphText,
            }),
          ],
        }),
      );
    } else {
      // Apply changes to this paragraph
      const children = createTextRunsWithChanges(
        paragraphText,
        paragraphChanges,
      );
      paragraphs.push(
        new Paragraph({
          children,
        }),
      );
    }
  });

  return paragraphs;
}

/**
 * Create text runs with tracked changes
 */
function createTextRunsWithChanges(
  text: string,
  changes: TrackedChange[],
): TextRun[] {
  const runs: TextRun[] = [];
  let currentPosition = 0;

  // Sort changes by position
  const sortedChanges = [...changes].sort(
    (a, b) => a.position.start - b.position.start,
  );

  sortedChanges.forEach((change) => {
    // Add text before the change
    if (change.position.start > currentPosition) {
      const beforeText = text.substring(currentPosition, change.position.start);
      if (beforeText) {
        runs.push(
          new TextRun({
            text: beforeText,
          }),
        );
      }
    }

    // Add the change
    if (change.status === 'accepted') {
      // Show accepted changes as normal text
      if (change.newText) {
        runs.push(
          new TextRun({
            text: change.newText,
            color: '008000', // Green for accepted changes
          }),
        );
      }
    } else if (change.status === 'pending') {
      // Show pending changes with strikethrough and insertion
      if (change.originalText) {
        runs.push(
          new TextRun({
            text: change.originalText,
            strike: true,
            color: 'FF0000', // Red for deletions
          }),
        );
      }
      if (change.newText) {
        runs.push(
          new TextRun({
            text: change.newText,
            color: '0000FF', // Blue for insertions
          }),
        );
      }
    }
    // Rejected changes are not shown

    currentPosition = change.position.end;
  });

  // Add remaining text
  if (currentPosition < text.length) {
    const remainingText = text.substring(currentPosition);
    if (remainingText) {
      runs.push(
        new TextRun({
          text: remainingText,
        }),
      );
    }
  }

  return runs;
}

/**
 * Convert legal analysis issues to tracked changes
 */
export function convertIssuesToTrackedChanges(issues: any[]): TrackedChange[] {
  return issues.map((issue) => ({
    id: issue.id,
    type: 'insertion',
    originalText: issue.original_text,
    newText: issue.recommended_text,
    comment: issue.comment,
    position: issue.position || { start: 0, end: 0 },
    status: issue.status || 'pending',
  }));
}

/**
 * Generate a summary of changes for the document
 */
export function generateChangesSummary(changes: TrackedChange[]): string {
  const accepted = changes.filter((c) => c.status === 'accepted').length;
  const pending = changes.filter((c) => c.status === 'pending').length;
  const rejected = changes.filter((c) => c.status === 'rejected').length;

  return `Document Review Summary:
- Accepted Changes: ${accepted}
- Pending Changes: ${pending}
- Rejected Changes: ${rejected}
- Total Changes: ${changes.length}`;
}
