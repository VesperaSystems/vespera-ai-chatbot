# JSON Viewer Integration Test

## Overview

This test verifies that the JSON viewer component is properly integrated into the chat system and displays legal analysis results correctly.

## Test Steps

### 1. **Upload a Document**

1. Navigate to the chat interface
2. Ensure you're using a vision-supporting model (GPT-4 or GPT-4 with Reasoning)
3. Click the paperclip button to upload a DOCX file
4. Verify the file uploads successfully

### 2. **Request Legal Analysis**

1. In the chat, type: "Please analyze this document for legal issues"
2. Send the message
3. Wait for the AI to process the document

### 3. **Verify JSON Viewer Appears**

1. Check that a new artifact panel opens on the right side
2. Verify the title shows "Legal Analysis: [filename]"
3. Confirm the JSON viewer displays with:
   - Document information
   - List of legal issues found
   - Issue details with original vs recommended text
   - Apply Changes button (for legal users)
   - Download button (after changes applied)

### 4. **Test Interactive Features**

1. **Click on Issues**: Click different issues to see detailed views
2. **Apply Changes**: Click "Apply Changes to Document" button
3. **Download**: Verify download link appears after applying changes

### 5. **Test User Permissions**

1. **Legal Users**: Should see "Apply Changes" button
2. **Non-Legal Users**: Should see read-only view (no Apply Changes button)

## Expected Behavior

### ✅ **Success Indicators**

- JSON viewer opens automatically when legal analysis completes
- Issues are displayed in an organized, clickable list
- Original and recommended text are clearly differentiated
- Apply Changes button is visible for authorized users
- Download functionality works after applying changes

### ❌ **Failure Indicators**

- No artifact panel opens after analysis
- JSON viewer shows "No Analysis Results" message
- Apply Changes button doesn't work
- Download link doesn't appear

## Debug Information

### Console Logs

When the analysis runs, you should see:

```
📋 Legal Analysis - Starting process
📋 Legal Analysis - Extracted text length: [number]
📋 Legal Analysis - OpenAI Response: [JSON]
📋 Legal Analysis - Final Result: [JSON]
```

### Network Requests

- File upload to `/api/files/upload`
- Chat request to `/api/chat`
- Download request to `/api/download/edited-document`

## Troubleshooting

### Issue 1: No JSON Viewer Appears

**Check**:

- Is the model vision-supporting? (GPT-4 or GPT-4 with Reasoning)
- Are there any console errors?
- Is the file upload successful?

### Issue 2: JSON Viewer Shows "No Analysis Results"

**Check**:

- Did the AI actually perform legal analysis?
- Are there any errors in the analysis tool?
- Is the analysis result properly formatted?

### Issue 3: Apply Changes Button Not Working

**Check**:

- Are you logged in as a legal user?
- Is the editDocument tool properly configured?
- Are there any console errors when clicking the button?

### Issue 4: Download Link Not Appearing

**Check**:

- Were changes successfully applied?
- Is the download API endpoint working?
- Are there any network errors?

## Technical Implementation

### Artifact System Integration

- ✅ JSON artifact registered in `artifactDefinitions`
- ✅ Data stream handler updated for new stream part types
- ✅ Analyze document tool sends JSON data
- ✅ Edit document tool sends download info

### Component Integration

- ✅ JsonViewer component created and exported
- ✅ JSON artifact content renders JsonViewer
- ✅ Proper error handling for missing data

### Stream Part Types

- ✅ `json-data`: Sends analysis result
- ✅ `download-info`: Sends download URL and filename
- ✅ `readonly-flag`: Sets user permissions

## Test Results

| Test Case              | Status | Notes        |
| ---------------------- | ------ | ------------ |
| File Upload            | ⏳     | To be tested |
| Legal Analysis Request | ⏳     | To be tested |
| JSON Viewer Display    | ⏳     | To be tested |
| Interactive Features   | ⏳     | To be tested |
| User Permissions       | ⏳     | To be tested |
| Download Functionality | ⏳     | To be tested |

## Next Steps

1. **Run the test**: Follow the test steps above
2. **Report results**: Document any issues found
3. **Fix issues**: Address any problems identified
4. **Verify end-to-end**: Test complete workflow from upload to download
