import Header from '../header/Header';
import Sidebar from '../navigation/Sidebar';

function DashboardLayout({
  children,
  activeSection,
  onSectionChange,
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <div className="flex min-h-screen w-full">
        <aside className="w-64 shrink-0 border-r border-slate-800 bg-slate-900">
          <div className="p-6">
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Centro di controllo
              </p>

              <h1 className="mt-1 text-lg font-bold text-slate-100">
                Dashboard Quinta
              </h1>
            </div>

            <Sidebar
              activeSection={activeSection}
              onSectionChange={onSectionChange}
            />
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