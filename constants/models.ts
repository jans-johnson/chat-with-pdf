import { Providers, ModelTypes, ModelOption } from "@types";

// OpenAI model configurations
export const OPENAI_MODELS = {
  GPT_5_2: "gpt-5.2",
  GPT_5: "gpt-5",
  GPT_5_MINI: "gpt-5-mini",
  O4_MINI: "o4-mini",
  O3: "o3",
  GPT_4_1: "gpt-4.1",
  GPT_4_1_MINI: "gpt-4.1-mini",
} as const;

// Anthropic model configurations
export const ANTHROPIC_MODELS = {
  CLAUDE_OPUS_4_6: "claude-opus-4-6",
  CLAUDE_SONNET_4_6: "claude-sonnet-4-6",
  CLAUDE_HAIKU_4_5: "claude-haiku-4-5-20251001",
} as const;

// Google model configurations
export const GOOGLE_MODELS = {
  GEMINI_3_1_PRO: "gemini-3.1-pro-preview",
  GEMINI_3_FLASH: "gemini-3-flash-preview",
  GEMINI_2_5_PRO: "gemini-2.5-pro",
  GEMINI_2_5_FLASH: "gemini-2.5-flash",
} as const;

// DeepSeek model configurations
export const DEEPSEEK_MODELS = {
  DEEPSEEK_R1: "deepseek-reasoner",
  DEEPSEEK_V3: "deepseek-chat",
} as const;

// All available models
export const ALL_MODELS = {
  ...OPENAI_MODELS,
  ...ANTHROPIC_MODELS,
  ...GOOGLE_MODELS,
  ...DEEPSEEK_MODELS,
} as const;

// Available models for selection
export const VALID_MODELS = Object.values(ALL_MODELS) as string[];

// Default model
export const DEFAULT_MODEL = GOOGLE_MODELS.GEMINI_2_5_FLASH;

// Model options for the UI selector
export const MODEL_OPTIONS: Record<Providers, ModelOption[]> = {
  // OpenAI Models
  [Providers.OpenAI]: [
    {
      value: OPENAI_MODELS.GPT_5_2,
      label: "GPT-5.2",
      description: "Latest and most capable OpenAI model",
      provider: Providers.OpenAI,
      credits: 1,
      modelType: ModelTypes.Pro,
    },
    {
      value: OPENAI_MODELS.GPT_5,
      label: "GPT-5",
      description: "Powerful coding and reasoning",
      provider: Providers.OpenAI,
      credits: 1,
      modelType: ModelTypes.Pro,
    },
    {
      value: OPENAI_MODELS.GPT_5_MINI,
      label: "GPT-5 Mini",
      description: "Fast and cost-efficient",
      provider: Providers.OpenAI,
      credits: 1,
      modelType: ModelTypes.Basic,
    },
    {
      value: OPENAI_MODELS.O4_MINI,
      label: "o4-mini",
      description: "Fast reasoning for coding and math",
      provider: Providers.OpenAI,
      credits: 1,
      modelType: ModelTypes.Pro,
    },
    {
      value: OPENAI_MODELS.O3,
      label: "o3",
      description: "Advanced reasoning model",
      provider: Providers.OpenAI,
      credits: 1,
      modelType: ModelTypes.Pro,
    },
    {
      value: OPENAI_MODELS.GPT_4_1,
      label: "GPT-4.1",
      description: "Direct responses, large context",
      provider: Providers.OpenAI,
      credits: 1,
      modelType: ModelTypes.Pro,
    },
    {
      value: OPENAI_MODELS.GPT_4_1_MINI,
      label: "GPT-4.1 Mini",
      description: "Quick responses for simple queries",
      provider: Providers.OpenAI,
      credits: 1,
      modelType: ModelTypes.Basic,
    },
  ],
  // Anthropic Models
  [Providers.Anthropic]: [
    {
      value: ANTHROPIC_MODELS.CLAUDE_OPUS_4_6,
      label: "Claude Opus 4.6",
      description: "Most intelligent, deep reasoning",
      provider: Providers.Anthropic,
      credits: 2,
      modelType: ModelTypes.Pro,
    },
    {
      value: ANTHROPIC_MODELS.CLAUDE_SONNET_4_6,
      label: "Claude Sonnet 4.6",
      description: "Best balance of speed and intelligence",
      provider: Providers.Anthropic,
      credits: 2,
      modelType: ModelTypes.Pro,
    },
    {
      value: ANTHROPIC_MODELS.CLAUDE_HAIKU_4_5,
      label: "Claude Haiku 4.5",
      description: "Fastest with near-frontier intelligence",
      provider: Providers.Anthropic,
      credits: 1,
      modelType: ModelTypes.Basic,
    },
  ],
  // Google Models
  [Providers.Google]: [
    {
      value: GOOGLE_MODELS.GEMINI_3_1_PRO,
      label: "Gemini 3.1 Pro",
      description: "Latest flagship with top reasoning",
      provider: Providers.Google,
      credits: 0,
      modelType: ModelTypes.Pro,
    },
    {
      value: GOOGLE_MODELS.GEMINI_3_FLASH,
      label: "Gemini 3 Flash",
      description: "Pro-level intelligence at Flash speed",
      provider: Providers.Google,
      credits: 0,
      modelType: ModelTypes.Pro,
    },
    {
      value: GOOGLE_MODELS.GEMINI_2_5_PRO,
      label: "Gemini 2.5 Pro",
      description: "Strong reasoning, 1M context",
      provider: Providers.Google,
      credits: 0,
      modelType: ModelTypes.Pro,
    },
    {
      value: GOOGLE_MODELS.GEMINI_2_5_FLASH,
      label: "Gemini 2.5 Flash",
      description: "Fast everyday model",
      provider: Providers.Google,
      credits: 0,
      modelType: ModelTypes.Basic,
    },
  ],
  // DeepSeek Models
  [Providers.DeepSeek]: [
    {
      value: DEEPSEEK_MODELS.DEEPSEEK_R1,
      label: "DeepSeek R1",
      description: "Advanced reasoning model",
      provider: Providers.DeepSeek,
      credits: 0,
      modelType: ModelTypes.Pro,
    },
    {
      value: DEEPSEEK_MODELS.DEEPSEEK_V3,
      label: "DeepSeek V3",
      description: "General-purpose, cost-efficient",
      provider: Providers.DeepSeek,
      credits: 0,
      modelType: ModelTypes.Basic,
    },
  ],
};
