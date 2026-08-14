import { useEffect, useState } from "react";

import {
  Pencil,
  Save,
  StickyNote,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "dashboard_quick_hub";
const SAVE_DELAY_MS = 500;

const DEFAULT_QUICK_HUB = {
  draft: {
    content: "",
    lastUpdated: null,
  },
  notes: [],
};

function isValidDate(value) {
  return (
    value === null ||
    (
      typeof value === "string" &&
      !Number.isNaN(Date.parse(value))
    )
  );
}

function loadStoredQuickHub() {
  try {
    const savedValue = localStorage.getItem(STORAGE_KEY);

    if (savedValue === null) {
      return DEFAULT_QUICK_HUB;
    }

    const parsedValue = JSON.parse(savedValue);

    // Compatibilità con la vecchia struttura:
    // { content, lastUpdated }
    if (typeof parsedValue?.content === "string") {
      return {
        draft: {
          content: parsedValue.content,
          lastUpdated: isValidDate(parsedValue.lastUpdated)
            ? parsedValue.lastUpdated
            : null,
        },
        notes: [],
      };
    }

    const hasValidDraft =
      typeof parsedValue?.draft?.content === "string" &&
      isValidDate(parsedValue.draft.lastUpdated);

    const hasValidNotes = Array.isArray(parsedValue?.notes);

    if (!hasValidDraft || !hasValidNotes) {
      return DEFAULT_QUICK_HUB;
    }

    const validNotes = parsedValue.notes.filter((savedNote) => {
      return (
        typeof savedNote?.id === "string" &&
        typeof savedNote?.content === "string" &&
        typeof savedNote?.createdAt === "string" &&
        typeof savedNote?.updatedAt === "string" &&
        isValidDate(savedNote.createdAt) &&
        isValidDate(savedNote.updatedAt)
      );
    });

    return {
      draft: parsedValue.draft,
      notes: validNotes,
    };
  } catch (error) {
    console.error(
      "Errore durante il caricamento del Quick Hub:",
      error
    );

    return DEFAULT_QUICK_HUB;
  }
}

function formatSavedTime(value) {
  return new Intl.DateTimeFormat("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatNoteDate(value) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function QuickNotesHub() {
  const [quickHub, setQuickHub] = useState(
    loadStoredQuickHub
  );

  const [isDirty, setIsDirty] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      try {
        const savedAt = new Date().toISOString();

        const savedQuickHub = {
          ...quickHub,

          draft: {
            ...quickHub.draft,
            lastUpdated: savedAt,
          },
        };

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(savedQuickHub)
        );

        setQuickHub(savedQuickHub);
        setIsDirty(false);
      } catch (error) {
        console.error(
          "Errore durante il salvataggio della bozza:",
          error
        );
      }
    }, SAVE_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [quickHub, isDirty]);

  function handleContentChange(event) {
    const newContent = event.target.value;

    setQuickHub((currentQuickHub) => ({
      ...currentQuickHub,

      draft: {
        ...currentQuickHub.draft,
        content: newContent,
      },
    }));

    setIsDirty(true);
  }

  function handleSaveNote() {
    const noteContent = quickHub.draft.content.trim();

    if (noteContent === "") {
      return;
    }

    const currentDate = new Date().toISOString();

    const newNote = {
      id: `note-${Date.now()}`,
      content: noteContent,
      createdAt: currentDate,
      updatedAt: currentDate,
    };

    const updatedQuickHub = {
      draft: {
        content: "",
        lastUpdated: null,
      },

      notes: [
        newNote,
        ...quickHub.notes,
      ],
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedQuickHub)
    );

    setQuickHub(updatedQuickHub);
    setIsDirty(false);
  }

  function handleDeleteNote(noteId) {
    const shouldDelete = window.confirm(
      "Vuoi eliminare definitivamente questa nota?"
    );

    if (!shouldDelete) {
      return;
    }

    const updatedQuickHub = {
      ...quickHub,

      notes: quickHub.notes.filter(
        (savedNote) => savedNote.id !== noteId
      ),
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedQuickHub)
    );

    setQuickHub(updatedQuickHub);

    if (editingNoteId === noteId) {
      setEditingNoteId(null);
      setEditingContent("");
    }
  }

  function handleStartEditing(savedNote) {
    setEditingNoteId(savedNote.id);
    setEditingContent(savedNote.content);
  }

  function handleCancelEditing() {
    setEditingNoteId(null);
    setEditingContent("");
  }

  function handleSaveChanges(noteId) {
    const newContent = editingContent.trim();

    if (newContent === "") {
      return;
    }

    const currentDate = new Date().toISOString();

    const updatedQuickHub = {
      ...quickHub,

      notes: quickHub.notes.map((savedNote) => {
        if (savedNote.id !== noteId) {
          return savedNote;
        }

        return {
          ...savedNote,
          content: newContent,
          updatedAt: currentDate,
        };
      }),
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedQuickHub)
    );

    setQuickHub(updatedQuickHub);
    setEditingNoteId(null);
    setEditingContent("");
  }

  let saveStatus = "Bozza vuota";

  if (quickHub.draft.lastUpdated !== null) {
    saveStatus = `Salvato alle ${formatSavedTime(
      quickHub.draft.lastUpdated
    )}`;
  }

  if (isDirty) {
    saveStatus = "Salvataggio in corso...";
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="mb-5 flex items-center gap-2">
        <StickyNote size={20} />

        <div>
          <h2 className="font-semibold">
            Quick Notes Hub
          </h2>

          <p className="text-sm text-white/50">
            Appunti veloci sempre a portata di mano
          </p>
        </div>
      </div>

      <label
        htmlFor="quick-note-content"
        className="mb-2 block text-sm font-medium text-white/80"
      >
        Nuova nota
      </label>

      <textarea
        id="quick-note-content"
        value={quickHub.draft.content}
        onChange={handleContentChange}
        placeholder="Scrivi qui un appunto, un promemoria o un'idea..."
        className="min-h-72 w-full resize-y rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm leading-relaxed text-white outline-none transition placeholder:text-white/30 focus:border-sky-400/50 focus:ring-2 focus:ring-sky-400/10"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <Save
            size={14}
            className={
              isDirty
                ? "text-amber-300"
                : "text-emerald-300"
            }
          />

          <span
            className={
              isDirty
                ? "text-amber-300"
                : "text-white/50"
            }
          >
            {saveStatus}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSaveNote}
          disabled={quickHub.draft.content.trim() === ""}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Save size={16} />
          Salva nota
        </button>
      </div>

      <div className="mt-8 border-t border-white/10 pt-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-semibold">
            Note salvate
          </h3>

          <span className="text-xs text-white/40">
            {quickHub.notes.length}
          </span>
        </div>

        {quickHub.notes.length === 0 ? (
          <p className="text-sm text-white/40">
            Non hai ancora salvato nessuna nota.
          </p>
        ) : (
          <div className="space-y-3">
            {quickHub.notes.map((savedNote) => (
              <article
                key={savedNote.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                {editingNoteId === savedNote.id ? (
                  <div>
                    <textarea
                      value={editingContent}
                      onChange={(event) =>
                        setEditingContent(event.target.value)
                      }
                      className="min-h-28 w-full resize-y rounded-xl border border-sky-400/30 bg-slate-950/40 p-3 text-sm leading-relaxed text-white outline-none focus:border-sky-400/60"
                    />

                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCancelEditing}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/5 hover:text-white"
                      >
                        Annulla
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleSaveChanges(savedNote.id)
                        }
                        disabled={editingContent.trim() === ""}
                        className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Salva modifiche
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-4">
                      <p className="min-w-0 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/90">
                        {savedNote.content}
                      </p>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handleStartEditing(savedNote)
                          }
                          aria-label="Modifica nota"
                          title="Modifica nota"
                          className="rounded-lg p-2 text-white/40 transition hover:bg-sky-400/10 hover:text-sky-300"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteNote(savedNote.id)
                          }
                          aria-label="Elimina nota"
                          title="Elimina nota"
                          className="rounded-lg p-2 text-white/40 transition hover:bg-rose-400/10 hover:text-rose-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-white/40">
                      {savedNote.updatedAt !== savedNote.createdAt
                        ? `Modificata il ${formatNoteDate(
                            savedNote.updatedAt
                          )}`
                        : `Salvata il ${formatNoteDate(
                            savedNote.createdAt
                          )}`}
                    </p>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default QuickNotesHub;