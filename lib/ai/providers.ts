import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from 'ai';
import { createOpenAI, openai } from '@ai-sdk/openai';
import { isTestEnvironment } from '../constants';

// Nebius AI Studio exposes an OpenAI-compatible API. Nebius is used whenever
// NEBIUS_API_KEY is set (or AI_PROVIDER=nebius); otherwise OpenAI is used.
// Model choices can be overridden per deployment without a code change.
const NEBIUS_BASE_URL = 'https://api.studio.nebius.com/v1/';
const NEBIUS_CHAT_MODEL = 'deepseek-ai/DeepSeek-V3-0324';
const NEBIUS_SMALL_MODEL = 'meta-llama/Meta-Llama-3.1-8B-Instruct';
const NEBIUS_REASONING_MODEL = 'deepseek-ai/DeepSeek-R1-0528';

const useNebius =
  process.env.AI_PROVIDER?.toLowerCase() === 'nebius' ||
  (process.env.AI_PROVIDER?.toLowerCase() !== 'openai' &&
    Boolean(process.env.NEBIUS_API_KEY));

const providerFactory = () => {
  if (isTestEnvironment) {
    return customProvider({
      languageModels: {
        'chat-model': openai('gpt-4o'),
        'chat-model-reasoning': wrapLanguageModel({
          model: openai('gpt-4o'),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': openai('gpt-4o'),
        'artifact-model': openai('gpt-4o'),
      },
    });
  }

  if (useNebius) {
    const nebius = createOpenAI({
      name: 'nebius',
      baseURL: process.env.NEBIUS_BASE_URL || NEBIUS_BASE_URL,
      apiKey: process.env.NEBIUS_API_KEY,
    });
    const chatModel = process.env.NEBIUS_MODEL || NEBIUS_CHAT_MODEL;
    const smallModel = process.env.NEBIUS_SMALL_MODEL || NEBIUS_SMALL_MODEL;
    const reasoningModel =
      process.env.NEBIUS_REASONING_MODEL || NEBIUS_REASONING_MODEL;

    return customProvider({
      languageModels: {
        'chat-model': nebius(chatModel),
        'chat-model-reasoning': wrapLanguageModel({
          model: nebius(reasoningModel),
          middleware: extractReasoningMiddleware({ tagName: 'think' }),
        }),
        'title-model': nebius(smallModel),
        'artifact-model': nebius(chatModel),
        'gpt-3.5': nebius(smallModel),
        'gpt-4': nebius(chatModel),
        'gpt-4o': nebius(chatModel),
      },
      imageModels: {
        'small-model': nebius.image('black-forest-labs/flux-schnell'),
      },
    });
  }

  return customProvider({
    languageModels: {
      'chat-model': openai('gpt-4o'),
      'chat-model-reasoning': wrapLanguageModel({
        model: openai('gpt-4o'),
        middleware: extractReasoningMiddleware({ tagName: 'think' }),
      }),
      'title-model': openai('gpt-4o'),
      'artifact-model': openai('gpt-4o'),
      'gpt-3.5': openai('gpt-3.5-turbo'),
      'gpt-4': openai('gpt-4o'),
      'gpt-4o': openai('gpt-4o'),
    },
    imageModels: {
      'small-model': openai.image('dall-e-3'),
    },
  });
};

export const myProvider = providerFactory();
