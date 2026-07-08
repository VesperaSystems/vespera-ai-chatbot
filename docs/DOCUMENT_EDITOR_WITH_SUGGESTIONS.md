# Document Editor with Suggested Edits

## Overview

The Document Editor with Suggested Edits is a Google Docs-style interface that allows users to review and manage AI-generated legal analysis suggestions directly in a rich text editor. This feature provides a collaborative editing experience similar to Google Docs' suggested edits, with the ability to accept, reject, or comment on changes.

## Features

### 🎯 Core Functionality

- **Rich Text Editor**: Built with ProseMirror for a smooth editing experience
- **Tracked Changes**: Visual highlighting of suggested edits in the document
- **Accept/Reject Actions**: One-click acceptance or rejection of suggestions
- **Comment System**: Add user comments to suggestions
- **Status Tracking**: Track pending, accepted, and rejected changes
- **Export to Word**: Export documents with tracked changes to DOCX format

### 📋 Key Components

1. **DocumentEditorWithSuggestions**: Main editor component with suggestions panel
2. **Legal Analysis Results**: Enhanced with document editor integration
3. **Document Export Utilities**: Functions for exporting to Word with tracked changes

## Usage

### In Legal Analysis Results

1. **Upload Document**: Upload a DOCX file for legal analysis
2. **Run Analysis**: AI analyzes the document for legal issues
3. **Open Editor**: Click "Open Editor" to access the document editor
4. **Review Suggestions**: See highlighted suggestions in the document
5. **Accept/Reject**: Use the suggestions panel to accept or reject changes
6. **Add Comments**: Add your own comments to suggestions
7. **Export**: Export the final document with tracked changes

### Document Editor Interface

The editor is split into two main sections:

#### Left Panel - Document Editor

- Rich text editor showing the original document
- Highlighted suggestions with color coding:
  - Yellow: Pending suggestions
  - Green: Accepted changes
  - Red: Rejected changes

#### Right Panel - Suggestions Panel

- List of all pending suggestions
- Original text vs. recommended text
- AI comments explaining the suggestions
- Action buttons: Accept, Reject, Comment
- Status indicators for each suggestion

## Technical Implementation

### Components

#### `DocumentEditorWithSuggestions`

```typescript
interface DocumentEditorWithSuggestionsProps {
  content: string;
  suggestions: Suggestion[];
  onContentChange: (content: string) => void;
  onSuggestionAction: (
    suggestionId: string,
    action: "accept" | "reject"
  ) => void;
  onAddComment: (suggestionId: string, comment: string) => void;
  isReadOnly?: boolean;
}
```

#### `Suggestion` Interface

```typescript
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
  status: "pending" | "accepted" | "rejected";
}
```

### ProseMirror Integration

The editor uses ProseMirror with custom plugins for:

- Suggestion decorations (visual highlighting)
- Tracked changes support
- Custom marks for suggestion status

### Export Functionality

The export system creates DOCX files with:

- Original text with strikethrough for deletions
- New text in color for insertions
- Comments embedded in the document
- Status tracking for each change

## File Structure

```
components/
├── document-editor-with-suggestions.tsx  # Main editor component
└── legal-analysis-results.tsx            # Enhanced with editor integration

lib/
└── document-export.ts                    # Export utilities

app/(chat)/legal-analysis-editor/
└── page.tsx                              # Main legal analysis page
```

## API Integration

### Legal Analysis API

The system integrates with the existing `/api/document/analyze` endpoint to:

- Extract text from DOCX files
- Generate legal analysis with character positions
- Return structured suggestions with metadata

### Document Export API

Uses the existing document editing infrastructure to:

- Apply accepted changes to documents
- Generate DOCX files with tracked changes
- Handle file downloads

## Benefits

### For Legal Teams

- **Collaborative Review**: Multiple team members can review suggestions
- **Tracked Changes**: Clear audit trail of all modifications
- **Export Flexibility**: Export to Word for further editing
- **Comment System**: Add context and reasoning to decisions

### For Users

- **Intuitive Interface**: Familiar Google Docs-style experience
- **Visual Feedback**: Clear highlighting of suggested changes
- **One-Click Actions**: Quick accept/reject functionality
- **Status Tracking**: Know which changes have been processed

## Future Enhancements

### Planned Features

- **Real-time Collaboration**: Multiple users editing simultaneously
- **Version History**: Track all changes over time
- **Advanced Comments**: Rich text comments with formatting
- **Bulk Actions**: Accept/reject multiple suggestions at once
- **Custom Themes**: Different highlighting schemes
- **Integration**: Connect with document management systems

### Technical Improvements

- **Performance**: Optimize for large documents
- **Accessibility**: Enhanced screen reader support
- **Mobile Support**: Responsive design for mobile devices
- **Offline Support**: Work without internet connection

## Testing

### Test Data

Use the provided `test-legal-analysis.json` file to test the functionality:

1. Load the test data in the legal analysis editor
2. Navigate to the "Document Editor" tab
3. Test accept/reject functionality
4. Add comments to suggestions
5. Export the document

### Manual Testing Checklist

- [ ] Document loads correctly with suggestions highlighted
- [ ] Accepting suggestions updates status and highlighting
- [ ] Rejecting suggestions removes them from view
- [ ] Comments can be added and saved
- [ ] Export generates valid DOCX file
- [ ] Status badges update correctly
- [ ] Responsive design works on different screen sizes

## Troubleshooting

### Common Issues

1. **Suggestions not highlighting**: Check character positions in the analysis data
2. **Export fails**: Verify document content and changes are valid
3. **Editor not loading**: Check ProseMirror dependencies are installed
4. **Performance issues**: Consider document size and number of suggestions

### Debug Information

- Check browser console for error messages
- Verify API responses contain required fields
- Ensure character positions are within document bounds
- Validate suggestion data structure

## Contributing

When contributing to this feature:

1. **Follow TypeScript conventions** for type safety
2. **Test with various document types** and sizes
3. **Maintain accessibility standards** for screen readers
4. **Update documentation** for any new features
5. **Add unit tests** for new functionality

## License

This feature is part of the Vespera AI Chatbot project and follows the same licensing terms.
