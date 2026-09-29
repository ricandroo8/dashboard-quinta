import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import pomodoroCompleteSound from "./assets/pomodoro-complete.wav";

import DashboardHome from './components/dashboard/DashboardHome';
import DashboardLayout from './components/layout/DashboardLayout';
import TaskManager from './components/tasks/TaskManager';
import PomodoroTimer from "./components/pomodoro/PomodoroTimer";
import CalendarWidget from "./components/calendar/CalendarWidget";
import QuickNotesHub from "./components/quick-notes/QuickNotesHub";
import SettingsPage from "./components/settings/SettingsPage";
import useAppearance from "./hooks/useAppearance";

import useICal from "./hooks/useICal";
import useF1Data from './hooks/useF1Data';
import useDashboardBackground from "./hooks/useDashboardBackground";
import useLocalStorage from './hooks/useLocalStorage';
import {
  getPathnameForSection,
  getSectionFromPathname,
} from "./utils/navigation";

import {
  POMODORO_DEFAULTS,
  POMODORO_MODES,
} from "./constants/pomodoro";

export default function App() {

  const [activeSection, setActiveSection] = useState(() =>
    getSectionFromPathname(window.location.pathname)
  );
  const [storedTheme, setStoredTheme] = useLocalStorage(
    "dashboard_theme",
    "dark",
  );

  const theme = storedTheme === "light" ? "light" : "dark";
  const { preferences, saveError, updatePreference, resetPreferences } = useAppearance();
  const {
    backgrounds,
    isBackgroundLoading,
    backgroundError,
    selectBackground,
    resetBackground,
  } = useDashboardBackground();
  const [tasks, setTasks] = useLocalStorage("dashboard_tasks", []);
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

  const [studySessions, setStudySessions] = useLocalStorage(
    "dashboard_study_sessions",
    [],
  );

  const processedPomodoroTargetRef = useRef(null);

  useLayoutEffect(() => {
    const rootElement = document.documentElement;

    rootElement.classList.toggle(
      "dark",
      theme === "dark",
    );

    rootElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const currentSection = getSectionFromPathname(
      window.location.pathname,
    );
    const normalizedPathname = getPathnameForSection(currentSection);

    if (window.location.pathname !== normalizedPathname) {
      window.history.replaceState({}, "", normalizedPathname);
    }

    const handlePopState = () => {
      setActiveSection(
        getSectionFromPathname(window.location.pathname),
      );
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const targetEndTimestamp = pomodoroState.targetEndTimestamp;

    if (!pomodoroState.isRunning || !targetEndTimestamp) {
      return undefined;
    }

    const completeTimer = () => {
      if (processedPomodoroTargetRef.current === targetEndTimestamp) {
        return;
      }

      processedPomodoroTargetRef.current = targetEndTimestamp;

      const completedMode =
        pomodoroState.mode ?? POMODORO_MODES.WORK;

      if (
        completedMode === POMODORO_MODES.WORK &&
        pomodoroState.selectedSubjectId
      ) {
        const sessionId = `ses-${targetEndTimestamp}`;

        setStudySessions((currentSessions) => {
          if (currentSessions.some((session) => session.id === sessionId)) {
            return currentSessions;
          }

          return [
            ...currentSessions,
            {
              id: sessionId,
              subjectId: pomodoroState.selectedSubjectId,
              durationMinutes: pomodoroConfig.workDurationMinutes,
              completedAt: new Date(targetEndTimestamp).toISOString(),
              type: "POMODORO",
            },
          ];
        });
      }

      const audio = new Audio(pomodoroCompleteSound);

      audio.play().catch((error) => {
        console.warn("Impossibile riprodurre il suono:", error);
      });

      setPomodoroState((currentState) => {
        if (
          !currentState.isRunning ||
          currentState.targetEndTimestamp !== targetEndTimestamp
        ) {
          return currentState;
        }

        if (completedMode === POMODORO_MODES.WORK) {
          const nextCycle = (currentState.completedCycles ?? 0) + 1;
          const nextMode =
            nextCycle % POMODORO_DEFAULTS.longBreakInterval === 0
              ? POMODORO_MODES.LONG_BREAK
              : POMODORO_MODES.SHORT_BREAK;

          return {
            ...currentState,
            mode: nextMode,
            isRunning: false,
            completedCycles: nextCycle,
            targetEndTimestamp: null,
            remainingSecondsOnPause: null,
          };
        }

        return {
          ...currentState,
          mode: POMODORO_MODES.WORK,
          selectedSubjectId: "",
          isRunning: false,
          targetEndTimestamp: null,
          remainingSecondsOnPause: null,
        };
      });
    };

    const timeoutId = setTimeout(
      completeTimer,
      Math.max(0, targetEndTimestamp - Date.now()),
    );

    const reconcileTimer = () => {
      if (Date.now() >= targetEndTimestamp) {
        completeTimer();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        reconcileTimer();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );
    window.addEventListener("focus", reconcileTimer);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
      window.removeEventListener("focus", reconcileTimer);
    };
  }, [
    pomodoroConfig.workDurationMinutes,
    pomodoroState.isRunning,
    pomodoroState.mode,
    pomodoroState.selectedSubjectId,
    pomodoroState.targetEndTimestamp,
    setPomodoroState,
    setStudySessions,
  ]);

  const {
    events: calendarEvents,
    loading: calendarLoading,
    error: calendarError,
    authRequired: calendarAuthRequired,
    unlockCalendar,
    lockCalendar,
  } = useICal("/api/school-calendar");

  const {
    nextRace,
    drivers,
    constructors,
    loading: f1Loading,
    error: f1Error,
  } = useF1Data();

  const f1Data = nextRace
    ? {
        nextRace,
        drivers,
        constructors,
      }
    : null;

  function handleToggleTheme() {
    setStoredTheme((currentTheme) =>
      currentTheme === "light" ? "dark" : "light"
    );
  }

  function handleToggleTask(taskId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        const nextCompletedState = !task.completed;

        return {
          ...task,
          completed: nextCompletedState,
          completedAt: nextCompletedState
            ? new Date().toISOString()
            : null,
        };
      })
    );
  }

  function handleSectionChange(section) {
    const pathname = getPathnameForSection(section);
    const nextSection = getSectionFromPathname(pathname);

    if (window.location.pathname !== pathname) {
      window.history.pushState({}, "", pathname);
    }

    setActiveSection(nextSection);
  }

  function handleOpenTasks() {
    handleSectionChange("tasks");
  }

  function handleOpenPomodoro() {
    handleSectionChange("pomodoro");
  }

  function handleOpenCalendar() {
    handleSectionChange("calendar");
  }
  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      theme={theme}
      onToggleTheme={handleToggleTheme}
      backgrounds={backgrounds}
      preferences={preferences}
    >
      {activeSection === 'dashboard' && (
        <DashboardHome
          tasks={tasks}
          onToggleTask={handleToggleTask}
          onOpenTasks={handleOpenTasks}
          pomodoroConfig={pomodoroConfig}
          pomodoroState={pomodoroState}
          setPomodoroState={setPomodoroState}
          onOpenPomodoro={handleOpenPomodoro}
          studySessions={studySessions}
          calendarEvents={calendarEvents}
          calendarLoading={calendarLoading}
          calendarError={calendarError}
          calendarAuthRequired={calendarAuthRequired}
          onOpenCalendar={handleOpenCalendar}
          f1Data={f1Data}
          f1Loading={f1Loading}
          f1Error={f1Error}
        />
      )}

      {activeSection === "tasks" && (
        <TaskManager
          tasks={tasks}
          setTasks={setTasks}
          onToggleTask={handleToggleTask}
        />
      )}
      {activeSection === "pomodoro" && (
        <PomodoroTimer
          pomodoroConfig={pomodoroConfig}
          setPomodoroConfig={setPomodoroConfig}
          pomodoroState={pomodoroState}
          setPomodoroState={setPomodoroState}
          studySessions={studySessions}
        />
      )}
      {activeSection === 'calendar' && (
        <CalendarWidget
          events={calendarEvents}
          loading={calendarLoading}
          error={calendarError}
          authRequired={calendarAuthRequired}
          onUnlock={unlockCalendar}
          onLock={lockCalendar}
        />
      )}
      {activeSection === "quick-notes" && (
        <QuickNotesHub />
      )}
      {activeSection === "settings" && (
        <SettingsPage
          theme={theme} backgrounds={backgrounds}
          isBackgroundLoading={isBackgroundLoading} backgroundError={backgroundError}
          onSelectBackground={selectBackground} onResetBackground={resetBackground}
          preferences={preferences} saveError={saveError}
          onChangePreference={updatePreference} onResetPreferences={resetPreferences}
        />
      )}
    </DashboardLayout>
  );
}
