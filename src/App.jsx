import { useState } from 'react';

import DashboardHome from './components/dashboard/DashboardHome';
import DashboardLayout from './components/layout/DashboardLayout';
import TaskManager from './components/tasks/TaskManager';
import PomodoroTimer from "./components/pomodoro/PomodoroTimer";
import CalendarWidget from "./components/calendar/CalendarWidget";
import QuickNotesHub from "./components/quick-notes/QuickNotesHub";

import useICal from "./hooks/useICal";
import useF1Data from './hooks/useF1Data';
import useLocalStorage from './hooks/useLocalStorage';

import {
  POMODORO_DEFAULTS,
  POMODORO_MODES,
} from "./constants/pomodoro";

export default function App() {

  const [activeSection, setActiveSection] = useState('dashboard');
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

  const {
    events: calendarEvents,
    loading: calendarLoading,
    error: calendarError,
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

  function handleOpenTasks() {
    setActiveSection("tasks");
  }

  function handleOpenPomodoro() {
    setActiveSection("pomodoro");
  }
  

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
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
        />
      )}
      {activeSection === 'calendar' && (
        <CalendarWidget
          events={calendarEvents}
          loading={calendarLoading}
          error={calendarError}
        />
      )}
      {activeSection === "quick-notes" && (
        <QuickNotesHub />
      )}
    </DashboardLayout>
  );
}
