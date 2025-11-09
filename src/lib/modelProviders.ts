export interface ModelProvider {
  id: string
  name: string
  logo: string
  headquarters: string
  flag: string
  dataResidency: string
  apiEndpoint?: string
}

export interface ModelInfo {
  id: string
  name: string
  provider: string
  family: string
  contextWindow: string
  maxOutputTokens: string
  trainingCutoff: string
  modalities: string[]
  inputPricePerMillion: number
  outputPricePerMillion: number
  cachedInputPricePerMillion?: number
  releaseDate: string
  description: string
}

export const MODEL_PROVIDERS: ModelProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    logo: 'https://openai.com/favicon.ico',
    headquarters: 'San Francisco, CA',
    flag: '🇺🇸',
    dataResidency: 'US-based',
    apiEndpoint: 'https://api.openai.com/v1'
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    logo: 'https://www.anthropic.com/favicon.ico',
    headquarters: 'San Francisco, CA',
    flag: '🇺🇸',
    dataResidency: 'US-based',
    apiEndpoint: 'https://api.anthropic.com/v1'
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    logo: 'https://mistral.ai/favicon.ico',
    headquarters: 'Paris',
    flag: '🇫🇷',
    dataResidency: 'EU Compliant',
    apiEndpoint: 'https://api.mistral.ai/v1'
  },
  {
    id: 'google',
    name: 'Google AI',
    logo: 'https://www.google.com/favicon.ico',
    headquarters: 'Mountain View, CA',
    flag: '🇺🇸',
    dataResidency: 'Multi-region',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1'
  },
  {
    id: 'cohere',
    name: 'Cohere',
    logo: 'https://cohere.com/favicon.ico',
    headquarters: 'Toronto, ON',
    flag: '🇨🇦',
    dataResidency: 'Multi-region'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    logo: 'https://www.deepseek.com/favicon.ico',
    headquarters: 'Hangzhou',
    flag: '🇨🇳',
    dataResidency: 'China-based'
  },
  {
    id: 'xai',
    name: 'xAI',
    logo: 'https://x.ai/favicon.ico',
    headquarters: 'San Francisco, CA',
    flag: '🇺🇸',
    dataResidency: 'US-based'
  }
]

export const AVAILABLE_MODELS: Record<string, ModelInfo[]> = {
  openai: [
    {
      id: 'gpt-5',
      name: 'GPT-5',
      provider: 'openai',
      family: 'GPT-5 Family',
      contextWindow: '128k tokens',
      maxOutputTokens: '16k tokens',
      trainingCutoff: 'October 2024',
      modalities: ['Text', 'Vision', 'Function Calling'],
      inputPricePerMillion: 5.0,
      outputPricePerMillion: 15.0,
      cachedInputPricePerMillion: 2.5,
      releaseDate: '2025-01',
      description: 'Most capable model for complex reasoning and analysis'
    },
    {
      id: 'gpt-5-mini',
      name: 'GPT-5 Mini',
      provider: 'openai',
      family: 'GPT-5 Family',
      contextWindow: '128k tokens',
      maxOutputTokens: '16k tokens',
      trainingCutoff: 'October 2024',
      modalities: ['Text', 'Vision', 'Function Calling'],
      inputPricePerMillion: 1.0,
      outputPricePerMillion: 3.0,
      releaseDate: '2025-01',
      description: 'Fast and cost-efficient version of GPT-5'
    },
    {
      id: 'gpt-5-nano',
      name: 'GPT-5 Nano',
      provider: 'openai',
      family: 'GPT-5 Family',
      contextWindow: '128k tokens',
      maxOutputTokens: '8k tokens',
      trainingCutoff: 'October 2024',
      modalities: ['Text', 'Function Calling'],
      inputPricePerMillion: 0.3,
      outputPricePerMillion: 0.9,
      releaseDate: '2025-01',
      description: 'Fastest and most cost-effective GPT-5 variant'
    }
  ],
  anthropic: [
    {
      id: 'claude-sonnet-4-5',
      name: 'Claude Sonnet 4.5',
      provider: 'anthropic',
      family: 'Claude 4 Family',
      contextWindow: '200k tokens',
      maxOutputTokens: '8k tokens',
      trainingCutoff: 'April 2024',
      modalities: ['Text', 'Vision', 'PDF Analysis'],
      inputPricePerMillion: 3.0,
      outputPricePerMillion: 15.0,
      cachedInputPricePerMillion: 0.3,
      releaseDate: '2024-10',
      description: 'Most intelligent Claude model with superior reasoning'
    },
    {
      id: 'claude-opus-4',
      name: 'Claude Opus 4',
      provider: 'anthropic',
      family: 'Claude 4 Family',
      contextWindow: '200k tokens',
      maxOutputTokens: '4k tokens',
      trainingCutoff: 'August 2024',
      modalities: ['Text', 'Vision'],
      inputPricePerMillion: 15.0,
      outputPricePerMillion: 75.0,
      releaseDate: '2025-01',
      description: 'Highest performance for complex tasks'
    },
    {
      id: 'claude-haiku-4',
      name: 'Claude Haiku 4',
      provider: 'anthropic',
      family: 'Claude 4 Family',
      contextWindow: '200k tokens',
      maxOutputTokens: '4k tokens',
      trainingCutoff: 'August 2024',
      modalities: ['Text', 'Vision'],
      inputPricePerMillion: 1.0,
      outputPricePerMillion: 5.0,
      releaseDate: '2024-11',
      description: 'Fast and cost-effective for quick responses'
    }
  ],
  mistral: [
    {
      id: 'mistral-large-2',
      name: 'Mistral Large 2',
      provider: 'mistral',
      family: 'Mistral Large',
      contextWindow: '128k tokens',
      maxOutputTokens: '4k tokens',
      trainingCutoff: 'September 2024',
      modalities: ['Text', 'Function Calling'],
      inputPricePerMillion: 3.0,
      outputPricePerMillion: 9.0,
      releaseDate: '2024-07',
      description: 'Top-tier reasoning and multilingual capabilities'
    },
    {
      id: 'mistral-small-latest',
      name: 'Mistral Small',
      provider: 'mistral',
      family: 'Mistral Small',
      contextWindow: '32k tokens',
      maxOutputTokens: '4k tokens',
      trainingCutoff: 'September 2024',
      modalities: ['Text', 'Function Calling'],
      inputPricePerMillion: 1.0,
      outputPricePerMillion: 3.0,
      releaseDate: '2024-09',
      description: 'Cost-effective for most tasks'
    }
  ],
  google: [
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      provider: 'google',
      family: 'Gemini 2.5',
      contextWindow: '1M tokens',
      maxOutputTokens: '8k tokens',
      trainingCutoff: 'November 2024',
      modalities: ['Text', 'Vision', 'Audio', 'Video'],
      inputPricePerMillion: 1.25,
      outputPricePerMillion: 5.0,
      releaseDate: '2024-12',
      description: 'Advanced multimodal with massive context window'
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      provider: 'google',
      family: 'Gemini 2.5',
      contextWindow: '1M tokens',
      maxOutputTokens: '8k tokens',
      trainingCutoff: 'November 2024',
      modalities: ['Text', 'Vision', 'Audio'],
      inputPricePerMillion: 0.075,
      outputPricePerMillion: 0.3,
      releaseDate: '2024-12',
      description: 'Fast multimodal processing at low cost'
    }
  ],
  cohere: [
    {
      id: 'command-r-plus',
      name: 'Command R+',
      provider: 'cohere',
      family: 'Command R',
      contextWindow: '128k tokens',
      maxOutputTokens: '4k tokens',
      trainingCutoff: 'April 2024',
      modalities: ['Text', 'RAG', 'Citations'],
      inputPricePerMillion: 3.0,
      outputPricePerMillion: 15.0,
      releaseDate: '2024-04',
      description: 'Optimized for RAG and enterprise workflows'
    }
  ],
  deepseek: [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      provider: 'deepseek',
      family: 'DeepSeek V3',
      contextWindow: '64k tokens',
      maxOutputTokens: '4k tokens',
      trainingCutoff: 'May 2024',
      modalities: ['Text', 'Code'],
      inputPricePerMillion: 0.14,
      outputPricePerMillion: 0.28,
      releaseDate: '2024-12',
      description: 'Cost-effective for coding and reasoning'
    }
  ],
  xai: [
    {
      id: 'grok-2',
      name: 'Grok 2',
      provider: 'xai',
      family: 'Grok',
      contextWindow: '128k tokens',
      maxOutputTokens: '4k tokens',
      trainingCutoff: 'October 2024',
      modalities: ['Text', 'Vision', 'Real-time Data'],
      inputPricePerMillion: 2.0,
      outputPricePerMillion: 10.0,
      releaseDate: '2024-08',
      description: 'Real-time information with X integration'
    }
  ]
}

export const getProviderModels = (providerId: string): ModelInfo[] => {
  return AVAILABLE_MODELS[providerId] || []
}

export const getModelById = (modelId: string): ModelInfo | undefined => {
  for (const provider in AVAILABLE_MODELS) {
    const model = AVAILABLE_MODELS[provider].find(m => m.id === modelId)
    if (model) return model
  }
  return undefined
}
