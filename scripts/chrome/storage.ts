export class ChromeStorage {
  constructor(handleEnabled: (enabled: boolean) => void) {
    chrome.storage.local.get((result: { enabled: boolean }) => {
      const enabled = result.enabled == null ? true : result.enabled;
      handleEnabled(enabled);
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === "local") {
        if ("enabled" in changes) {
          handleEnabled(changes.enabled.newValue);
        }
      }
    });
  }
}
