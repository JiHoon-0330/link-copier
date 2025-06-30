import { ChromeStorage } from "./chrome/storage";

new ChromeStorage((enabled) => {
  chrome.action.setIcon({
    path: enabled ? "icon128.png" : "icon128.disabled.png",
  });
});
