import styles from "./Toggle.module.css";

interface Props {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}

export function Toggle({ label, value, onChange }: Props) {
  const handleToggle = () => {
    onChange(!value);
  };

  return (
    <div className={styles.toggleContainer}>
      <span className={styles.toggleLabel}>{label}</span>
      {value == null ? null : (
        <button
          type="button"
          className={`${styles.toggleSwitch} ${value ? styles.toggleSwitchOn : styles.toggleSwitchOff}`}
          onClick={handleToggle}
          aria-pressed={value}
          aria-label={`${label} ${value ? "on" : "off"}`}
        >
          <span className={styles.toggleSlider}></span>
        </button>
      )}
    </div>
  );
}
