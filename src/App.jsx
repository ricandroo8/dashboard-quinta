import { useState } from 'react';

import {
  LayoutDashboard,
  CheckCircle2,
  Flame,
} from 'lucide-react';

import DashboardLayout from './components/layout/DashboardLayout';
import TaskManager from './components/tasks/TaskManager';
import PomodoroTimer from "./components/pomodoro/PomodoroTimer";
import CalendarWidget from "./components/calendar/CalendarWidget";
import QuickNotesHub from "./components/quick-notes/QuickNotesHub";

import useICal from "./hooks/useICal";

export default function App() {

  const [activeSection, setActiveSection] = useState('dashboard');

  const {
    events: calendarEvents,
    loading: calendarLoading,
    error: calendarError,
  } = useICal("/api/school-calendar");

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      {activeSection === 'dashboard' && (
        <div className="max-w-md w-full bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sky-400">
              <LayoutDashboard className="w-6 h-6" />

              <span className="font-bold text-lg tracking-wide">
                Dashboard Quinta
              </span>
            </div>

            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              FASE 0 Ready
            </span>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed">
            Setup ambiente completato su Ubuntu Linux! Tailwind CSS v3,
            PostCSS e Lucide Icons sono pronti all'uso.
          </p>

          <p className="text-sm text-slate-400">
            Sezione attiva:
            <span className="ml-2 font-semibold text-sky-300">
              {activeSection}
            </span>
          </p>

          <div className="pt-2 border-t border-slate-700/40 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 text-amber-400 font-medium">
              <Flame className="w-4 h-4" />
              Dev Server Attivo
            </span>

            <span>localhost:5173</span>
          </div>
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
