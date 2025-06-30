import type { HandleEventListeners } from "../handle-event-listeners";

export class ChromeStorage {
  constructor(handleEventListeners: HandleEventListeners) {
    chrome.storage.local.get((result: { enabled: boolean }) => {
      const enabled = result.enabled == null ? true : result.enabled;
      handleEventListeners.enableEventListeners(enabled);
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === "local") {
        if ("enabled" in changes) {
          handleEventListeners.enableEventListeners(changes.enabled.newValue);
        }
      }
    });
  }
}
