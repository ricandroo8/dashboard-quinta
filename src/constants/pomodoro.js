export const POMODORO_MODES = {
  WORK: "WORK",
  SHORT_BREAK: "SHORT_BREAK",
  LONG_BREAK: "LONG_BREAK",
};

export const POMODORO_DEFAULTS = {
  workDurationMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
};

export const POMODORO_LABELS = {
  [POMODORO_MODES.WORK]: "Studio",
  [POMODORO_MODES.SHORT_BREAK]: "Pausa breve",
  [POMODORO_MODES.LONG_BREAK]: "Pausa lunga",
};