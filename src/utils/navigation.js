const SECTION_PATHS = {
  dashboard: "/",
  tasks: "/tasks",
  pomodoro: "/pomodoro",
  calendar: "/calendar",
  "quick-notes": "/quick-notes",
};

const PATH_SECTIONS = Object.fromEntries(
  Object.entries(SECTION_PATHS).map(([section, pathname]) => [
    pathname,
    section,
  ]),
);

function normalizePathname(pathname) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/+$/, "") || "/";
}

export function getSectionFromPathname(pathname) {
  return PATH_SECTIONS[normalizePathname(pathname)] ?? "dashboard";
}

export function getPathnameForSection(section) {
  return SECTION_PATHS[section] ?? SECTION_PATHS.dashboard;
}
