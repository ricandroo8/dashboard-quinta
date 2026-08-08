import { useEffect, useState } from "react";
import useLocalStorage from "../../hooks/useLocalStorage";

import {
  POMODORO_DEFAULTS,
  POMODORO_LABELS,
  POMODORO_MODES,
} from "../../constants/pomodoro";

import StudySummary from "./StudySummary";

const getModeDurationSeconds = (mode) => {
  if (mode === POMODORO_MODES.SHORT_BREAK) {
    return POMODORO_DEFAULTS.shortBreakMinutes * 60;
  }

  if (mode === POMODORO_MODES.LONG_BREAK) {
    return POMODORO_DEFAULTS.longBreakMinutes * 60;
  }

  return POMODORO_DEFAULTS.workDurationMinutes * 60;
};

function PomodoroTimer() {
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
  const [mode, setMode] = useState(pomodoroState.mode ?? POMODORO_MODES.WORK);

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

    return getModeDurationSeconds(pomodoroState.mode ?? POMODORO_MODES.WORK);
  });

  const [isRunning, setIsRunning] = useState(pomodoroState.isRunning ?? false);

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
      durationMinutes: POMODORO_DEFAULTS.workDurationMinutes,
      completedAt: new Date().toISOString(),
      type: "POMODORO",
    };

    setStudySessions((currentSessions) => [...currentSessions, newSession]);
  };

  const handleTimerComplete = () => {
    if (mode === POMODORO_MODES.WORK) {
      registerStudySession();

      const nextCycle = completedCycles + 1;

      setCompletedCycles(nextCycle);

      if (nextCycle % POMODORO_DEFAULTS.longBreakInterval === 0) {
        setMode(POMODORO_MODES.LONG_BREAK);
        setSecondsLeft(POMODORO_DEFAULTS.longBreakMinutes * 60);
        return;
      }

      setMode(POMODORO_MODES.SHORT_BREAK);
      setSecondsLeft(POMODORO_DEFAULTS.shortBreakMinutes * 60);
      return;
    }

    if (
      mode === POMODORO_MODES.SHORT_BREAK ||
      mode === POMODORO_MODES.LONG_BREAK
    ) {
      setMode(POMODORO_MODES.WORK);
      setSelectedSubjectId("");
      setSecondsLeft(POMODORO_DEFAULTS.workDurationMinutes * 60);
    }
  };

  useEffect(() => {
    setPomodoroState((currentState) => ({
      ...currentState,
      mode,
      selectedSubjectId,
      isRunning,
      completedCycles,
    }));
  }, [mode, selectedSubjectId, isRunning, completedCycles, setPomodoroState]);

  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 1) {
          clearInterval(intervalId);
          setIsRunning(false);
          handleTimerComplete();
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isRunning, mode]);

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6">
          <p className="text-sm text-slate-400">Timer Pomodoro</p>

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
            disabled={isRunning}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Seleziona materia</option>
            <option value="subj-info">Informatica</option>
            <option value="subj-math">Matematica</option>
            <option value="subj-sistemi">Sistemi e Reti</option>
          </select>

          {errorMessage && (
            <p className="text-sm text-red-400">{errorMessage}</p>
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
                  const targetEndTimestamp = Date.now() + secondsLeft * 1000;

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
              onClick={() => {
                setIsRunning(false);
                setSecondsLeft(POMODORO_DEFAULTS.workDurationMinutes * 60);
              }}
              className="rounded-xl border border-white/10 px-4 py-3 font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <StudySummary studySessions={studySessions} />
    </section>
  );
}

export default PomodoroTimer;
