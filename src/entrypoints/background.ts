// ============================================================
// Background Service Worker — Message Router
// ============================================================

import type { Message, MessageResponse } from '../shared/types';
import {
  createPackage,
  createProject,
  createRecord,
  createSnippet,
  deletePackage,
  deleteProject,
  deleteSnippet,
  getPackages,
  getProjects,
  getRecords,
  getSnippets,
  getTheme,
  setTheme,
  updateProject,
  updateSnippet,
} from '../lib/storage';

export default defineBackground(() => {
  // Context menu for capturing text selections
  chrome.contextMenus.create({
    id: 'mtp-capture-selection',
    title: 'Save to MTP Workbench',
    contexts: ['selection'],
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'mtp-capture-selection' && info.selectionText && tab?.id) {
      chrome.sidePanel.open({ tabId: tab.id });

      // Send captured text to sidebar
      chrome.runtime.sendMessage({
        type: 'CAPTURED_TEXT',
        payload: {
          text: info.selectionText,
          url: info.pageUrl,
          tabId: tab.id,
        },
      });
    }
  });

  // Open side panel on extension icon click
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(console.error);

  // Message router
  chrome.runtime.onMessage.addListener(
    (message: Message, _sender, sendResponse: (response: MessageResponse) => void) => {
      handleMessage(message)
        .then(sendResponse)
        .catch((error) =>
          sendResponse({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }),
        );

      // Return true to indicate async response
      return true;
    },
  );
});

async function handleMessage(message: Message): Promise<MessageResponse> {
  const { type, payload } = message;

  switch (type) {
    // Projects
    case 'GET_PROJECTS':
      return { success: true, data: await getProjects() };
    case 'CREATE_PROJECT':
      return { success: true, data: await createProject(payload as any) };
    case 'UPDATE_PROJECT': {
      const { id, ...updates } = payload as any;
      return { success: true, data: await updateProject(id, updates) };
    }
    case 'DELETE_PROJECT':
      await deleteProject((payload as any).id);
      return { success: true };

    // Snippets
    case 'GET_SNIPPETS':
      return { success: true, data: await getSnippets((payload as any).project_id) };
    case 'CREATE_SNIPPET':
      return { success: true, data: await createSnippet(payload as any) };
    case 'UPDATE_SNIPPET': {
      const { id, ...updates } = payload as any;
      return { success: true, data: await updateSnippet(id, updates) };
    }
    case 'DELETE_SNIPPET':
      await deleteSnippet((payload as any).id);
      return { success: true };

    // Packages
    case 'GET_PACKAGES':
      return { success: true, data: await getPackages((payload as any).project_id) };
    case 'CREATE_PACKAGE':
      return { success: true, data: await createPackage(payload as any) };
    case 'DELETE_PACKAGE':
      await deletePackage((payload as any).id);
      return { success: true };

    // Execution Records
    case 'GET_RECORDS':
      return { success: true, data: await getRecords((payload as any).project_id) };
    case 'CREATE_RECORD':
      return { success: true, data: await createRecord(payload as any) };

    // Theme
    case 'GET_THEME':
      return { success: true, data: await getTheme() };
    case 'SET_THEME':
      await setTheme(payload as any);
      return { success: true };

    default:
      return { success: false, error: `Unknown message type: ${type}` };
  }
}
