import { useState } from 'react';

import { mockF1Data } from './data/mockF1Data';

import DashboardLayout from './components/layout/DashboardLayout';
import TaskManager from './components/tasks/TaskManager';
import PomodoroTimer from "./components/pomodoro/PomodoroTimer";
import CalendarWidget from "./components/calendar/CalendarWidget";
import QuickNotesHub from "./components/quick-notes/QuickNotesHub";
import F1Widget from './components/formula1/F1Widget';

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
    loading: f1Loading,
    error: f1Error,
  } = useF1Data();

  const f1Data = nextRace
    ? {
        ...mockF1Data,
        nextRace,
      }
    : null;
  

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {activeSection === 'dashboard' && (
        // F1 Widget
        <div className="w-full">
          {f1Loading && (
            <p>Caricamento dati Formula 1...</p>
          )}

          {!f1Loading && f1Error && (
            <p>Errore: {f1Error}</p>
          )}

          {!f1Loading && !f1Error && f1Data && (
            <F1Widget data={f1Data} />
          )}
        </div>
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
