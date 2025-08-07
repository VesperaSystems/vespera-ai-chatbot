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

// Function to create true Word-compatible tracked changes
async function createDocumentWithTrueTrackedChanges(
  originalBuffer: ArrayBuffer,
  issues: LegalAnalysisIssue[],
  fileName: string,
): Promise<Buffer> {
  try {
    console.log('🔧 Creating document with true tracked changes...');

    // Load the original DOCX as a ZIP file
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(originalBuffer);

    // Enable tracked changes in document settings
    await enableTrackedChanges(zipContent);

    // Enable revision tracking in document properties
    await enableRevisionTracking(zipContent);

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

    // Enable revision tracking in document.xml
    await enableRevisionTrackingInDocument(document);

    // Ensure document has proper namespaces for tracked changes
    await ensureTrackedChangesNamespaces(document);

    // Ensure document has proper settings for tracked changes
    await ensureTrackedChangesSettings(zipContent);

    // Track successful changes
    let changesApplied = 0;
    const totalIssues = issues.length;

    // Process each issue and apply tracked changes
    for (const issue of issues) {
      console.log(
        `🔧 Processing issue: "${issue.original_text}" -> "${issue.recommended_text}"`,
      );

      const success = await applyTrackedChangeSpanningRuns(document, issue);
      if (success) {
        changesApplied++;
        console.log(`✅ Successfully applied tracked change for issue`);
      } else {
        console.log(`❌ Failed to apply tracked change for issue`);
      }
    }

    console.log(`📊 Applied ${changesApplied} out of ${totalIssues} changes`);

    // If no tracked changes were applied, fall back to simple text replacement
    if (changesApplied === 0) {
      console.log(
        '⚠️ No tracked changes applied, falling back to simple text replacement',
      );
      await applySimpleTextReplacement(document, issues);
    }

    // Add comments for all issues
    await addCommentsToDocument(zipContent, issues);

    // Link comments to text changes in the document
    await linkCommentsToDocument(document, issues);

    // Add test comment to header
    await addTestCommentToHeader(document, zipContent);

    // Update document relationships if comments were added
    if (issues.length > 0) {
      await updateDocumentRelationships(zipContent);
    }

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

    // Ensure proper XML structure for tracked changes
    const finalDocumentXml = updatedDocumentXml
      .replace(/<w:del([^>]*)>/g, '<w:del$1><w:r><w:rPr/></w:r>')
      .replace(/<w:ins([^>]*)>/g, '<w:ins$1><w:r><w:rPr/></w:r>');

    // Update the ZIP file
    zipContent.file('word/document.xml', finalDocumentXml);

    // Generate the new DOCX
    const newDocxBuffer = await zipContent.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    console.log('✅ Generated new DOCX buffer length:', newDocxBuffer.length);
    return newDocxBuffer;
  } catch (error) {
    console.error('Error creating document with true tracked changes:', error);
    throw error;
  }
}

// Function to enable revision tracking in document properties
async function enableRevisionTracking(zip: JSZip) {
  try {
    // Read or create core.xml (document properties)
    const coreXml = await zip.file('docProps/core.xml')?.async('string');
    let core: any;

    if (coreXml) {
      const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: false,
      });
      core = await parser.parseStringPromise(coreXml);
    } else {
      // Create new core structure
      core = {
        'cp:coreProperties': {
          $: {
            'xmlns:cp':
              'http://schemas.openxmlformats.org/package/2006/metadata/core-properties',
            'xmlns:dc': 'http://purl.org/dc/elements/1.1/',
            'xmlns:dcterms': 'http://purl.org/dc/terms/',
            'xmlns:dcmitype': 'http://purl.org/dc/dcmitype/',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          },
        },
      };
    }

    // Set revision tracking properties
    if (!core['cp:coreProperties']['cp:revision']) {
      core['cp:coreProperties']['cp:revision'] = '1';
    }

    // Convert back to XML
    const builder = new xml2js.Builder({
      renderOpts: { pretty: true, indent: '  ' },
    });
    const updatedCoreXml = builder.buildObject(core);

    // Update the ZIP file
    zip.file('docProps/core.xml', updatedCoreXml);
    console.log('✅ Enabled revision tracking in document properties');
  } catch (error) {
    console.error('Error enabling revision tracking:', error);
  }
}

// Function to ensure proper settings for tracked changes
async function ensureTrackedChangesSettings(zip: JSZip) {
  try {
    // Read or create settings.xml
    const settingsXml = await zip.file('word/settings.xml')?.async('string');
    let settings: any;

    if (settingsXml) {
      const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: false,
      });
      settings = await parser.parseStringPromise(settingsXml);
    } else {
      // Create new settings structure
      settings = {
        'w:settings': {
          $: {
            'xmlns:w':
              'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
          },
        },
      };
    }

    // Ensure tracked changes are enabled
    if (!settings['w:settings']['w:trackRevisions']) {
      settings['w:settings']['w:trackRevisions'] = {
        $: { 'w:val': 'true' },
      };
    }

    // Ensure revision view is set to show all
    if (!settings['w:settings']['w:revisionView']) {
      settings['w:settings']['w:revisionView'] = {
        $: { 'w:val': 'all' },
      };
    }

    // Convert back to XML
    const builder = new xml2js.Builder({
      renderOpts: { pretty: true, indent: '  ' },
    });
    const updatedSettingsXml = builder.buildObject(settings);

    // Update the ZIP file
    zip.file('word/settings.xml', updatedSettingsXml);
    console.log('✅ Ensured tracked changes settings');
  } catch (error) {
    console.error('Error ensuring tracked changes settings:', error);
  }
}

// Function to ensure proper namespaces for tracked changes
async function ensureTrackedChangesNamespaces(document: any) {
  try {
    // Ensure the document has the proper namespace for tracked changes
    if (!document['w:document'].$) {
      document['w:document'].$ = {};
    }

    // Add the Word namespace if not present
    if (!document['w:document'].$['xmlns:w']) {
      document['w:document'].$['xmlns:w'] =
        'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    }

    console.log('✅ Ensured proper namespaces for tracked changes');
  } catch (error) {
    console.error('Error ensuring tracked changes namespaces:', error);
  }
}

// Function to enable revision tracking in document.xml
async function enableRevisionTrackingInDocument(document: any) {
  try {
    // Ensure the document has proper revision tracking enabled
    if (!document['w:document']['w:body']['w:sectPr']) {
      document['w:document']['w:body']['w:sectPr'] = {};
    }

    // Add revision tracking properties to the document
    if (!document['w:document']['w:body']['w:sectPr']['w:revisionView']) {
      document['w:document']['w:body']['w:sectPr']['w:revisionView'] = {
        $: { 'w:val': 'all' },
      };
    }

    // Add revision tracking settings
    if (!document['w:document']['w:body']['w:sectPr']['w:trackRevisions']) {
      document['w:document']['w:body']['w:sectPr']['w:trackRevisions'] = {
        $: { 'w:val': 'true' },
      };
    }

    // Ensure the document has proper paragraph properties for tracked changes
    const paragraphs = document['w:document']['w:body']['w:p'] || [];
    for (const paragraph of paragraphs) {
      if (!paragraph['w:pPr']) {
        paragraph['w:pPr'] = {};
      }

      // Add revision tracking to paragraph properties
      if (!paragraph['w:pPr']['w:revisionView']) {
        paragraph['w:pPr']['w:revisionView'] = {
          $: { 'w:val': 'all' },
        };
      }
    }

    console.log('✅ Enabled revision tracking in document.xml');
  } catch (error) {
    console.error('Error enabling revision tracking in document:', error);
  }
}

// Function to enable tracked changes in document settings
async function enableTrackedChanges(zip: JSZip) {
  try {
    // Read or create settings.xml
    const settingsXml = await zip.file('word/settings.xml')?.async('string');
    let settings: any;

    if (settingsXml) {
      const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: false,
      });
      settings = await parser.parseStringPromise(settingsXml);
    } else {
      // Create new settings structure
      settings = {
        'w:settings': {
          $: {
            'xmlns:w':
              'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
          },
        },
      };
    }

    // Ensure tracked changes are enabled
    if (!settings['w:settings']['w:trackRevisions']) {
      settings['w:settings']['w:trackRevisions'] = {
        $: { 'w:val': 'true' },
      };
    }

    // Convert back to XML
    const builder = new xml2js.Builder({
      renderOpts: { pretty: true, indent: '  ' },
    });
    const updatedSettingsXml = builder.buildObject(settings);

    // Update the ZIP file
    zip.file('word/settings.xml', updatedSettingsXml);
    console.log('✅ Enabled tracked changes in document settings');
  } catch (error) {
    console.error('Error enabling tracked changes:', error);
  }
}

// Interface definitions for the improved function
interface Run {
  [key: string]: any;
}
interface Paragraph {
  'w:r': Run[] | Run;
  [key: string]: any;
}
interface DocumentBody {
  'w:document': {
    'w:body': {
      'w:p': Paragraph[];
    };
  };
}

// Revised function to correctly insert <w:del> and <w:ins> across multiple runs
async function applyTrackedChangeSpanningRuns(
  document: DocumentBody,
  issue: LegalAnalysisIssue,
): Promise<boolean> {
  try {
    console.log(
      `🔧 Applying tracked change: "${issue.original_text}" -> "${issue.recommended_text}"`,
    );

    const paragraphs = document['w:document']['w:body']['w:p'] || [];
    const flatText: string[] = [];
    const runRefs: {
      paragraphIndex: number;
      runIndex: number;
      offset: number;
      length: number;
    }[] = [];

    // Step 1: Flatten document text and map each character to its run
    for (let pi = 0; pi < paragraphs.length; pi++) {
      const p = paragraphs[pi];
      const runs = Array.isArray(p['w:r']) ? p['w:r'] : [p['w:r']];
      for (let ri = 0; ri < runs.length; ri++) {
        const run = runs[ri];
        const textElement = run['w:t'];
        const text =
          typeof textElement === 'string' ? textElement : textElement?._ || '';
        for (let i = 0; i < text.length; i++) {
          flatText.push(text[i]);
          runRefs.push({
            paragraphIndex: pi,
            runIndex: ri,
            offset: i,
            length: text.length,
          });
        }
      }
    }

    const docString = flatText.join('');
    const { original_text, recommended_text } = issue;
    const startIndex = docString.indexOf(original_text);

    if (startIndex === -1) {
      console.warn(
        `❌ Original text not found in document: "${original_text}"`,
      );
      console.log(`📄 Document text: "${docString}"`);
      return false;
    }

    const endIndex = startIndex + original_text.length;
    console.log(`✅ Found text at position ${startIndex}-${endIndex}`);

    // Step 2: Replace the runs that span this index range with <w:del> and <w:ins>
    const affected = runRefs.slice(startIndex, endIndex);

    if (affected.length === 0) return false;

    // Determine which paragraphs and runs are involved
    const first = affected[0];
    const last = affected[affected.length - 1];

    const para = paragraphs[first.paragraphIndex];
    const runs = Array.isArray(para['w:r']) ? para['w:r'] : [para['w:r']];

    // Create <w:del>
    const delTag = {
      'w:del': {
        $: {
          'w:author': 'VesperaAI',
          'w:date': new Date().toISOString(),
          'w:id': '1',
        },
        'w:r': [
          {
            'w:rPr': {},
            'w:t': {
              $: { 'xml:space': 'preserve' },
              _: original_text,
            },
          },
        ],
      },
    };

    // Create <w:ins>
    const insTag = {
      'w:ins': {
        $: {
          'w:author': 'VesperaAI',
          'w:date': new Date().toISOString(),
          'w:id': '2',
        },
        'w:r': [
          {
            'w:rPr': {},
            'w:t': {
              $: { 'xml:space': 'preserve' },
              _: recommended_text,
            },
          },
        ],
      },
    };

    // Replace affected runs with deletion and insertion elements
    const runIndices = [...new Set(affected.map((a) => a.runIndex))];
    const firstRun = runIndices[0];
    const lastRun = runIndices[runIndices.length - 1];
    const before = runs.slice(0, firstRun);
    const after = runs.slice(lastRun + 1);

    const newRuns = [...before, delTag, insTag, ...after];

    para['w:r'] = newRuns;
    console.log(
      '✅ Successfully applied tracked changes spanning multiple runs',
    );
    return true;
  } catch (error) {
    console.error('Error applying tracked change spanning runs:', error);
    return false;
  }
}

// Function to apply tracked changes to the document XML (legacy text-based approach)
async function applyTrackedChangeToDocument(
  document: any,
  issue: LegalAnalysisIssue,
): Promise<boolean> {
  try {
    const body = document['w:document']['w:body'];
    const paragraphs = body['w:p'] || [];

    // Find the paragraph containing the original text
    for (const paragraph of paragraphs) {
      const runs = Array.isArray(paragraph['w:r'])
        ? paragraph['w:r']
        : [paragraph['w:r']];

      for (let i = 0; i < runs.length; i++) {
        const run = runs[i];
        const textElement = run['w:t'];

        // Handle both string and object text elements
        const textContent =
          typeof textElement === 'string' ? textElement : textElement?._;

        // Try exact match first
        if (textContent?.includes(issue.original_text)) {
          // Found the text to replace
          console.log(`✅ Found exact match: "${issue.original_text}"`);
          console.log(`📄 In document text: "${textContent}"`);

          // Create deletion element with proper Word XML structure
          const deletionElement = {
            'w:del': {
              $: {
                'w:author': 'AI Legal Assistant',
                'w:date': new Date().toISOString(),
                'w:id': '0',
              },
              'w:r': {
                'w:t': {
                  $: { 'xml:space': 'preserve' },
                  _: issue.original_text,
                },
              },
            },
          };

          // Create insertion element with proper Word XML structure
          const insertionElement = {
            'w:ins': {
              $: {
                'w:author': 'AI Legal Assistant',
                'w:date': new Date().toISOString(),
                'w:id': '1',
              },
              'w:r': {
                'w:t': {
                  $: { 'xml:space': 'preserve' },
                  _: issue.recommended_text,
                },
              },
            },
          };

          // Replace the original run with deletion and insertion
          runs.splice(i, 1, deletionElement, insertionElement);
          return true; // Successfully applied change
        } else if (textContent && issue.original_text) {
          // Try to find partial matches
          const originalWords = issue.original_text
            .split(' ')
            .filter((w: string) => w.length > 2);
          const documentWords = textContent
            .split(' ')
            .filter((w: string) => w.length > 2);

          const matchingWords = originalWords.filter((word: string) =>
            documentWords.some(
              (docWord: string) =>
                docWord.toLowerCase().includes(word.toLowerCase()) ||
                word.toLowerCase().includes(docWord.toLowerCase()),
            ),
          );

          if (matchingWords.length >= Math.ceil(originalWords.length * 0.7)) {
            console.log(`⚠️ Found partial match for: "${issue.original_text}"`);
            console.log(`📄 Matching words: ${matchingWords.join(', ')}`);
            console.log(`📄 In document text: "${textContent}"`);

            // For now, let's proceed with the partial match
            console.log(`✅ Proceeding with partial match`);

            // Create deletion element with proper Word XML structure
            const deletionElement = {
              'w:del': {
                $: {
                  'w:author': 'AI Legal Assistant',
                  'w:date': new Date().toISOString(),
                  'w:id': '0',
                },
                'w:r': {
                  'w:t': {
                    $: { 'xml:space': 'preserve' },
                    _: issue.original_text,
                  },
                },
              },
            };

            // Create insertion element with proper Word XML structure
            const insertionElement = {
              'w:ins': {
                $: {
                  'w:author': 'AI Legal Assistant',
                  'w:date': new Date().toISOString(),
                  'w:id': '1',
                },
                'w:r': {
                  'w:t': {
                    $: { 'xml:space': 'preserve' },
                    _: issue.recommended_text,
                  },
                },
              },
            };

            // Replace the original run with deletion and insertion
            runs.splice(i, 1, deletionElement, insertionElement);
            return true; // Successfully applied change
          } else {
            console.log(`❌ No match found for: "${issue.original_text}"`);
            console.log(`📄 Document text: "${textContent}"`);
            continue; // Skip this issue if no match found
          }
        } else {
          console.log(`❌ No text content to search in`);
          continue;
        }
      }
    }
    return false; // No changes applied
  } catch (error) {
    console.error('Error applying tracked change:', error);
    return false;
  }
}

// Function to apply simple text replacement as fallback
async function applySimpleTextReplacement(
  document: any,
  issues: LegalAnalysisIssue[],
) {
  try {
    console.log('🔄 Applying simple text replacement...');
    const body = document['w:document']['w:body'];
    const paragraphs = body['w:p'] || [];

    for (const issue of issues) {
      console.log(`📝 Looking for: "${issue.original_text}"`);

      for (const paragraph of paragraphs) {
        const runs = Array.isArray(paragraph['w:r'])
          ? paragraph['w:r']
          : [paragraph['w:r']];

        for (const run of runs) {
          const textElement = run['w:t'];
          const textContent =
            typeof textElement === 'string' ? textElement : textElement?._;

          if (textContent?.includes(issue.original_text)) {
            console.log(`✅ Found text to replace: "${issue.original_text}"`);

            // Simple text replacement
            if (typeof textElement === 'string') {
              run['w:t'] = textContent.replace(
                issue.original_text,
                issue.recommended_text,
              );
            } else if (textElement?._) {
              textElement._ = textElement._.replace(
                issue.original_text,
                issue.recommended_text,
              );
            }
            break;
          }
        }
      }
    }
    console.log('✅ Simple text replacement completed');
  } catch (error) {
    console.error('Error applying simple text replacement:', error);
  }
}

// Function to add comments to the document
async function addCommentsToDocument(zip: JSZip, issues: LegalAnalysisIssue[]) {
  try {
    // Read or create comments.xml
    const commentsXml = await zip.file('word/comments.xml')?.async('string');
    let comments: any;

    if (commentsXml) {
      const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: false,
      });
      comments = await parser.parseStringPromise(commentsXml);
    } else {
      // Create new comments structure with proper namespaces
      comments = {
        'w:comments': {
          $: {
            'xmlns:w':
              'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
          },
          'w:comment': [],
        },
      };
    }

    // Add comments for each issue
    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      const comment = {
        $: {
          'w:id': (i + 1).toString(),
          'w:author': 'VesperaAI',
          'w:date': new Date().toISOString(),
        },
        'w:p': {
          'w:r': {
            'w:t': {
              $: { 'xml:space': 'preserve' },
              _: `VesperaAI Legal Review - ${issue.type}: ${issue.comment}`,
            },
          },
        },
      };

      comments['w:comments']['w:comment'].push(comment);
    }

    // Convert comments back to XML
    const builder = new xml2js.Builder({
      renderOpts: {
        pretty: true,
        indent: '  ',
        newline: '\n',
      },
      xmldec: { version: '1.0', encoding: 'UTF-8' },
    });
    const updatedCommentsXml = builder.buildObject(comments);

    // Add comments.xml to the ZIP
    zip.file('word/comments.xml', updatedCommentsXml);
  } catch (error) {
    console.error('Error adding comments:', error);
    throw error;
  }
}

// Function to add test comment to header
async function addTestCommentToHeader(document: any, zip: JSZip) {
  try {
    console.log('🔧 Adding test comment to header...');

    // Find the header in the document
    const body = document['w:document']['w:body'];
    const paragraphs = body['w:p'] || [];

    // Look for a paragraph that might be a header (contains "Employment Agreement")
    for (const paragraph of paragraphs) {
      const runs = Array.isArray(paragraph['w:r'])
        ? paragraph['w:r']
        : [paragraph['w:r']];

      for (const run of runs) {
        const textElement = run['w:t'];
        const textContent =
          typeof textElement === 'string' ? textElement : textElement?._;

        if (textContent?.includes('Employment Agreement')) {
          console.log('✅ Found header: "Employment Agreement"');

          // Add comment reference to this run
          run['w:commentRangeStart'] = {
            $: {
              'w:id': '999',
            },
          };

          run['w:commentRangeEnd'] = {
            $: {
              'w:id': '999',
            },
          };

          // Add the comment to comments.xml
          await addCommentToComments(
            zip,
            '999',
            'VesperaAI: This entire document has been reviewed and edited by AI for legal compliance and clarity.',
          );

          console.log('✅ Added test comment to header');
          return;
        }
      }
    }

    console.log('⚠️ Could not find "Employment Agreement" header');
  } catch (error) {
    console.error('Error adding test comment to header:', error);
  }
}

// Function to add a comment to comments.xml
async function addCommentToComments(
  zip: JSZip,
  commentId: string,
  commentText: string,
) {
  try {
    // Read or create comments.xml
    const commentsXml = await zip.file('word/comments.xml')?.async('string');
    let comments: any;

    if (commentsXml) {
      const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: false,
      });
      comments = await parser.parseStringPromise(commentsXml);
    } else {
      // Create new comments structure
      comments = {
        'w:comments': {
          $: {
            'xmlns:w':
              'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
          },
          'w:comment': [],
        },
      };
    }

    // Add the comment
    const comment = {
      $: {
        'w:id': commentId,
        'w:author': 'VesperaAI',
        'w:date': new Date().toISOString(),
      },
      'w:p': {
        'w:r': {
          'w:t': {
            $: { 'xml:space': 'preserve' },
            _: commentText,
          },
        },
      },
    };

    comments['w:comments']['w:comment'].push(comment);

    // Convert comments back to XML
    const builder = new xml2js.Builder({
      renderOpts: {
        pretty: true,
        indent: '  ',
        newline: '\n',
      },
      xmldec: { version: '1.0', encoding: 'UTF-8' },
    });
    const updatedCommentsXml = builder.buildObject(comments);

    // Add comments.xml to the ZIP
    zip.file('word/comments.xml', updatedCommentsXml);
    console.log('✅ Added comment to comments.xml');
  } catch (error) {
    console.error('Error adding comment to comments.xml:', error);
  }
}

// Function to link comments to text changes in the document
async function linkCommentsToDocument(
  document: any,
  issues: LegalAnalysisIssue[],
) {
  try {
    console.log('🔗 Linking comments to document text...');
    const body = document['w:document']['w:body'];
    const paragraphs = body['w:p'] || [];

    for (let issueIndex = 0; issueIndex < issues.length; issueIndex++) {
      const issue = issues[issueIndex];
      const commentId = (issueIndex + 1).toString();

      // Find the paragraph containing the original text
      for (const paragraph of paragraphs) {
        const runs = Array.isArray(paragraph['w:r'])
          ? paragraph['w:r']
          : [paragraph['w:r']];

        for (const run of runs) {
          const textElement = run['w:t'];
          const textContent =
            typeof textElement === 'string' ? textElement : textElement?._;

          if (textContent?.includes(issue.original_text)) {
            console.log(
              `🔗 Linking comment ${commentId} to text: "${issue.original_text}"`,
            );

            // Add comment reference to the run
            if (!run['w:commentRangeStart']) {
              run['w:commentRangeStart'] = {
                $: {
                  'w:id': commentId,
                },
              };
            }

            if (!run['w:commentRangeEnd']) {
              run['w:commentRangeEnd'] = {
                $: {
                  'w:id': commentId,
                },
              };
            }

            break;
          }
        }
      }
    }
    console.log('✅ Comments linked to document text');
  } catch (error) {
    console.error('Error linking comments to document:', error);
  }
}

// Function to update document relationships to include comments
async function updateDocumentRelationships(zip: JSZip) {
  try {
    // Read or create _rels/document.xml.rels
    const relsXml = await zip
      .file('word/_rels/document.xml.rels')
      ?.async('string');
    let relationships: any;

    if (relsXml) {
      const parser = new xml2js.Parser({
        explicitArray: false,
        mergeAttrs: false,
      });
      relationships = await parser.parseStringPromise(relsXml);
    } else {
      // Create new relationships structure
      relationships = {
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
    const relationshipsList = relationships.Relationships.Relationship;
    const existingCommentRel = relationshipsList?.find(
      (rel: any) => rel.$.Target === 'comments.xml',
    );

    if (!existingCommentRel) {
      // Add comments relationship
      const commentRelationship = {
        $: {
          Id: `rId${relationshipsList?.length + 1 || 1}`,
          Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments',
          Target: 'comments.xml',
        },
      };

      if (!relationshipsList) {
        relationships.Relationships.Relationship = [];
      }
      relationships.Relationships.Relationship.push(commentRelationship);
    }

    // Convert relationships back to XML
    const builder = new xml2js.Builder({
      renderOpts: { pretty: true, indent: '  ' },
    });
    const updatedRelsXml = builder.buildObject(relationships);

    // Add relationships file to the ZIP
    zip.file('word/_rels/document.xml.rels', updatedRelsXml);
  } catch (error) {
    console.error('Error updating document relationships:', error);
    throw error;
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
    console.log('🔧 Starting document editing with true tracked changes...');

    // Download the original file
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    const originalBuffer = await response.arrayBuffer();

    // Create document with true tracked changes
    const modifiedBuffer = await createDocumentWithTrueTrackedChanges(
      originalBuffer,
      issues,
      fileName,
    );

    // Save the modified document
    const tempDir = tmpdir();
    const editedFileName = `edited_${fileName.replace(/\.[^/.]+$/, '')}_${Date.now()}.docx`;
    const editedFilePath = join(tempDir, editedFileName);
    await writeFile(editedFilePath, modifiedBuffer);

    console.log('✅ Document edited with true tracked changes successfully');

    return {
      success: true,
      message: 'Document edited with true tracked changes',
      downloadUrl: `/api/download/edited-document?path=${encodeURIComponent(editedFileName)}&name=${encodeURIComponent(editedFileName)}`,
      downloadFileName: editedFileName,
    };
  } catch (error) {
    console.error('❌ Error editing document:', error);
    throw new Error('Failed to edit document with tracked changes');
  }
}
