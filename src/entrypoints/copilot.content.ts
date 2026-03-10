// ============================================================
// Content Script — copilot.microsoft.com
// ============================================================

import { PLATFORM_CONFIGS } from '../shared/platforms';
import { extractConversation, getSelectionText, injectText } from '../lib/common';

const config = PLATFORM_CONFIGS.copilot;

export default defineContentScript({
  matches: ['*://copilot.microsoft.com/*', '*://copilot.cloud.microsoft/*'],
  main() {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      switch (message.type) {
        case 'CAPTURE_SELECTION':
          sendResponse({
            success: true,
            data: {
              text: getSelectionText(),
              platform: 'copilot',
              url: window.location.href,
            },
          });
          break;

        case 'INJECT_PROMPT':
          const injected = injectText(config.textInputSelector, message.payload.text);
          sendResponse({ success: injected });
          break;

        case 'EXTRACT_CONVERSATION':
          const messages = extractConversation(config.conversationSelector);
          sendResponse({ success: true, data: messages });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown message type' });
      }

      return true;
    });
  },
});
