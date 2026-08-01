import {
  LayoutDashboard,
  CheckSquare,
  Timer,
  BookOpen,
  CalendarDays,
  StickyNote,
} from 'lucide-react';

export const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 'tasks',
    label: 'Attività',
    icon: CheckSquare,
  },
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    icon: Timer,
  },
  {
    id: 'study-tracker',
    label: 'Studio',
    icon: BookOpen,
  },
  {
    id: 'calendar',
    label: 'Calendario',
    icon: CalendarDays,
  },
  {
    id: 'quick-notes',
    label: 'Note rapide',
    icon: StickyNote,
  },
];