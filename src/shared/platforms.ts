// ============================================================
// Platform Detection & Capabilities
// ============================================================

import type { Platform } from './types';

export interface PlatformConfig {
  id: Platform;
  name: string;
  hostPatterns: string[];
  textInputSelector: string;
  submitButtonSelector: string;
  conversationSelector: string;
  codeBlockSelector: string;
  codeBlockHeaderSelector: string;
  maxContextTokens: number;
}

export const PLATFORM_CONFIGS: Record<Exclude<Platform, 'other'>, PlatformConfig> = {
  claude: {
    id: 'claude',
    name: 'Claude',
    hostPatterns: ['claude.ai'],
    textInputSelector: '[contenteditable="true"].ProseMirror, div.ProseMirror',
    submitButtonSelector: 'button[aria-label="Send Message"], button[data-testid="send-button"]',
    conversationSelector: '[data-testid="conversation-turn-*"]',
    codeBlockSelector: 'pre',
    codeBlockHeaderSelector: '[data-language], .code-block__header, .font-mono',
    maxContextTokens: 200000,
  },
  chatgpt: {
    id: 'chatgpt',
    name: 'ChatGPT',
    hostPatterns: ['chatgpt.com', 'chat.openai.com'],
    textInputSelector: '#prompt-textarea, textarea[data-id="root"]',
    submitButtonSelector: 'button[data-testid="send-button"]',
    conversationSelector: '[data-message-author-role]',
    codeBlockSelector: 'pre',
    codeBlockHeaderSelector: '.contain-inline-size span, [class*="code-block"] span',
    maxContextTokens: 128000,
  },
  gemini: {
    id: 'gemini',
    name: 'Gemini',
    hostPatterns: ['gemini.google.com'],
    textInputSelector: '.ql-editor, rich-textarea .textarea',
    submitButtonSelector: 'button.send-button, button[aria-label="Send message"]',
    conversationSelector: '.conversation-container message-content',
    codeBlockSelector: 'pre',
    codeBlockHeaderSelector: '[class*="code"] span, .code-block-decoration',
    maxContextTokens: 1000000,
  },
  copilot: {
    id: 'copilot',
    name: 'Copilot',
    hostPatterns: ['copilot.microsoft.com', 'copilot.cloud.microsoft'],
    textInputSelector: '#searchbox, textarea[name="searchbox"]',
    submitButtonSelector: 'button[aria-label="Submit"]',
    conversationSelector: '.response-message-group',
    codeBlockSelector: 'pre',
    codeBlockHeaderSelector: '[class*="code-header"] span',
    maxContextTokens: 128000,
  },
};

export function detectPlatform(hostname: string): Platform {
  for (const config of Object.values(PLATFORM_CONFIGS)) {
    if (config.hostPatterns.some((pattern) => hostname.includes(pattern))) {
      return config.id;
    }
  }
  return 'other';
}

export function getPlatformConfig(platform: Platform): PlatformConfig | undefined {
  if (platform === 'other') return undefined;
  return PLATFORM_CONFIGS[platform];
}

export function getPlatformName(platform: Platform): string {
  if (platform === 'other') return 'Other';
  return PLATFORM_CONFIGS[platform].name;
}
