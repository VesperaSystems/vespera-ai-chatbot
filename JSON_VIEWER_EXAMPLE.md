# JSON Viewer Component for Legal Analysis

## Overview

The JSON Viewer component displays legal analysis results in a structured, interactive interface similar to the code editor window. It shows the analysis results on the right while the chat continues on the left, and provides an "Apply Changes" button for legal users to edit the document.

## Component Features

### 🎯 **Interactive Interface**

- **Issues List**: Clickable cards showing each legal issue
- **Issue Details**: Expandable view with original vs recommended text
- **Visual Indicators**: Color-coded text (red for original, green for recommended)
- **Badge System**: Issue types and counts clearly displayed

### 🔧 **Action Buttons**

- **Apply Changes**: Only visible for legal users, triggers document editing
- **Download**: Available after changes are applied
- **Loading States**: Shows progress during document editing

### 📊 **Data Display**

- **Document Info**: File name, analysis type, character count
- **Issue Summary**: Total issues found with breakdown
- **Detailed View**: Original text, recommended text, and comments

## Example Usage

### **1. Legal Analysis Response**

When the AI performs legal analysis, it returns structured JSON:

```json
{
  "document": "Employment Agreement",
  "issues": [
    {
      "id": "issue-1",
      "type": "ambiguous_compensation",
      "original_text": "The Employee shall receive a salary of $X per year...",
      "recommended_text": "The Employee shall receive a salary of $85,000 per year...",
      "comment": "The original text uses a placeholder '$X' which is ambiguous and unenforceable."
    },
    {
      "id": "issue-2",
      "type": "missing_termination_notice",
      "original_text": "Either party may terminate this Agreement at any time...",
      "recommended_text": "Either party may terminate this Agreement with 30 days written notice...",
      "comment": "The original clause lacks specific notice requirements and definition of 'cause.'"
    }
  ],
  "metadata": {
    "fileName": "employment_agreement.docx",
    "fileType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "charactersAnalyzed": 1247,
    "analysisType": "legal",
    "issuesFound": 2
  }
}
```

### **2. JSON Viewer Display**

The component renders this as:

```
┌─────────────────────────────────────────────────────────────┐
│ 📄 Legal Analysis Results                    [2 Issues]   │
│                                                           │
│ Document: Employment Agreement                            │
│ File: employment_agreement.docx                           │
│ Characters Analyzed: 1,247                               │
│                                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚠️ Issue 1: ambiguous_compensation                    │ │
│ │ Ambiguous compensation terms...                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ⚠️ Issue 2: missing_termination_notice                │ │
│ │ Missing termination notice requirements...              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                           │
│ [Apply Changes to Document] [Download Edited Document]   │
└─────────────────────────────────────────────────────────────┘
```

### **3. Issue Detail View**

When an issue is clicked:

```
┌─────────────────────────────────────────────────────────────┐
│ Issue Details                                             │
│                                                           │
│ Original Text:                                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ The Employee shall receive a salary of $X per year... │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                           │
│ Recommended Text:                                         │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ The Employee shall receive a salary of $85,000 per... │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                           │
│ Comment:                                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ The original text uses a placeholder '$X' which is... │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## User Workflow

### **For Legal Users:**

1. **Upload Document** → User uploads DOCX file
2. **Request Analysis** → "Please analyze this contract for legal issues"
3. **Review Results** → JSON viewer shows analysis on the right
4. **Click Apply Changes** → Document is edited with tracked changes
5. **Download Result** → Get edited DOCX with modifications

### **For Non-Legal Users:**

1. **Upload Document** → User uploads DOCX file
2. **Request Analysis** → "Please analyze this contract for legal issues"
3. **Review Results** → JSON viewer shows analysis (read-only)
4. **No Apply Button** → Only download option available

## Technical Implementation

### **Component Props**

```typescript
interface JsonViewerProps {
  analysisResult: LegalAnalysisResult;
  isReadonly?: boolean;
  onApplyChanges?: () => void;
  downloadUrl?: string;
  downloadFileName?: string;
}
```

### **State Management**

- **Selected Issue**: Currently selected issue for detailed view
- **Loading State**: Shows progress during document editing
- **User Permissions**: Determines if Apply Changes button is shown

### **Integration Points**

- **Chat API**: Receives analysis results from legal analysis tool
- **Document Editing**: Triggers editDocument tool when Apply Changes is clicked
- **Download API**: Provides download link for edited documents

## Benefits

### **1. Professional Interface**

- Clean, structured display of legal analysis
- Interactive issue selection and review
- Professional color coding and typography

### **2. User Control**

- Users can review all issues before applying changes
- Clear before/after text comparison
- Detailed explanations for each modification

### **3. Workflow Integration**

- Seamless integration with chat interface
- Automatic document editing and download
- Proper loading states and error handling

### **4. Legal Compliance**

- Maintains audit trail of changes
- Professional presentation suitable for legal work
- Clear documentation of modifications

This component provides a complete legal document review experience with professional-grade interface and functionality!
