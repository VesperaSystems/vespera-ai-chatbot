'use client';

import type { Attachment, UIMessage } from 'ai';
import type React from 'react';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  type ChangeEvent,
  memo,
} from 'react';
import { toast } from 'sonner';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';
import { checkUserMessageLimit } from '@/lib/db/queries';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { modelSupportsVision } from '@/lib/ai/models';

import { ArrowUpIcon, PaperclipIcon, StopIcon } from './icons';
import { PreviewAttachment } from './preview-attachment';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { SuggestedActions } from './suggested-actions';
import equal from 'fast-deep-equal';
import type { UseChatHelpers } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useScrollToBottom } from '@/hooks/use-scroll-to-bottom';
import type { VisibilityType } from './visibility-selector';

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  status,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
  selectedVisibilityType,
  selectedModelId,
}: {
  chatId: string;
  input: UseChatHelpers['input'];
  setInput: UseChatHelpers['setInput'];
  status: UseChatHelpers['status'];
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers['setMessages'];
  append: UseChatHelpers['append'];
  handleSubmit: UseChatHelpers['handleSubmit'];
  className?: string;
  selectedVisibilityType: VisibilityType;
  selectedModelId: string;
}) {
  const { data: session } = useSession();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { width } = useWindowSize();

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = '98px';
    }
  };

  const [localStorageInput, setLocalStorageInput] = useLocalStorage(
    'input',
    '',
  );

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      // Prefer DOM value over localStorage to handle hydration
      const finalValue = domValue || localStorageInput || '';
      setInput(finalValue);
      adjustHeight();
    }
    // Only run once after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalStorageInput(input);
  }, [input, setLocalStorageInput]);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    adjustHeight();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);

  const handleSubmitWithLimit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!session?.user?.id) {
      console.error('No user ID available');
      return;
    }

    // Check if this is a Legal tenant with document attachments and legal analysis request
    const isLegalTenant = session.user.tenantType === 'legal';
    const hasDocumentAttachments = attachments.some(
      (attachment) =>
        attachment.contentType?.includes('document') ||
        attachment.contentType?.includes('pdf') ||
        attachment.contentType?.includes('word') ||
        attachment.contentType?.includes('text') ||
        attachment.name?.toLowerCase().endsWith('.docx') ||
        attachment.name?.toLowerCase().endsWith('.doc') ||
        attachment.name?.toLowerCase().endsWith('.pdf') ||
        attachment.name?.toLowerCase().endsWith('.txt'),
    );
    const isLegalAnalysisRequest =
      input.toLowerCase().includes('legal') ||
      input.toLowerCase().includes('contract') ||
      input.toLowerCase().includes('agreement') ||
      input.toLowerCase().includes('clause') ||
      input.toLowerCase().includes('terms') ||
      input.toLowerCase().includes('liability') ||
      input.toLowerCase().includes('compliance');

    if (isLegalTenant && hasDocumentAttachments && isLegalAnalysisRequest) {
      console.log(
        '🚀 Legal tenant with legal document analysis request - redirecting immediately',
      );

      // Store the document data for the legal analysis editor
      const documentData = {
        analysisResult: null, // Will be populated by the analysis
        fileUrl: attachments[0].url,
        fileName: attachments[0].name,
      };

      sessionStorage.setItem('legalAnalysisData', JSON.stringify(documentData));

      // Redirect immediately to the legal analysis editor
      window.location.href = '/legal-analysis-editor';
      return;
    }

    try {
      const { canSend, remaining } = await checkUserMessageLimit(
        session.user.id,
      );

      if (!canSend) {
        toast.error(
          `Daily message limit reached. You have ${remaining} messages remaining.`,
        );
        return;
      }

      // Emit event to update message counter immediately
      console.log(
        'MultimodalInput: Dispatching message-sent event for user:',
        session.user.id,
      );
      window.dispatchEvent(
        new CustomEvent('message-sent', {
          detail: { userId: session.user.id },
        }),
      );

      // Include attachments in the submission
      handleSubmit(undefined, {
        experimental_attachments: attachments,
      });

      // Clear attachments after submission
      setAttachments([]);
      setLocalStorageInput('');
      resetHeight();

      if (width && width > 768) {
        textareaRef.current?.focus();
      }
    } catch (error) {
      console.error('Failed to check message limit:', error);
      // Fallback submission with attachments
      handleSubmit(undefined, {
        experimental_attachments: attachments,
      });
    }
  };

  const submitForm = useCallback(() => {
    // Check if this is a Legal tenant with document attachments and legal analysis request
    const isLegalTenant = session?.user?.tenantType === 'legal';
    const hasDocumentAttachments = attachments.some(
      (attachment) =>
        attachment.contentType?.includes('document') ||
        attachment.contentType?.includes('pdf') ||
        attachment.contentType?.includes('word') ||
        attachment.contentType?.includes('text') ||
        attachment.name?.toLowerCase().endsWith('.docx') ||
        attachment.name?.toLowerCase().endsWith('.doc') ||
        attachment.name?.toLowerCase().endsWith('.pdf') ||
        attachment.name?.toLowerCase().endsWith('.txt'),
    );
    const isLegalAnalysisRequest =
      input.toLowerCase().includes('legal') ||
      input.toLowerCase().includes('contract') ||
      input.toLowerCase().includes('agreement') ||
      input.toLowerCase().includes('clause') ||
      input.toLowerCase().includes('terms') ||
      input.toLowerCase().includes('liability') ||
      input.toLowerCase().includes('compliance');

    if (isLegalTenant && hasDocumentAttachments && isLegalAnalysisRequest) {
      console.log(
        '🚀 Legal tenant with legal document analysis request - redirecting immediately (submitForm)',
      );

      // Store the document data for the legal analysis editor
      const documentData = {
        analysisResult: null, // Will be populated by the analysis
        fileUrl: attachments[0].url,
        fileName: attachments[0].name,
      };

      sessionStorage.setItem('legalAnalysisData', JSON.stringify(documentData));

      // Redirect immediately to the legal analysis editor
      window.location.href = '/legal-analysis-editor';
      return;
    }

    window.history.replaceState({}, '', `/chat/${chatId}`);

    handleSubmit(undefined, {
      experimental_attachments: attachments,
    });

    setAttachments([]);
    setLocalStorageInput('');
    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [
    attachments,
    handleSubmit,
    setAttachments,
    setLocalStorageInput,
    width,
    chatId,
    session?.user?.tenantType,
    input,
  ]);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append(
      'metadata',
      JSON.stringify({
        name: file.name,
        folder: '/',
      }),
    );

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const { url, pathname, contentType } = data;

        return {
          url,
          name: file.name || pathname,
          contentType,
        };
      }
      const { error } = await response.json();
      toast.error(error);
    } catch (error) {
      toast.error('Failed to upload file, please try again!');
    }
  };

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      setUploadQueue(files.map((file) => file.name));

      try {
        const uploadPromises = files.map((file) => uploadFile(file));
        const uploadedAttachments = await Promise.all(uploadPromises);
        const successfullyUploadedAttachments = uploadedAttachments.filter(
          (attachment) => attachment !== undefined,
        );

        setAttachments((currentAttachments) => [
          ...currentAttachments,
          ...successfullyUploadedAttachments,
        ]);
      } catch (error) {
        console.error('Error uploading files!', error);
      } finally {
        setUploadQueue([]);
      }
    },
    [setAttachments],
  );

  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  useEffect(() => {
    if (status === 'submitted') {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  return (
    <div className="relative w-full flex flex-col gap-4">
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute left-1/2 bottom-28 -translate-x-1/2 z-50"
          >
            <Button
              data-testid="scroll-to-bottom-button"
              className="rounded-full"
              size="icon"
              variant="outline"
              onClick={(event) => {
                event.preventDefault();
                scrollToBottom();
              }}
            >
              <ArrowDown />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {messages.length === 0 && uploadQueue.length === 0 && (
        <SuggestedActions
          append={append}
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          attachments={attachments}
          handleSubmit={handleSubmit}
        />
      )}

      <input
        data-testid="file-input"
        type="file"
        className="fixed -top-4 -left-4 size-0.5 opacity-0 pointer-events-none"
        ref={fileInputRef}
        multiple
        accept=".jpg,.jpeg,.png,.webp,.docx,.doc,.txt,.pdf,image/*,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,application/pdf"
        onChange={handleFileChange}
        tabIndex={-1}
      />

      {(attachments.length > 0 || uploadQueue.length > 0) && (
        <div
          data-testid="attachments-preview"
          className="flex flex-row gap-2 overflow-x-scroll items-end"
        >
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
              isUploading={true}
            />
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmitWithLimit}
        className={cn(
          'flex flex-row gap-2 relative items-end w-full',
          className,
        )}
      >
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-row gap-2 w-full">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();

                  if (status !== 'ready') {
                    toast.error(
                      `Cannot send message: Model is currently ${status === 'streaming' ? 'generating a response' : 'processing'}. Please wait until it finishes.`,
                    );
                  } else {
                    submitForm();
                  }
                }
              }}
              placeholder="Message Vespera..."
              className="min-h-[98px] max-h-[300px] resize-none"
              disabled={status === 'streaming'}
            />
            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                size="icon"
                className="size-10"
                disabled={!input.trim() || status === 'streaming'}
              >
                <ArrowUpIcon />
              </Button>
              {status === 'streaming' ? (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="size-10"
                  onClick={stop}
                >
                  <StopIcon />
                </Button>
              ) : (
                modelSupportsVision(selectedModelId) && (
                  <Button
                    data-testid="attachments-button"
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-10"
                    onClick={(event) => {
                      event.preventDefault();
                      console.log('File attachment button clicked');
                      console.log(
                        'fileInputRef.current:',
                        fileInputRef.current,
                      );
                      console.log('selectedModelId:', selectedModelId);
                      console.log(
                        'modelSupportsVision:',
                        modelSupportsVision(selectedModelId),
                      );
                      fileInputRef.current?.click();
                    }}
                  >
                    <PaperclipIcon />
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export const MultimodalInput = memo(
  PureMultimodalInput,
  (prevProps, nextProps) => {
    if (prevProps.input !== nextProps.input) return false;
    if (prevProps.status !== nextProps.status) return false;
    if (!equal(prevProps.attachments, nextProps.attachments)) return false;
    if (prevProps.selectedVisibilityType !== nextProps.selectedVisibilityType)
      return false;
    if (prevProps.selectedModelId !== nextProps.selectedModelId) return false;

    return true;
  },
);
