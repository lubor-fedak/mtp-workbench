// ============================================================
// Shared Content Script Utilities
// ============================================================

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
