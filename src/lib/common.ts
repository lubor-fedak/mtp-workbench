// ============================================================
// Shared Content Script Utilities
// ============================================================

import type { CodeBlock } from '../shared/types';

/**
 * Get the currently selected text on the page.
 */
export function getSelectionText(): string {
  const selection = window.getSelection();
  return selection ? selection.toString().trim() : '';
}

/**
 * Inject text into an input element (contenteditable div or textarea).
 */
export function injectText(selector: string, text: string): boolean {
  const element = document.querySelector<HTMLElement>(selector);
  if (!element) return false;

  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
    // Native textarea/input — use correct prototype for the element type
    const proto =
      element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (nativeSetter) {
      nativeSetter.call(element, text);
    } else {
      element.value = text;
    }
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  if (element.contentEditable === 'true') {
    // ContentEditable div (Claude, Gemini)
    element.focus();
    element.innerHTML = '';

    // Use execCommand for proper undo support
    document.execCommand('insertText', false, text);

    element.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }

  return false;
}

/**
 * Extract visible conversation text from the page.
 */
export function extractConversation(selector: string): string[] {
  const elements = document.querySelectorAll(selector);
  const messages: string[] = [];

  elements.forEach((el) => {
    const text = (el as HTMLElement).innerText?.trim();
    if (text) messages.push(text);
  });

  return messages;
}

/**
 * Detect language from a code element's class list.
 * Looks for patterns like "language-python", "hljs language-js", "lang-tsx", etc.
 */
function detectLanguageFromElement(el: Element): string {
  // Check the code element and its parent for language classes
  const candidates = [el, el.querySelector('code'), el.closest('pre')?.querySelector('code')];

  for (const candidate of candidates) {
    if (!candidate) continue;

    // Check class list for language-* or lang-* patterns
    for (const cls of candidate.classList) {
      const match = cls.match(/^(?:language-|lang-)(.+)$/);
      if (match) return match[1];
    }

    // Check data-language attribute
    const dataLang = candidate.getAttribute('data-language');
    if (dataLang) return dataLang;
  }

  // Check parent wrapper for data-language
  const wrapper = el.closest('[data-language]');
  if (wrapper) {
    return wrapper.getAttribute('data-language') || '';
  }

  return '';
}

/**
 * Try to find a filename or label from the code block header.
 * Many AI platforms show "filename.ext" or "python" in a header above the code block.
 */
function detectFilenameFromHeader(preEl: Element, headerSelector: string): string {
  // Look for a header element preceding the pre or as a sibling
  const parent = preEl.parentElement;
  if (!parent) return '';

  // Try the platform-specific header selector on the parent wrapper
  const headerEl = parent.querySelector(headerSelector);
  if (headerEl) {
    const text = (headerEl as HTMLElement).innerText?.trim();
    if (text) return text;
  }

  // Try previous sibling
  const prevSibling = preEl.previousElementSibling;
  if (prevSibling) {
    const text = (prevSibling as HTMLElement).innerText?.trim();
    // Only use if it looks like a filename or short language label (not a paragraph)
    if (text && text.length < 80 && !text.includes('\n')) return text;
  }

  return '';
}

/**
 * Extract all code blocks from the page.
 */
export function extractCodeBlocks(
  codeBlockSelector: string,
  headerSelector: string,
): CodeBlock[] {
  const preElements = document.querySelectorAll(codeBlockSelector);
  const blocks: CodeBlock[] = [];

  preElements.forEach((preEl) => {
    const codeEl = preEl.querySelector('code') || preEl;
    const code = (codeEl as HTMLElement).innerText?.trim();
    if (!code) return;

    const language = detectLanguageFromElement(preEl);
    const headerText = detectFilenameFromHeader(preEl, headerSelector);

    // Determine if header text is a filename (has extension) or just a language label
    let filename: string | undefined;
    let lang = language;

    if (headerText) {
      if (headerText.includes('.')) {
        // Looks like a filename (e.g., "App.tsx", "config.yaml")
        filename = headerText;
        // Infer language from extension if not already detected
        if (!lang) {
          const ext = headerText.split('.').pop()?.toLowerCase() || '';
          lang = ext;
        }
      } else if (!lang) {
        // Use header text as language if no language class found
        lang = headerText.toLowerCase();
      }
    }

    blocks.push({
      code,
      language: lang,
      filename: filename,
    });
  });

  return blocks;
}
