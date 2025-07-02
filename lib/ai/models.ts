export const DEFAULT_CHAT_MODEL: string = 'gpt-4';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
  supportsVision?: boolean;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Basic Chat',
    description: 'Primary model for all-purpose chat',
    supportsVision: false,
  },
  {
    id: 'gpt-3.5',
    name: 'GPT-3.5',
    description: 'Fast and efficient for general chat',
    supportsVision: false,
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Advanced model for complex analysis and reasoning',
    supportsVision: true,
  },
  {
    id: 'chat-model-reasoning',
    name: 'GPT-4 with Reasoning',
    description: 'Uses step-by-step reasoning with think tags',
    supportsVision: true,
  },
];

/**
 * Check if a model supports vision capabilities
 */
export function modelSupportsVision(modelId: string): boolean {
  const model = chatModels.find((m) => m.id === modelId);
  return model?.supportsVision ?? false;
}
