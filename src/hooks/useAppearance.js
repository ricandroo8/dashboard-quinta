import { useEffect, useState } from "react";
import { APPEARANCE_DEFAULTS, normalizeAppearance } from "../utils/appearance";

const STORAGE_KEY = "dashboard_appearance";

export default function useAppearance() {
  const [preferences, setPreferences] = useState(() => {
    try {
      return normalizeAppearance(JSON.parse(localStorage.getItem(STORAGE_KEY)));
    } catch {
      return { ...APPEARANCE_DEFAULTS };
    }
  });
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    // Debounce slider writes while keeping the visual preview immediate.
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
        setSaveError("");
      } catch {
        setSaveError("Le modifiche sono visibili, ma il browser non riesce a salvarle.");
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [preferences]);

  function updatePreference(key, value) {
    setPreferences((current) => normalizeAppearance({ ...current, [key]: value }));
  }

  function resetPreferences() {
    setPreferences({ ...APPEARANCE_DEFAULTS });
  }

  return { preferences, saveError, updatePreference, resetPreferences };
}
