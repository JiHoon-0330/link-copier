import { useEffect, useState } from "react";
import { t } from "./__i18n__/i18n";
import styles from "./App.module.css";
import { Toggle } from "./components/Toggle";

function App() {
  const [isOn, setIsOn] = useState<boolean | null>(null);

  useEffect(() => {
    async function getEnabled() {
      const result = await chrome.storage.local.get();
      const enabled = result.enabled == null ? true : result.enabled;
      setIsOn(enabled);
    }

    getEnabled();
  }, []);

  function handleClickButton(next: boolean) {
    chrome.storage.local.set({ enabled: next });
    setIsOn(next);
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Link Copier</h1>
      <Toggle label={t("enabled")} value={isOn} onChange={handleClickButton} />
    </main>
  );
}

export default App;
