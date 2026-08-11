import { useEffect, useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";

import pomodoroCompleteSound from "../../assets/pomodoro-complete.wav";
import useLocalStorage from "../../hooks/useLocalStorage";

import { SUBJECTS } from "../../constants/subjects";

import {
  POMODORO_DEFAULTS,
  POMODORO_LABELS,
  POMODORO_MODES,
} from "../../constants/pomodoro";

import StudySummary from "./StudySummary";

const getModeDurationSeconds = (mode, config) => {
  if (mode === POMODORO_MODES.SHORT_BREAK) {
    return config.shortBreakMinutes * 60;
  }

  if (mode === POMODORO_MODES.LONG_BREAK) {
    return config.longBreakMinutes * 60;
  }

  return config.workDurationMinutes * 60;
};

function PomodoroTimer() {
  const [pomodoroConfig, setPomodoroConfig] = useLocalStorage(
    "dashboard_pomodoro_config",
    {
      workDurationMinutes: POMODORO_DEFAULTS.workDurationMinutes,
      shortBreakMinutes: POMODORO_DEFAULTS.shortBreakMinutes,
      longBreakMinutes: POMODORO_DEFAULTS.longBreakMinutes,
    },
  );

  const [pomodoroState, setPomodoroState] = useLocalStorage(
    "dashboard_pomodoro_state",
    {
      mode: POMODORO_MODES.WORK,
      selectedSubjectId: "",
      isRunning: false,
      completedCycles: 0,
      targetEndTimestamp: null,
      remainingSecondsOnPause: null,
    },
  );

  const [mode, setMode] = useState(
    pomodoroState.mode ?? POMODORO_MODES.WORK,
  );

  const [selectedSubjectId, setSelectedSubjectId] = useState(
    pomodoroState.selectedSubjectId ?? "",
  );

  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (pomodoroState.isRunning && pomodoroState.targetEndTimestamp) {
      const remainingSeconds = Math.ceil(
        (pomodoroState.targetEndTimestamp - Date.now()) / 1000,
      );

      return Math.max(0, remainingSeconds);
    }

    if (pomodoroState.remainingSecondsOnPause !== null) {
      return pomodoroState.remainingSecondsOnPause;
    }

    return getModeDurationSeconds(
      pomodoroState.mode ?? POMODORO_MODES.WORK,
      pomodoroConfig,
    );
  });

  const [isRunning, setIsRunning] = useState(
    pomodoroState.isRunning ?? false,
  );

  const [completedCycles, setCompletedCycles] = useState(
    pomodoroState.completedCycles ?? 0,
  );

  const [errorMessage, setErrorMessage] = useState("");

  const [studySessions, setStudySessions] = useLocalStorage(
    "dashboard_study_sessions",
    [],
  );

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;

  const registerStudySession = () => {
    const newSession = {
      id: `ses-${Date.now()}`,
      subjectId: selectedSubjectId,
      durationMinutes: pomodoroConfig.workDurationMinutes,
      completedAt: new Date().toISOString(),
      type: "POMODORO",
    };

    setStudySessions((currentSessions) => [
      ...currentSessions,
      newSession,
    ]);
  };

  const playCompletionSound = () => {
    const audio = new Audio(pomodoroCompleteSound);

    audio.play().catch((error) => {
      console.warn("Impossibile riprodurre il suono:", error);
    });
  };

  const handleTimerComplete = () => {
    playCompletionSound();

    if (mode === POMODORO_MODES.WORK) {
      registerStudySession();

      const nextCycle = completedCycles + 1;

      setCompletedCycles(nextCycle);

      if (nextCycle % POMODORO_DEFAULTS.longBreakInterval === 0) {
        setMode(POMODORO_MODES.LONG_BREAK);

        setSecondsLeft(
          getModeDurationSeconds(
            POMODORO_MODES.LONG_BREAK,
            pomodoroConfig,
          ),
        );

        return;
      }

      setMode(POMODORO_MODES.SHORT_BREAK);

      setSecondsLeft(
        getModeDurationSeconds(
          POMODORO_MODES.SHORT_BREAK,
          pomodoroConfig,
        ),
      );

      return;
    }

    if (
      mode === POMODORO_MODES.SHORT_BREAK ||
      mode === POMODORO_MODES.LONG_BREAK
    ) {
      setMode(POMODORO_MODES.WORK);

      // La materia viene azzerata solo dopo la pausa,
      // quando deve iniziare una nuova sessione di studio.
      setSelectedSubjectId("");

      setSecondsLeft(
        getModeDurationSeconds(
          POMODORO_MODES.WORK,
          pomodoroConfig,
        ),
      );
    }
  };

  const handleResetTimer = () => {
    setIsRunning(false);

    setSecondsLeft(
      getModeDurationSeconds(mode, pomodoroConfig),
    );

    setPomodoroState((currentState) => ({
      ...currentState,
      isRunning: false,
      targetEndTimestamp: null,
      remainingSecondsOnPause: null,
    }));
  };

  const handleRestoreDurations = () => {
    const defaultConfig = {
      workDurationMinutes: POMODORO_DEFAULTS.workDurationMinutes,
      shortBreakMinutes: POMODORO_DEFAULTS.shortBreakMinutes,
      longBreakMinutes: POMODORO_DEFAULTS.longBreakMinutes,
    };

    setPomodoroConfig(defaultConfig);

    setSecondsLeft(
      getModeDurationSeconds(mode, defaultConfig),
    );
  };

  const handleResetPomodoroData = () => {
    const shouldReset = window.confirm(
      "Vuoi davvero cancellare lo stato del Pomodoro, le impostazioni e tutte le sessioni di studio?",
    );

    if (!shouldReset) {
      return;
    }

    localStorage.removeItem("dashboard_pomodoro_state");
    localStorage.removeItem("dashboard_study_sessions");
    localStorage.removeItem("dashboard_pomodoro_config");

    window.location.reload();
  };

  useEffect(() => {
    setPomodoroState((currentState) => ({
      ...currentState,
      mode,
      selectedSubjectId,
      isRunning,
      completedCycles,
    }));
  }, [
    mode,
    selectedSubjectId,
    isRunning,
    completedCycles,
    setPomodoroState,
  ]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((currentSeconds) =>
        Math.max(0, currentSeconds - 1),
      );
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning || secondsLeft > 0) {
      return;
    }

    setIsRunning(false);

    setPomodoroState((currentState) => ({
      ...currentState,
      isRunning: false,
      targetEndTimestamp: null,
      remainingSecondsOnPause: null,
    }));

    handleTimerComplete();
  }, [isRunning, secondsLeft]);

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6">
          <p className="text-sm text-slate-400">
            Timer Pomodoro
          </p>

          <h2 className="text-xl font-semibold text-white">
            {POMODORO_LABELS[mode]}
          </h2>
        </div>

        <div className="mb-8 text-center">
          <p className="font-mono text-6xl font-semibold tracking-tight text-white">
            {formattedTime}
          </p>

          <p className="mt-2 text-sm text-slate-400">
            Cicli completati: {completedCycles}
          </p>
        </div>

        <div className="space-y-4">
          <select
            value={selectedSubjectId}
            onChange={(event) => {
              setSelectedSubjectId(event.target.value);
              setErrorMessage("");
            }}
            disabled={
              isRunning ||
              mode !== POMODORO_MODES.WORK
            }
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              Seleziona materia
            </option>

            {SUBJECTS.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.label}
              </option>
            ))}
          </select>

          {errorMessage && (
            <p className="text-sm text-red-400">
              {errorMessage}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                if (
                  !isRunning &&
                  mode === POMODORO_MODES.WORK &&
                  !selectedSubjectId
                ) {
                  setErrorMessage(
                    "Seleziona una materia prima di avviare il timer.",
                  );

                  return;
                }

                setErrorMessage("");

                if (!isRunning) {
                  const targetEndTimestamp =
                    Date.now() + secondsLeft * 1000;

                  setPomodoroState((currentState) => ({
                    ...currentState,
                    targetEndTimestamp,
                    remainingSecondsOnPause: null,
                    isRunning: true,
                  }));

                  setIsRunning(true);

                  return;
                }

                setPomodoroState((currentState) => ({
                  ...currentState,
                  targetEndTimestamp: null,
                  remainingSecondsOnPause: secondsLeft,
                  isRunning: false,
                }));

                setIsRunning(false);
              }}
              className="flex-1 rounded-xl bg-white px-4 py-3 font-medium text-slate-950 transition hover:bg-slate-200"
            >
              {isRunning ? "Pausa" : "Avvia"}
            </button>

            <button
              type="button"
              onClick={handleResetTimer}
              className="rounded-xl border border-white/10 px-4 py-3 font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              Reset
            </button>
          </div>

          <div className="border-t border-white/10 pt-5">
            <div className="mb-4">
              <p className="text-sm font-medium text-white">
                Durate
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Personalizza la durata delle sessioni e delle pause.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="space-y-1.5">
                <span className="text-xs text-slate-400">
                  Studio
                </span>

                <input
                  type="number"
                  min="1"
                  max="180"
                  value={pomodoroConfig.workDurationMinutes}
                  disabled={isRunning}
                  onChange={(event) => {
                    const value = Number(event.target.value);

                    if (
                      !Number.isInteger(value) ||
                      value < 1 ||
                      value > 180
                    ) {
                      return;
                    }

                    setPomodoroConfig((currentConfig) => ({
                      ...currentConfig,
                      workDurationMinutes: value,
                    }));
                  }}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs text-slate-400">
                  Pausa breve
                </span>

                <input
                  type="number"
                  min="1"
                  max="180"
                  value={pomodoroConfig.shortBreakMinutes}
                  disabled={isRunning}
                  onChange={(event) => {
                    const value = Number(event.target.value);

                    if (
                      !Number.isInteger(value) ||
                      value < 1 ||
                      value > 180
                    ) {
                      return;
                    }

                    setPomodoroConfig((currentConfig) => ({
                      ...currentConfig,
                      shortBreakMinutes: value,
                    }));
                  }}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-xs text-slate-400">
                  Pausa lunga
                </span>

                <input
                  type="number"
                  min="1"
                  max="180"
                  value={pomodoroConfig.longBreakMinutes}
                  disabled={isRunning}
                  onChange={(event) => {
                    const value = Number(event.target.value);

                    if (
                      !Number.isInteger(value) ||
                      value < 1 ||
                      value > 180
                    ) {
                      return;
                    }

                    setPomodoroConfig((currentConfig) => ({
                      ...currentConfig,
                      longBreakMinutes: value,
                    }));
                  }}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                disabled={isRunning}
                onClick={handleRestoreDurations}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw size={15} />
                Ripristina durate
              </button>

              <button
                type="button"
                disabled={isRunning}
                onClick={handleResetPomodoroData}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-sm font-medium text-red-300 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={15} />
                Azzera dati
              </button>
            </div>
          </div>
        </div>
      </div>

      <StudySummary studySessions={studySessions} />
    </section>
  );
}

export default PomodoroTimer;