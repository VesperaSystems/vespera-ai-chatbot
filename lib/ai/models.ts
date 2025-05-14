export const DEFAULT_CHAT_MODEL: string = 'chat-model';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Basic Chat',
    description: 'Primary model for all-purpose chat',
  },
  {
    id: 'gpt-3.5',
    name: 'GPT-3.5',
    description: 'Fast and efficient for general chat',
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    description: 'Advanced model for complex analysis and reasoning',
  },
  {
    id: 'chat-model-reasoning',
    name: 'GPT-4 with Reasoning',
    description: 'Uses step-by-step reasoning with think tags',
  },
];
