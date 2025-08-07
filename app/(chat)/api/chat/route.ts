import {
  appendClientMessage,
  appendResponseMessages,
  createDataStream,
  smoothStream,
  streamText,
} from 'ai';
import { auth } from '@/app/(auth)/auth';
import type { RequestHints } from '@/lib/ai/prompts';
import { getTenantSystemPrompt } from '@/lib/ai/tenant-prompts';
import {
  createStreamId,
  deleteChatById,
  getChatById,
  getMessageCountByUserId,
  getMessagesByChatId,
  getStreamIdsByChatId,
  incrementUserMessageCount,
  saveChat,
  saveMessages,
  updateChatModel,
} from '@/lib/db/queries';
import { generateUUID, getTrailingMessageId } from '@/lib/utils';
import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { createChart } from '@/lib/ai/tools/create-chart';
import { analyzeDocument } from '@/lib/ai/tools/analyze-document';
import { extractDocumentText } from '@/lib/ai/tools/extract-document-text';
import { editDocument } from '@/lib/ai/tools/edit-document';
import type { DataStreamWriter } from 'ai';
import { isProductionEnvironment } from '@/lib/constants';
import { myProvider } from '@/lib/ai/providers';
import { getEntitlements } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { geolocation } from '@vercel/functions';
import type { Chat } from '@/lib/db/schema';

export const maxDuration = 60;

// Resumable streams are disabled for now
// let globalStreamContext: ResumableStreamContext | null = null;

function getStreamContext() {
  // Resumable streams are disabled for now
  console.log(' > Resumable streams are disabled');
  return null;
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    console.log(
      '🔍 Received request body in /api/chat:',
      JSON.stringify(json, null, 2),
    );
    requestBody = postRequestBodySchema.parse(json);
  } catch (error) {
    console.error('❌ Request body validation failed:', error);
    return new Response('Error: Invalid request body format', { status: 400 });
  }

  try {
    const { id, message, selectedChatModel, selectedVisibilityType } =
      requestBody;

    const session = await auth();

    if (!session?.user) {
      return new Response('Error: User not authenticated', { status: 401 });
    }

    const subscriptionType = session.user.subscriptionType;

    const messageCount = await getMessageCountByUserId({
      id: session.user.id,
      differenceInHours: 24,
    });

    const entitlementsMap = await getEntitlements();
    const entitlements = entitlementsMap[subscriptionType];

    if (!entitlements) {
      return new Response(
        JSON.stringify({
          error: 'Invalid subscription type',
          message: 'Please contact support to resolve this issue.',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    if (
      entitlements.maxMessagesPerDay !== -1 &&
      messageCount > entitlements.maxMessagesPerDay
    ) {
      return new Response(
        JSON.stringify({
          error:
            'You have exceeded your maximum number of messages for the day!',
          message:
            'Please try again later or upgrade your subscription to continue chatting.',
          link: '/subscription',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const chat = await getChatById({ id }).catch((error) => {
      console.error('Error fetching chat:', error);
      return new Response(
        JSON.stringify({
          error: 'Unable to load chat',
          message:
            'We encountered an issue loading your chat. Redirecting to a new chat...',
          redirect: '/',
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
    });

    if (chat instanceof Response) {
      return chat;
    }

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      console.log('🔧 Creating new chat:', {
        id,
        userId: session.user.id,
        title,
        visibility: selectedVisibilityType,
        model: selectedChatModel,
      });

      try {
        await saveChat({
          id,
          userId: session.user.id,
          title,
          visibility: selectedVisibilityType,
          model: selectedChatModel,
          tenantType: session.user.tenantType,
        });
        console.log('✅ Chat created successfully');
      } catch (error) {
        console.error('❌ Failed to create chat:', error);
        return new Response(
          JSON.stringify({
            error: 'Failed to create chat',
            message: 'Unable to create a new chat session.',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
      }
    } else {
      console.log('🔧 Using existing chat:', {
        id,
        userId: chat.userId,
        model: chat.model,
      });
      if (chat.userId !== session.user.id) {
        return new Response('Error: Access denied to this chat', {
          status: 403,
        });
      }
      if (chat.model !== selectedChatModel) {
        await updateChatModel({ id, model: selectedChatModel });
      }
    }

    const previousMessages = await getMessagesByChatId({ id });

    // Filter out document attachments that OpenAI doesn't support
    const documentAttachments =
      message.experimental_attachments?.filter(
        (attachment) =>
          attachment.contentType ===
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          attachment.contentType === 'application/msword' ||
          attachment.contentType === 'application/pdf' ||
          attachment.contentType === 'text/plain',
      ) || [];

    const imageAttachments =
      message.experimental_attachments?.filter(
        (attachment) =>
          attachment.contentType === 'image/jpeg' ||
          attachment.contentType === 'image/png' ||
          attachment.contentType === 'image/webp',
      ) || [];

    // Create a modified message without document attachments for the AI
    let messageForAI = {
      ...message,
      experimental_attachments: imageAttachments, // Only send images to AI
    };

    // If there are document attachments, we'll add the extracted text to the message
    if (documentAttachments.length > 0) {
      const documentTexts = [];
      for (const attachment of documentAttachments) {
        documentTexts.push(
          `[Document: ${attachment.name}]\nURL: ${attachment.url}\nType: ${attachment.contentType}\nThis document has been uploaded and is ready for analysis.`,
        );
      }

      // Add the document information to the message content
      const documentInfo = `\n\n--- Uploaded Documents ---\n${documentTexts.join('\n\n')}\n\nPlease use the extractDocumentText tool to analyze these documents.`;

      messageForAI = {
        ...messageForAI,
        parts: [
          ...messageForAI.parts,
          {
            type: 'text',
            text: documentInfo,
          },
        ],
      };
    }

    const messages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: previousMessages,
      message: messageForAI,
    });

    const { longitude, latitude, city, country } = geolocation(request);

    const requestHints: RequestHints = {
      longitude,
      latitude,
      city,
      country,
    };

    await saveMessages({
      messages: [
        {
          id: message.id,
          chatId: id,
          role: 'user',
          parts: message.parts,
          attachments: message.experimental_attachments ?? [],
          createdAt: new Date(),
        },
      ],
    });

    // Increment the user's message count
    if (session.user?.id) {
      await incrementUserMessageCount(session.user.id);
    }

    const streamId = generateUUID();
    await createStreamId({ streamId, chatId: id });

    const stream = createDataStream({
      execute: async (dataStream: DataStreamWriter) => {
        const result = streamText({
          model: myProvider.languageModel(selectedChatModel),
          system: getTenantSystemPrompt({
            tenantType: session.user.tenantType || 'quant',
            selectedChatModel,
            requestHints,
          }),
          messages,
          maxSteps: 5,
          experimental_activeTools:
            selectedChatModel === 'chat-model-reasoning'
              ? []
              : [
                  'getWeather',
                  'createDocument',
                  'updateDocument',
                  'requestSuggestions',
                  'createChart',
                  'analyzeDocument',
                  'extractDocumentText',
                  'editDocument',
                ],
          experimental_transform: smoothStream({ chunking: 'word' }),
          experimental_generateMessageId: generateUUID,
          tools: {
            getWeather,
            createDocument: createDocument({ session, dataStream }),
            updateDocument: updateDocument({ session, dataStream }),
            requestSuggestions: requestSuggestions({
              session,
              dataStream,
            }),
            createChart: createChart({ session, dataStream }),
            analyzeDocument: analyzeDocument({ session, dataStream }),
            extractDocumentText: extractDocumentText({ session, dataStream }),
            editDocument: editDocument({ session, dataStream }),
          },
          onFinish: async ({ response }) => {
            if (session.user?.id) {
              try {
                const assistantId = getTrailingMessageId({
                  messages: response.messages.filter(
                    (message) => message.role === 'assistant',
                  ),
                });

                if (!assistantId) {
                  throw new Error('No assistant message found!');
                }

                const [, assistantMessage] = appendResponseMessages({
                  messages: [message],
                  responseMessages: response.messages,
                });

                await saveMessages({
                  messages: [
                    {
                      id: assistantId,
                      chatId: id,
                      role: assistantMessage.role,
                      parts: assistantMessage.parts,
                      attachments:
                        assistantMessage.experimental_attachments ?? [],
                      createdAt: new Date(),
                    },
                  ],
                });
              } catch (_) {
                console.error('Failed to save chat');
              }
            }
          },
          experimental_telemetry: {
            isEnabled: isProductionEnvironment,
            functionId: 'stream-text',
          },
        });

        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: (error) => {
        console.error('Stream error:', error);
        return 'Oops, an error occurred!';
      },
    });

    const streamContext = getStreamContext();

    // Resumable streams are disabled, always return regular stream
    return new Response(stream);
  } catch (error) {
    console.error('Chat API Error:', error);
    console.error(
      'Error stack:',
      error instanceof Error ? error.stack : 'No stack trace',
    );
    return new Response(
      `Error in chat processing: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        status: 500,
      },
    );
  }
}

export async function GET(request: Request) {
  const streamContext = getStreamContext();
  const resumeRequestedAt = new Date();

  if (!streamContext) {
    return new Response('Error: Stream context not available', { status: 204 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('Error: Chat ID is required', { status: 400 });
  }

  const session = await auth();

  if (!session?.user) {
    return new Response('Error: User not authenticated', { status: 401 });
  }

  let chat: Chat;

  try {
    chat = await getChatById({ id: chatId });
  } catch (error) {
    console.error('Chat GET Error:', error);
    return new Response(
      `Error fetching chat: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { status: 404 },
    );
  }

  if (!chat) {
    return new Response('Error: Chat not found', { status: 404 });
  }

  if (chat.visibility === 'private' && chat.userId !== session.user.id) {
    return new Response('Error: Access denied to this chat', { status: 403 });
  }

  const streamIds = await getStreamIdsByChatId({ chatId });

  if (!streamIds.length) {
    return new Response('Error: No chat streams found', { status: 404 });
  }

  const recentStreamId = streamIds.at(-1);

  if (!recentStreamId) {
    return new Response('Error: No recent stream found', { status: 404 });
  }

  const emptyDataStream = createDataStream({
    execute: () => {},
  });

  // Resumable streams are disabled, return empty stream
  return new Response(emptyDataStream, { status: 200 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Error: Chat ID is required', { status: 404 });
  }

  const session = await auth();

  if (!session?.user?.id) {
    return new Response('Error: User not authenticated', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Error: Access denied to this chat', { status: 403 });
    }

    const deletedChat = await deleteChatById({ id });

    return Response.json(deletedChat, { status: 200 });
  } catch (error) {
    console.error('Chat DELETE Error:', error);
    return new Response(
      `Error deleting chat: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        status: 500,
      },
    );
  }
}
