import Header from '../header/Header';
import Sidebar from '../navigation/Sidebar';
import ThemeToggle from "../theme/ThemeToggle";

function DashboardLayout({
  children,
  activeSection,
  onSectionChange,
  theme,
  onToggleTheme,
  backgrounds,
  preferences,
  userEmail,
  onSignOut,
}) {
  return (
    <div className="glass-dashboard relative min-h-screen overflow-x-clip text-slate-900 dark:text-slate-100"
      data-high-contrast={preferences.highContrast}
      data-reduced-motion={preferences.reducedMotion}
      style={{
        '--wallpaper-blur': `${preferences.wallpaperBlur}px`,
        '--glass-panel-blur': `${preferences.panelBlur}px`,
        '--glass-section-blur': `${preferences.sectionBlur}px`,
        '--glass-chrome-blur': `${preferences.chromeBlur}px`,
      }}>
      <div className="dashboard-wallpaper" aria-hidden="true">
        <div
          className={`dashboard-wallpaper__image ${
            theme === "light" ? "is-active" : ""
          }`}
          style={{ backgroundImage: `url("${backgrounds.light.url}")` }}
        />
        <div
          className={`dashboard-wallpaper__image ${
            theme === "dark" ? "is-active" : ""
          }`}
          style={{ backgroundImage: `url("${backgrounds.dark.url}")` }}
        />
        <div className="dashboard-wallpaper__veil" />
      </div>

      <div className="relative z-10 flex min-h-screen w-full flex-col md:flex-row">
        <aside className="glass-sidebar w-full shrink-0 border-b md:sticky md:top-0 md:h-dvh md:w-64 md:self-start md:border-b-0 md:border-r">
          <div className="flex h-full flex-col p-4 md:p-6">
            <div className="mb-4 md:mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Centro di controllo
              </p>

              <h1 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                Dashboard Quinta
              </h1>
            </div>

            <div className="min-h-0 md:flex-1 md:overflow-y-auto">
              <Sidebar
                activeSection={activeSection}
                onSectionChange={onSectionChange}
              />
            </div>

            <div className="theme-dock mt-4 hidden shrink-0 border-t pt-4 md:block">
              <ThemeToggle
                theme={theme}
                onToggleTheme={onToggleTheme}
              />
            </div>

          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            activeSection={activeSection}
            userEmail={userEmail}
            onSignOut={onSignOut}
          />

          <main className="glass-main min-w-0 flex-1 p-4 pb-24 sm:p-6 sm:pb-24 md:pb-6">
            {children}
          </main>
        </div>
      </div>
      <div className="theme-dock fixed bottom-4 right-4 z-50 w-44 rounded-2xl border p-2 shadow-lg md:hidden">
        <ThemeToggle theme={theme} onToggleTheme={onToggleTheme} />
      </div>
    </div>
  );
}

export default DashboardLayout;
