import { useCallback, useEffect, useRef, useState } from "react";

const DATABASE_NAME = "dashboard-quinta-preferences";
const DATABASE_VERSION = 1;
const STORE_NAME = "appearance";
const LEGACY_BACKGROUND_KEY = "custom-background";
const BACKGROUND_KEYS = {
  light: "custom-background-light",
  dark: "custom-background-dark",
};
const DEFAULT_BACKGROUNDS = {
  light: {
    url: "/backgrounds/premium-daylight-view.png",
    name: "Premium giorno",
    isCustom: false,
  },
  dark: {
    url: "/backgrounds/premium-evening-view.png",
    name: "Premium sera",
    isCustom: false,
  },
};
const MAX_BACKGROUND_SIZE = 20 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("Il browser non supporta il salvataggio dello sfondo."));
      return;
    }

    const request = window.indexedDB.open(
      DATABASE_NAME,
      DATABASE_VERSION,
    );

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readStoredBackground(key) {
  const database = await openDatabase();

  try {
    return await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(key);

      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
}

async function writeStoredBackground(key, background) {
  const database = await openDatabase();

  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");

      transaction.objectStore(STORE_NAME).put(background, key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

async function deleteStoredBackground(key) {
  const database = await openDatabase();

  try {
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, "readwrite");

      transaction.objectStore(STORE_NAME).delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

function validateTheme(theme) {
  if (!(theme in BACKGROUND_KEYS)) {
    throw new Error("Tema dello sfondo non valido.");
  }
}

function validateImageFile(file) {
  if (!file || !SUPPORTED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Scegli un'immagine JPG, PNG, WebP o AVIF.");
  }

  if (file.size > MAX_BACKGROUND_SIZE) {
    throw new Error("Lo sfondo può pesare al massimo 20 MB.");
  }
}

function verifyImageCanLoad(file) {
  return new Promise((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file);
    const image = new Image();

    const cleanup = () => URL.revokeObjectURL(previewUrl);

    image.onload = () => {
      cleanup();
      resolve();
    };
    image.onerror = () => {
      cleanup();
      reject(new Error("Il file selezionato non è un'immagine valida."));
    };
    image.src = previewUrl;
  });
}

function createInitialBackgrounds() {
  return {
    light: { ...DEFAULT_BACKGROUNDS.light },
    dark: { ...DEFAULT_BACKGROUNDS.dark },
  };
}

export default function useDashboardBackground() {
  const [backgrounds, setBackgrounds] = useState(createInitialBackgrounds);
  const [isBackgroundLoading, setIsBackgroundLoading] = useState(true);
  const [backgroundError, setBackgroundError] = useState("");
  const objectUrlsRef = useRef({ light: null, dark: null });

  const replaceObjectUrl = useCallback((theme, blob, name) => {
    if (objectUrlsRef.current[theme]) {
      URL.revokeObjectURL(objectUrlsRef.current[theme]);
    }

    const nextUrl = URL.createObjectURL(blob);
    objectUrlsRef.current[theme] = nextUrl;
    setBackgrounds((currentBackgrounds) => ({
      ...currentBackgrounds,
      [theme]: {
        url: nextUrl,
        name: name || "Sfondo personale",
        isCustom: true,
      },
    }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function restoreBackgrounds() {
      try {
        const [lightBackground, storedDarkBackground, legacyBackground] =
          await Promise.all([
            readStoredBackground(BACKGROUND_KEYS.light),
            readStoredBackground(BACKGROUND_KEYS.dark),
            readStoredBackground(LEGACY_BACKGROUND_KEY),
          ]);

        let darkBackground = storedDarkBackground;

        if (!darkBackground && legacyBackground?.blob) {
          darkBackground = legacyBackground;
          await writeStoredBackground(BACKGROUND_KEYS.dark, legacyBackground);
          await deleteStoredBackground(LEGACY_BACKGROUND_KEY);
        }

        if (cancelled) {
          return;
        }

        if (lightBackground?.blob) {
          replaceObjectUrl(
            "light",
            lightBackground.blob,
            lightBackground.name,
          );
        }

        if (darkBackground?.blob) {
          replaceObjectUrl(
            "dark",
            darkBackground.blob,
            darkBackground.name,
          );
        }
      } catch (error) {
        if (!cancelled) {
          setBackgroundError(
            error?.message || "Impossibile ripristinare gli sfondi personali.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsBackgroundLoading(false);
        }
      }
    }

    restoreBackgrounds();

    return () => {
      cancelled = true;

      Object.values(objectUrlsRef.current).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });

      objectUrlsRef.current = { light: null, dark: null };
    };
  }, [replaceObjectUrl]);

  const selectBackground = useCallback(
    async (theme, file) => {
      setBackgroundError("");
      setIsBackgroundLoading(true);

      try {
        validateTheme(theme);
        validateImageFile(file);
        await verifyImageCanLoad(file);
        await writeStoredBackground(BACKGROUND_KEYS[theme], {
          blob: file,
          name: file.name,
          type: file.type,
          updatedAt: new Date().toISOString(),
        });

        replaceObjectUrl(theme, file, file.name);
      } catch (error) {
        setBackgroundError(
          error?.message || "Impossibile usare lo sfondo selezionato.",
        );
      } finally {
        setIsBackgroundLoading(false);
      }
    },
    [replaceObjectUrl],
  );

  const resetBackground = useCallback(async (theme) => {
    setBackgroundError("");
    setIsBackgroundLoading(true);

    try {
      validateTheme(theme);
      await deleteStoredBackground(BACKGROUND_KEYS[theme]);

      if (objectUrlsRef.current[theme]) {
        URL.revokeObjectURL(objectUrlsRef.current[theme]);
        objectUrlsRef.current[theme] = null;
      }

      setBackgrounds((currentBackgrounds) => ({
        ...currentBackgrounds,
        [theme]: { ...DEFAULT_BACKGROUNDS[theme] },
      }));
    } catch (error) {
      setBackgroundError(
        error?.message || "Impossibile ripristinare lo sfondo predefinito.",
      );
    } finally {
      setIsBackgroundLoading(false);
    }
  }, []);

  return {
    backgrounds,
    isBackgroundLoading,
    backgroundError,
    selectBackground,
    resetBackground,
  };
}
