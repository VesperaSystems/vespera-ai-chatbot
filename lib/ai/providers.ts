import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  type LanguageModelV1,
  type LanguageModelV1CallOptions,
  type LanguageModelV1StreamPart,
  type ImageModel,
} from 'ai';
import OpenAIClient from 'openai';
import { isTestEnvironment } from '../constants';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAIClient({
  apiKey: process.env.OPENAI_API_KEY,
});

const createChatCompletion: LanguageModelV1 = {
  specificationVersion: 'v1',
  provider: 'openai',
  modelId: 'gpt-4-turbo-preview',
  defaultObjectGenerationMode: 'json' as const,
  doGenerate: async () => {
    throw new Error('Not implemented');
  },
  doStream: async (options: LanguageModelV1CallOptions) => {
    try {
      if (!options.prompt || !Array.isArray(options.prompt)) {
        throw new Error('Invalid prompt format: expected an array of messages');
      }

      console.log('AI Provider: Processing messages:', {
        totalMessages: options.prompt.length,
        messages: options.prompt.map((msg, index) => ({
          index,
          role: typeof msg === 'string' ? 'string' : msg.role,
          hasAttachments:
            typeof msg === 'object' && !!msg.experimental_attachments,
          attachmentCount:
            typeof msg === 'object' && msg.experimental_attachments
              ? msg.experimental_attachments.length
              : 0,
        })),
      });

      // Check if any message has image attachments to determine model
      const hasImages = options.prompt.some(
        (msg) =>
          typeof msg === 'object' &&
          msg.experimental_attachments &&
          Array.isArray(msg.experimental_attachments) &&
          msg.experimental_attachments.some((att: any) =>
            att.contentType?.startsWith('image'),
          ),
      );

      console.log('AI Provider: Has images detected:', hasImages);

      // Use vision model if images are present
      const modelToUse = hasImages ? 'gpt-4o' : createChatCompletion.modelId;

      console.log('AI Provider: Using model:', modelToUse);

      const messages = options.prompt.map((msg) => {
        if (typeof msg === 'string') {
          return { role: 'user', content: msg } as const;
        }

        // Handle multimodal messages with experimental_attachments
        if (
          msg.experimental_attachments &&
          Array.isArray(msg.experimental_attachments) &&
          msg.experimental_attachments.length > 0
        ) {
          const content: any[] = [];

          // Add text content
          if (typeof msg.content === 'string' && msg.content.trim()) {
            content.push({ type: 'text', text: msg.content });
          } else {
            // If no text content, add a default prompt
            content.push({ type: 'text', text: 'What is in this image?' });
          }

          // Add image attachments
          for (const attachment of msg.experimental_attachments) {
            if (attachment.contentType?.startsWith('image') && attachment.url) {
              console.log('AI Provider: Adding image attachment:', {
                url: attachment.url,
                contentType: attachment.contentType,
              });
              content.push({
                type: 'image_url',
                image_url: { url: attachment.url },
              });
            }
          }

          console.log('AI Provider: Transformed message with images:', {
            role: msg.role || 'user',
            content,
          });

          return {
            role: msg.role || 'user',
            content,
          } as const;
        }

        // Handle regular text messages
        if (typeof msg.content === 'string') {
          return { role: msg.role || 'user', content: msg.content } as const;
        }

        return {
          role: msg.role || 'user',
          content: JSON.stringify(msg.content),
        } as const;
      });

      console.log(
        'AI Provider: Final messages to OpenAI:',
        JSON.stringify(messages, null, 2),
      );

      const completion = await openai.chat.completions.create({
        model: modelToUse,
        messages: messages as any,
        temperature: 0.7,
        stream: true,
      });

      const stream = new ReadableStream<LanguageModelV1StreamPart>({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              if (chunk.choices[0]?.delta?.content) {
                const content = chunk.choices[0].delta.content;
                // Handle both plain text and JSON responses
                try {
                  const parsed = JSON.parse(content);
                  if (parsed.type === 'text' && parsed.text) {
                    controller.enqueue({
                      type: 'text-delta',
                      textDelta: parsed.text,
                    });
                  } else {
                    controller.enqueue({
                      type: 'text-delta',
                      textDelta: content,
                    });
                  }
                } catch {
                  // If not JSON, send as plain text
                  controller.enqueue({
                    type: 'text-delta',
                    textDelta: content,
                  });
                }
              }
            }
            controller.enqueue({
              type: 'finish',
              finishReason: 'stop',
              usage: {
                promptTokens: 0,
                completionTokens: 0,
              },
            });
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return {
        stream,
        rawCall: {
          rawPrompt: messages,
          rawSettings: {
            model: modelToUse,
            temperature: 0.7,
          },
        },
      };
    } catch (error: any) {
      console.error('OpenAI API Error:', {
        status: error.status,
        message: error.message,
        type: error.type,
        code: error.code,
      });
      throw error;
    }
  },
};

// Create a vision-capable model
const createVisionChatCompletion: LanguageModelV1 = {
  specificationVersion: 'v1',
  provider: 'openai',
  modelId: 'gpt-4o',
  defaultObjectGenerationMode: 'json' as const,
  doGenerate: async () => {
    throw new Error('Not implemented');
  },
  doStream: async (options: LanguageModelV1CallOptions) => {
    try {
      if (!options.prompt || !Array.isArray(options.prompt)) {
        throw new Error('Invalid prompt format: expected an array of messages');
      }

      console.log('Vision Model: Processing messages:', {
        totalMessages: options.prompt.length,
        messages: options.prompt.map((msg, index) => ({
          index,
          role: typeof msg === 'string' ? 'string' : msg.role,
          hasAttachments:
            typeof msg === 'object' && !!msg.experimental_attachments,
          attachmentCount:
            typeof msg === 'object' && msg.experimental_attachments
              ? msg.experimental_attachments.length
              : 0,
        })),
      });

      const messages = options.prompt.map((msg) => {
        if (typeof msg === 'string') {
          return { role: 'user', content: msg } as const;
        }

        // Handle multimodal messages with experimental_attachments
        if (
          msg.experimental_attachments &&
          Array.isArray(msg.experimental_attachments)
        ) {
          const content: any[] = [];

          // Add text content
          if (typeof msg.content === 'string') {
            content.push({ type: 'text', text: msg.content });
          }

          // Add image attachments
          for (const attachment of msg.experimental_attachments) {
            if (attachment.contentType?.startsWith('image') && attachment.url) {
              content.push({
                type: 'image_url',
                image_url: { url: attachment.url },
              });
            }
          }

          return {
            role: msg.role || 'user',
            content,
          } as const;
        }

        // Handle regular text messages
        if (typeof msg.content === 'string') {
          return { role: msg.role || 'user', content: msg.content } as const;
        }

        return {
          role: msg.role || 'user',
          content: JSON.stringify(msg.content),
        } as const;
      });

      console.log(
        'Vision Model: Final messages to OpenAI:',
        JSON.stringify(messages, null, 2),
      );

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages as any,
        temperature: 0.7,
        stream: true,
      });

      const stream = new ReadableStream<LanguageModelV1StreamPart>({
        async start(controller) {
          try {
            for await (const chunk of completion) {
              if (chunk.choices[0]?.delta?.content) {
                const content = chunk.choices[0].delta.content;
                // Handle both plain text and JSON responses
                try {
                  const parsed = JSON.parse(content);
                  if (parsed.type === 'text' && parsed.text) {
                    controller.enqueue({
                      type: 'text-delta',
                      textDelta: parsed.text,
                    });
                  } else {
                    controller.enqueue({
                      type: 'text-delta',
                      textDelta: content,
                    });
                  }
                } catch {
                  // If not JSON, send as plain text
                  controller.enqueue({
                    type: 'text-delta',
                    textDelta: content,
                  });
                }
              }
            }
            controller.enqueue({
              type: 'finish',
              finishReason: 'stop',
              usage: {
                promptTokens: 0,
                completionTokens: 0,
              },
            });
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return {
        stream,
        rawCall: {
          rawPrompt: messages,
          rawSettings: {
            model: 'gpt-4o',
            temperature: 0.7,
          },
        },
      };
    } catch (error: any) {
      console.error('OpenAI API Error:', {
        status: error.status,
        message: error.message,
        type: error.type,
        code: error.code,
      });
      throw error;
    }
  },
};

const createImage: ImageModel = {
  specificationVersion: 'v1',
  provider: 'openai',
  modelId: 'dall-e-3',
  maxImagesPerCall: 1,
  doGenerate: async (options) => {
    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: options.prompt,
        n: 1,
        size: '1024x1024',
      });
      return {
        images: response.data?.map((img) => img.url || '') || [],
        warnings: [],
        response: {
          timestamp: new Date(),
          modelId: 'dall-e-3',
          headers: undefined,
        },
      };
    } catch (error: any) {
      console.error('OpenAI API Error:', {
        status: error.status,
        message: error.message,
        type: error.type,
        code: error.code,
      });
      throw error;
    }
  },
};

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': chatModel,
        'chat-model-reasoning': reasoningModel,
        'title-model': titleModel,
        'artifact-model': artifactModel,
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': createChatCompletion,
        'chat-model-reasoning': wrapLanguageModel({
          model: createVisionChatCompletion,
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': createChatCompletion,
        'artifact-model': createChatCompletion,
        'gpt-3.5': {
          ...createChatCompletion,
          modelId: 'gpt-3.5-turbo',
        },
        'gpt-4': createVisionChatCompletion,
      },
      imageModels: {
        'small-model': createImage,
      },
    });
