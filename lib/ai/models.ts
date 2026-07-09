export const DEFAULT_CHAT_MODEL: string = 'deepseek-v4-pro';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
  supportsVision?: boolean;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    description: 'Deep reasoning for complex analysis and long-horizon research',
    supportsVision: false,
  },
  {
    id: 'qwen3-5-397b',
    name: 'Qwen 3.5 397B',
    description: 'Flagship multimodal model for chat, retrieval, and agentic workflows',
    supportsVision: true,
  },
  {
    id: 'glm-5-2',
    name: 'GLM 5.2',
    description: 'Strong reasoning, long-context understanding, and advanced tool use',
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

/**
 * Get the default model for a user based on their tenant type
 */
export function getDefaultModelForUser(tenantType?: string): string {
  if (tenantType === 'legal') {
    return 'qwen3-5-397b';
  }
  return DEFAULT_CHAT_MODEL;
}

/**
 * Get the default subscription type for a user based on their tenant type
 */
export function getDefaultSubscriptionTypeForUser(tenantType?: string): number {
  if (tenantType === 'legal') {
    return 3; // Enterprise
  }
  return 1; // Regular
}
