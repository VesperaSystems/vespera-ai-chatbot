import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import * as xml2js from 'xml2js';
import JSZip from 'jszip';

interface LegalAnalysisIssue {
  id: string;
  type: string;
  original_text: string;
  recommended_text: string;
  comment: string;
  position: {
    start: number;
    end: number;
  };
}

// Function to create document with comments
async function createDocumentWithComments(
  originalBuffer: ArrayBuffer,
  issues: LegalAnalysisIssue[],
  fileName: string,
): Promise<Buffer> {
  console.log('🔧 Starting document editing with comments:', issues.length);
  issues.forEach((issue, index) => {
    console.log(
      `Issue ${index + 1}: "${issue.original_text}" -> "${issue.recommended_text}"`,
    );
  });
  try {
    console.log('🔧 Creating document with comments...');

    // Load the original DOCX as a ZIP file
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(originalBuffer);

    // Read the document.xml file
    const documentXml = await zipContent
      .file('word/document.xml')
      ?.async('string');
    if (!documentXml) {
      throw new Error('Could not read document.xml from DOCX');
    }

    console.log('📄 Original document.xml length:', documentXml.length);

    // Parse the XML with proper options
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: false,
      explicitChildren: false,
    });
    const document = await parser.parseStringPromise(documentXml);

    // Track successful changes
    let changesApplied = 0;
    const totalIssues = issues.length;
    const comments: any[] = [];

    // Process each issue and apply comments
    for (const issue of issues) {
      console.log(
        `🔧 Processing issue: "${issue.original_text}" -> "${issue.recommended_text}"`,
      );

      const success = await addCommentToDocument(document, issue, comments);
      if (success) {
        changesApplied++;
        console.log(`✅ Successfully applied comment for issue`);
      } else {
        console.log(`❌ Failed to apply comment for issue`);
      }
    }

    console.log(`📊 Applied ${changesApplied} out of ${totalIssues} comments`);

    // Convert back to XML with proper options
    const builder = new xml2js.Builder({
      renderOpts: {
        pretty: true,
        indent: '  ',
        newline: '\n',
      },
      xmldec: { version: '1.0', encoding: 'UTF-8' },
    });

    const updatedDocumentXml = builder.buildObject(document);
    console.log('📄 Updated document.xml length:', updatedDocumentXml.length);

    // Update the ZIP file with the properly structured XML
    zipContent.file('word/document.xml', updatedDocumentXml);

    // Add comments.xml if comments were added
    if (comments.length > 0) {
      const commentsXml = createCommentsXml(comments);
      zipContent.file('word/comments.xml', commentsXml);
      console.log('✅ Added comments.xml to document');

      // Update document.xml.rels to include comments relationship
      await updateDocumentRels(zipContent);
    }

    // Generate the new DOCX
    const newDocxBuffer = await zipContent.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    console.log('✅ Generated new DOCX buffer length:', newDocxBuffer.length);
    return newDocxBuffer;
  } catch (error) {
    console.error('Error creating document with comments:', error);
    throw error;
  }
}

// Function to create proper comments.xml structure
function createCommentsXml(comments: any[]): string {
  const commentsStructure = {
    'w:comments': {
      $: {
        'xmlns:w':
          'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
        'xmlns:mc':
          'http://schemas.openxmlformats.org/markup-compatibility/2006',
        'mc:Ignorable': 'w14 wp14',
      },
      'w:comment': comments,
    },
  };

  const builder = new xml2js.Builder({
    renderOpts: {
      pretty: true,
      indent: '  ',
      newline: '\n',
    },
    xmldec: { version: '1.0', encoding: 'UTF-8' },
  });

  return builder.buildObject(commentsStructure);
}

// Function to update document.xml.rels to include comments relationship
async function updateDocumentRels(zip: JSZip) {
  try {
    // Read existing rels file or create new one
    const relsXml = await zip
      .file('word/_rels/document.xml.rels')
      ?.async('string');
    let rels: any;

    if (relsXml) {
      const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: false,
      });
      rels = await parser.parseStringPromise(relsXml);
    } else {
      // Create new rels structure
      rels = {
        Relationships: {
          $: {
            xmlns:
              'http://schemas.openxmlformats.org/package/2006/relationships',
          },
          Relationship: [],
        },
      };
    }

    // Check if comments relationship already exists
    const existingCommentsRel = rels.Relationships.Relationship?.find(
      (rel: any) => rel.$.Target === 'comments.xml',
    );

    if (!existingCommentsRel) {
      // Add comments relationship
      if (!rels.Relationships.Relationship) {
        rels.Relationships.Relationship = [];
      }

      const commentsRel = {
        $: {
          Id: `rId${Date.now()}`,
          Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments',
          Target: 'comments.xml',
        },
      };

      rels.Relationships.Relationship.push(commentsRel);
    }

    // Convert back to XML
    const builder = new xml2js.Builder({
      renderOpts: { pretty: true, indent: '  ' },
    });
    const updatedRelsXml = builder.buildObject(rels);

    // Update the ZIP file
    zip.file('word/_rels/document.xml.rels', updatedRelsXml);
    console.log('✅ Updated document.xml.rels with comments relationship');
  } catch (error) {
    console.error('Error updating document rels:', error);
  }
}

// Simplified function to add comments to document
async function addCommentToDocument(
  document: any,
  issue: LegalAnalysisIssue,
  comments: any[],
): Promise<boolean> {
  try {
    console.log(
      `🗨️ Adding comment: "${issue.original_text}" -> "${issue.recommended_text}"`,
    );

    const body = document['w:document']['w:body'];
    const paragraphs = body['w:p'] || [];

    // Find the paragraph containing the original text
    for (let paraIndex = 0; paraIndex < paragraphs.length; paraIndex++) {
      const paragraph = paragraphs[paraIndex];
      const runs = Array.isArray(paragraph['w:r'])
        ? paragraph['w:r']
        : [paragraph['w:r']];

      for (let runIndex = 0; runIndex < runs.length; runIndex++) {
        const run = runs[runIndex];
        const textElement = run['w:t'];

        // Handle both string and object text elements
        const textContent =
          typeof textElement === 'string' ? textElement : textElement?._;

        if (textContent?.includes(issue.original_text)) {
          console.log(`✅ Found text to comment: "${issue.original_text}"`);
          console.log(`📄 In document text: "${textContent}"`);

          const commentId = Math.floor(Math.random() * 10000).toString();
          const commentText = `VesperaAI has identified a ${issue.type} and suggests changing this line to: \"${issue.recommended_text}\"\n\n${issue.comment}`;

          // Create comment range start
          const commentRangeStart = {
            'w:commentRangeStart': { $: { 'w:id': commentId } },
          };

          // Create comment range end
          const commentRangeEnd = {
            'w:commentRangeEnd': { $: { 'w:id': commentId } },
          };

          // Create comment reference
          const commentReference = {
            'w:r': {
              'w:rPr': {},
              'w:commentReference': { $: { 'w:id': commentId } },
            },
          };

          // Split the text around the original text
          const beforeText = textContent.substring(
            0,
            textContent.indexOf(issue.original_text),
          );
          const afterText = textContent.substring(
            textContent.indexOf(issue.original_text) +
              issue.original_text.length,
          );

          // Create new runs array
          const newRuns = [];

          // Add text before the comment
          if (beforeText) {
            newRuns.push({
              'w:rPr': run['w:rPr'] || {},
              'w:t': { $: { 'xml:space': 'preserve' }, _: beforeText },
            });
          }

          // Add comment range start
          newRuns.push(commentRangeStart);

          // Add the original text (this will be commented)
          newRuns.push({
            'w:rPr': run['w:rPr'] || {},
            'w:t': { $: { 'xml:space': 'preserve' }, _: issue.original_text },
          });

          // Add comment range end
          newRuns.push(commentRangeEnd);

          // Add comment reference
          newRuns.push(commentReference);

          // Add text after the comment
          if (afterText) {
            newRuns.push({
              'w:rPr': run['w:rPr'] || {},
              'w:t': { $: { 'xml:space': 'preserve' }, _: afterText },
            });
          }

          // Replace the original run with the new runs
          runs.splice(runIndex, 1, ...newRuns);
          paragraph['w:r'] = runs;

          // Add comment to the comments array
          comments.push({
            $: {
              'w:author': 'VesperaAI',
              'w:initials': 'VAI',
              'w:date': new Date().toISOString(),
              'w:id': commentId,
            },
            'w:p': {
              'w:pPr': {},
              'w:r': {
                'w:rPr': {},
                'w:t': commentText,
              },
            },
          });

          console.log(`✅ Successfully added comment for issue`);
          return true;
        }
      }
    }

    console.warn(`❌ Could not find "${issue.original_text}" in document`);
    return false;
  } catch (error) {
    console.error('❌ Error adding comment for issue:', error);
    return false;
  }
}

export async function editDocument({
  fileUrl,
  fileName,
  issues,
}: {
  fileUrl: string;
  fileName: string;
  issues: LegalAnalysisIssue[];
}) {
  try {
    console.log('🔧 Starting document editing with comments...');

    // Download the original file
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    const originalBuffer = await response.arrayBuffer();

    // Create document with comments
    const modifiedBuffer = await createDocumentWithComments(
      originalBuffer,
      issues,
      fileName,
    );

    // Save the modified document
    const tempDir = tmpdir();
    const editedFileName = `edited_${fileName.replace(/\.[^/.]+$/, '')}_${Date.now()}.docx`;
    const editedFilePath = join(tempDir, editedFileName);
    await writeFile(editedFilePath, modifiedBuffer);

    console.log('✅ Document edited with comments successfully');

    return {
      success: true,
      message: 'Document edited with comments',
      downloadUrl: `/api/download/edited-document?path=${encodeURIComponent(editedFileName)}&name=${encodeURIComponent(editedFileName)}`,
      downloadFileName: editedFileName,
    };
  } catch (error) {
    console.error('❌ Error editing document:', error);
    throw new Error('Failed to edit document with comments');
  }
}
