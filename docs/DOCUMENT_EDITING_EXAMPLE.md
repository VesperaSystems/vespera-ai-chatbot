# Document Editing with Tracked Changes Example

## Overview

The document editing feature allows users to apply legal analysis results to the original DOCX file with tracked changes and comments. This creates a modified version of the document that shows exactly what changes were made and why.

## Workflow

### 1. **Legal Analysis First**

```
User: "Please analyze this employment agreement for legal issues"
AI: Uses analyzeDocument tool to identify legal problems
```

### 2. **Apply Changes to Document**

```
User: "Now apply these changes to the original document with tracked changes"
AI: Uses editDocument tool to create modified version
```

## Example Process

### **Step 1: Legal Analysis**

```json
{
  "document": "Employment Agreement",
  "issues": [
    {
      "id": "issue-1",
      "type": "ambiguous_compensation",
      "original_text": "The Employee shall receive a salary of $X per year, payable in accordance with the Company's standard payroll practices.",
      "recommended_text": "The Employee shall receive a salary of $85,000 per year, payable bi-weekly in accordance with the Company's standard payroll practices.",
      "comment": "The original text uses a placeholder '$X' which is ambiguous and unenforceable. Specific compensation amounts should be clearly stated to avoid disputes."
    },
    {
      "id": "issue-2",
      "type": "missing_termination_notice",
      "original_text": "Either party may terminate this Agreement at any time with or without cause.",
      "recommended_text": "Either party may terminate this Agreement with 30 days written notice, or immediately for cause as defined in Section 7.",
      "comment": "The original clause lacks specific notice requirements and definition of 'cause,' which could lead to legal disputes and potential wrongful termination claims."
    }
  ]
}
```

### **Step 2: Document Editing**

The `editDocument` tool takes this analysis and:

1. **Downloads the original DOCX file**
2. **Creates tracked changes** for each issue
3. **Adds comments** in the format: `"vesperaAI edit {id}: {comment}"`
4. **Saves a new version** with all modifications

### **Step 3: Console Logs**

```javascript
📝 Document Edit - Starting process
File URL: https://example.com/employment_agreement.docx
File Name: employment_agreement.docx
Issues to apply: 2

📝 Document Edit - Changes applied
Edited file saved to: /tmp/edited_employment_agreement_1704067200000.docx
Changes applied: 2
```

### **Step 4: Generated Document**

The edited document will contain:

#### **Tracked Changes Applied:**

**Change 1: Compensation Clause**

- **Original Text** (strikethrough): "The Employee shall receive a salary of $X per year..."
- **Recommended Text** (highlighted): "The Employee shall receive a salary of $85,000 per year..."
- **Comment**: "vesperaAI edit issue-1: The original text uses a placeholder '$X' which is ambiguous and unenforceable. Specific compensation amounts should be clearly stated to avoid disputes."

**Change 2: Termination Clause**

- **Original Text** (strikethrough): "Either party may terminate this Agreement at any time with or without cause."
- **Recommended Text** (highlighted): "Either party may terminate this Agreement with 30 days written notice, or immediately for cause as defined in Section 7."
- **Comment**: "vesperaAI edit issue-2: The original clause lacks specific notice requirements and definition of 'cause,' which could lead to legal disputes and potential wrongful termination claims."

## Technical Implementation

### **Tool Parameters**

```typescript
const editDocumentSchema = z.object({
  fileUrl: z.string().describe("URL of the original document file"),
  fileName: z.string().describe("Name of the original file"),
  analysisResult: z
    .object({
      document: z.string(),
      issues: z.array(
        z.object({
          id: z.string(),
          type: z.string(),
          original_text: z.string(),
          recommended_text: z.string(),
          comment: z.string(),
        })
      ),
    })
    .describe("Legal analysis result with issues to apply"),
});
```

### **Tracked Changes Format**

- **Deleted Text**: Red strikethrough (original problematic text)
- **Added Text**: Green highlight (recommended improved text)
- **Comments**: "vesperaAI edit {issue-id}: {detailed explanation}"

### **File Output**

- **Location**: Temporary directory with timestamp
- **Format**: DOCX with tracked changes enabled
- **Naming**: `edited_{original_name}_{timestamp}.docx`

## Usage Examples

### **Basic Workflow**

```
User: "Analyze this contract and then apply the changes"
AI:
1. Performs legal analysis using analyzeDocument
2. Applies changes using editDocument
3. Returns both analysis and edited document
```

### **Specific Request**

```
User: "Take the legal analysis results and create a tracked changes version"
AI: Uses editDocument tool with the analysis results
```

### **Review Process**

```
User: "Show me what changes were made"
AI: Displays edit summary with all applied changes
```

## Benefits

### **1. Professional Document Review**

- Maintains original document structure
- Shows exactly what was changed and why
- Provides audit trail of modifications

### **2. Legal Compliance**

- Clear documentation of changes
- Explanatory comments for each modification
- Professional formatting with tracked changes

### **3. User Control**

- Users can review all changes before accepting
- Clear before/after comparison
- Detailed explanations for each modification

### **4. Integration**

- Seamlessly works with legal analysis
- Maintains document integrity
- Professional output format

This feature provides a complete legal document review and editing workflow, from initial analysis to final tracked changes implementation!
