import { ClipboardList } from 'lucide-react';
import useLocalStorage from '../../hooks/useLocalStorage';

function TaskManager() {
    const [tasks] = useLocalStorage("dashboard_tasks", []);

    return (
        <section className="space-y-6">
            <header>
                <p className="text-sm text-slate-400">
                    Organizza compiti, verifiche e progetti in un unico posto.
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-white">
                    Task Manager
                </h2>
            </header>

            {tasks.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                    <ClipboardList
                        size={40}
                        strokeWidth={1.5}
                        className="text-slate-400"
                    />

                    <h3 className="mt-4 text-lg font-medium text-white">
                        Nessun task presente
                    </h3>

                    <p className="mt-2 max-w-sm text-sm text-slate-400">
                        Quando aggiungerai compiti, verifiche o progetti, compariranno qui.
                    </p>
                </div>
            ) : (
                <p className="text-slate-300">
                    hai {tasks.length} task da completare.
                </p>
            )}
        </section>
    );
}

export default TaskManager;