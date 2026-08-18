import { useState } from 'react';

import DashboardHome from './components/dashboard/DashboardHome';
import DashboardLayout from './components/layout/DashboardLayout';
import TaskManager from './components/tasks/TaskManager';
import PomodoroTimer from "./components/pomodoro/PomodoroTimer";
import CalendarWidget from "./components/calendar/CalendarWidget";
import QuickNotesHub from "./components/quick-notes/QuickNotesHub";

import useICal from "./hooks/useICal";
import useF1Data from './hooks/useF1Data';

export default function App() {

  const [activeSection, setActiveSection] = useState('dashboard');

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
  

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {activeSection === 'dashboard' && (
        <DashboardHome
          f1Data={f1Data}
          f1Loading={f1Loading}
          f1Error={f1Error}
        />
      )}

      {activeSection === 'tasks' && <TaskManager />}
      {activeSection === 'pomodoro' && <PomodoroTimer />}
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
