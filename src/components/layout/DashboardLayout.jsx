import Header from '../header/Header';
import Sidebar from '../navigation/Sidebar';
import ThemeToggle from "../theme/ThemeToggle";

function DashboardLayout({
  children,
  activeSection,
  onSectionChange,
  theme,
  onToggleTheme,
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen w-full flex-col md:flex-row">
        <aside className="w-full shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 md:w-64 md:border-b-0 md:border-r">
          <div className="p-4 md:p-6">
            <div className="mb-4 md:mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Centro di controllo
              </p>

              <h1 className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                Dashboard Quinta
              </h1>
            </div>

            <Sidebar
              activeSection={activeSection}
              onSectionChange={onSectionChange}
            />

            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
              <ThemeToggle
                theme={theme}
                onToggleTheme={onToggleTheme}
              />
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <Header activeSection={activeSection} />

          <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;