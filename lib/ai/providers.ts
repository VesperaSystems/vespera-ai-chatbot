import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
  type LanguageModelV1,
  type LanguageModelV1CallOptions,
  type LanguageModelV1StreamPart,
} from 'ai';
import OpenAI from 'openai';
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

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const createChatCompletion = async (options: LanguageModelV1CallOptions) => {
  try {
    if (!options.prompt || !Array.isArray(options.prompt)) {
      throw new Error('Invalid prompt format: expected an array of messages');
    }

    const messages = options.prompt.map((msg) => {
      if (typeof msg === 'string') {
        return { role: 'user', content: msg } as const;
      }
      if (typeof msg.content === 'string') {
        return { role: msg.role || 'user', content: msg.content } as const;
      }
      return {
        role: msg.role || 'user',
        content: JSON.stringify(msg.content),
      } as const;
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages as any, // Type assertion needed due to complex message types
      temperature: 0.7,
      stream: true,
    });

    const stream = new ReadableStream<LanguageModelV1StreamPart>({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            if (chunk.choices[0]?.delta?.content) {
              controller.enqueue({
                type: 'text-delta',
                textDelta: chunk.choices[0].delta.content,
              });
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
          model: 'gpt-4-turbo-preview',
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
};

const createImage = async (prompt: string) => {
  try {
    return await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
    });
  } catch (error: any) {
    console.error('OpenAI API Error:', {
      status: error.status,
      message: error.message,
      type: error.type,
      code: error.code,
    });
    throw error;
  }
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
        'chat-model': wrapLanguageModel(createChatCompletion),
        'chat-model-reasoning': wrapLanguageModel({
          model: createChatCompletion,
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': wrapLanguageModel(createChatCompletion),
        'artifact-model': wrapLanguageModel(createChatCompletion),
      },
      imageModels: {
        'small-model': createImage,
      },
    });
