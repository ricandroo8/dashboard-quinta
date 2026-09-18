import { useEffect, useState } from "react";
import {
  Pause,
  Play,
  RotateCcw,
  Timer,
} from "lucide-react";

import {
  POMODORO_LABELS,
  POMODORO_MODES,
} from "../../constants/pomodoro";
import { SUBJECT_LABELS } from "../../constants/subjects";

function getDefaultDurationSeconds(mode, config) {
  if (mode === POMODORO_MODES.SHORT_BREAK) {
    return config.shortBreakMinutes * 60;
  }

  if (mode === POMODORO_MODES.LONG_BREAK) {
    return config.longBreakMinutes * 60;
  }

  return config.workDurationMinutes * 60;
}

function PomodoroOverviewWidget({
  pomodoroConfig,
  pomodoroState,
  setPomodoroState,
  onOpenPomodoro,
}) {
  const [now, setNow] = useState(null);

  const mode =
    pomodoroState.mode ?? POMODORO_MODES.WORK;

  useEffect(() => {
    if (
      !pomodoroState.isRunning ||
      !pomodoroState.targetEndTimestamp
    ) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setNow(Date.now());
    }, 0);

    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [
    pomodoroState.isRunning,
    pomodoroState.targetEndTimestamp,
  ]);

  let secondsLeft = getDefaultDurationSeconds(
    mode,
    pomodoroConfig,
  );

  if (
    pomodoroState.isRunning &&
    pomodoroState.targetEndTimestamp &&
    now !== null
  ) {
    secondsLeft = Math.max(
      0,
      Math.ceil(
        (pomodoroState.targetEndTimestamp - now) / 1000,
      ),
    );
  } else if (
    typeof pomodoroState.remainingSecondsOnPause === "number"
  ) {
    secondsLeft = Math.max(
      0,
      pomodoroState.remainingSecondsOnPause,
    );
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const formattedTime = `${String(minutes).padStart(
    2,
    "0",
  )}:${String(seconds).padStart(2, "0")}`;

  const modeLabel =
    POMODORO_LABELS[mode] ?? "Studio";

  const subjectLabel =
    SUBJECT_LABELS[pomodoroState.selectedSubjectId] ??
    "Nessuna materia";

  const isPaused =
    !pomodoroState.isRunning &&
    pomodoroState.remainingSecondsOnPause !== null;

  const isExpired =
    pomodoroState.isRunning && secondsLeft === 0;

  let statusLabel = "Pronto";
  let statusClasses =
    "border-white/10 bg-white/5 text-slate-300";

  if (pomodoroState.isRunning) {
    statusLabel = "In corso";
    statusClasses =
      "border-rose-400/20 bg-rose-400/10 text-rose-200";
  }

  if (isPaused) {
    statusLabel = "In pausa";
    statusClasses =
      "border-amber-400/20 bg-amber-400/10 text-amber-200";
  }

  if (isExpired) {
    statusLabel = "Terminato";
    statusClasses =
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }

  const needsSubject =
    mode === POMODORO_MODES.WORK &&
    !pomodoroState.selectedSubjectId;

  function handleToggleTimer() {
    if (isExpired) {
      onOpenPomodoro();
      return;
    }

    if (pomodoroState.isRunning) {
      setPomodoroState((currentState) => ({
        ...currentState,
        isRunning: false,
        targetEndTimestamp: null,
        remainingSecondsOnPause: secondsLeft,
      }));

      return;
    }

    if (needsSubject) {
      onOpenPomodoro();
      return;
    }

    const startTimestamp = Date.now();

    setNow(startTimestamp);

    setPomodoroState((currentState) => ({
      ...currentState,
      isRunning: true,
      targetEndTimestamp:
        startTimestamp + secondsLeft * 1000,
      remainingSecondsOnPause: null,
    }));
  }

  function handleResetTimer() {
    setNow(Date.now());

    setPomodoroState((currentState) => ({
      ...currentState,
      isRunning: false,
      targetEndTimestamp: null,
      remainingSecondsOnPause: null,
    }));
  }

  let primaryLabel = "Avvia";

  if (pomodoroState.isRunning) {
    primaryLabel = "Pausa";
  } else if (isPaused) {
    primaryLabel = "Riprendi";
  } else if (needsSubject) {
    primaryLabel = "Configura";
  }

  if (isExpired) {
    primaryLabel = "Apri timer";
  }

  return (
    <section className="group relative min-h-44 w-full min-w-0 cursor-pointer overflow-hidden rounded-3xl border border-rose-300/15 bg-slate-900/60 p-5 text-left shadow-xl shadow-black/10 backdrop-blur-md transition hover:border-rose-300/30 hover:bg-slate-900/75">
      <button
        type="button"
        onClick={onOpenPomodoro}
        aria-label={`Apri Pomodoro: ${modeLabel}, ${formattedTime} rimanenti`}
        className="absolute inset-0 z-10 rounded-3xl focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-400/40"
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-400/[0.06] to-transparent"
      />

      <span className="pointer-events-none relative z-20 flex h-full flex-col">
        <span className="flex items-start justify-between gap-4">
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-400/10 text-rose-300">
              <Timer size={18} aria-hidden="true" />
            </span>

            <span className="min-w-0">
              <span className="block text-base font-semibold text-slate-100 transition group-hover:text-rose-300">
                Pomodoro
              </span>

              <span className="block text-xs text-slate-400">
                Sessione di studio
              </span>
            </span>
          </span>

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses}`}
          >
            {statusLabel}
          </span>
        </span>

        <span className="mt-6 flex items-end justify-between gap-4">
          <span>
            <span className="block font-mono text-4xl font-semibold tracking-tight text-white">
              {formattedTime}
            </span>

            <span className="mt-1 block text-sm font-medium text-rose-200">
              {modeLabel}
            </span>
          </span>

          <span className="text-right">
            <span className="block max-w-32 truncate text-sm text-slate-300">
              {subjectLabel}
            </span>

            <span className="mt-1 block text-xs text-slate-500">
              {pomodoroState.completedCycles ?? 0} cicli completati
            </span>
          </span>
        </span>

        <span className="pointer-events-auto relative z-30 mt-5 flex gap-2">
          <button
            type="button"
            onClick={handleToggleTimer}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-400/40"
          >
            {pomodoroState.isRunning ? (
              <Pause size={16} aria-hidden="true" />
            ) : (
              <Play size={16} aria-hidden="true" />
            )}

            {primaryLabel}
          </button>

          <button
            type="button"
            onClick={handleResetTimer}
            aria-label="Reimposta il timer"
            className="inline-flex items-center justify-center rounded-xl border border-white/10 px-3 py-2 text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-rose-400/40"
          >
            <RotateCcw size={16} aria-hidden="true" />
          </button>
        </span>
      </span>
    </section>
  );
}

export default PomodoroOverviewWidget;
