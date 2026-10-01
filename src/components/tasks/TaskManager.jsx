import { ClipboardList } from 'lucide-react';
import { useState } from 'react';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';
import { sortTasksByPriority } from "../../utils/tasks";

function TaskManager({
    tasks,
    setTasks,
    onToggleTask,
    syncError,
    syncLoading,
    onRetrySync,
}) {
    const [activeFilter, setActiveFilter] = useState('all');
    const [editingTask, setEditingTask] = useState(null);

    function handleAddTask(newTask) {
        setTasks((currentTasks) => [...currentTasks, newTask]);
    }

    function handleEditTask(task) {
        setEditingTask(task);
    }

    function handleUpdateTask(updatedTask) {
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === updatedTask.id ? updatedTask : task
            )
        );

        setEditingTask(null);
    }

    function handleCancelEdit() {
        setEditingTask(null);
    }

    function handleDeleteTask(taskId) {
        setTasks((currentTasks) =>
            currentTasks.filter((task) => task.id !== taskId)
        );

        if (editingTask?.id === taskId) {
            setEditingTask(null);
        }
    }

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const activeTasks = totalTasks - completedTasks;

    const filteredTasks = tasks.filter((task) => {
        if (activeFilter === 'active') {
            return !task.completed;
        }

        if (activeFilter === 'completed') {
            return task.completed;
        }

        return true;
    });

    const sortedTasks = sortTasksByPriority(filteredTasks);

    return (
        <section className="space-y-6">
            <header>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Organizza compiti, verifiche e progetti in un unico posto.
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                    Task Manager
                </h2>
            </header>

            {syncLoading && (
                <p className="rounded-xl border border-sky-400/20 bg-sky-400/10 px-4 py-3 text-sm text-sky-800 dark:text-sky-200" role="status">
                    Sincronizzazione delle attività in corso…
                </p>
            )}

            {syncError && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100" role="alert">
                    <p>{syncError}</p>
                    <button
                        type="button"
                        onClick={() => onRetrySync()}
                        className="rounded-lg border border-amber-500/30 px-3 py-1.5 font-semibold transition hover:bg-amber-400/10 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                    >
                        Riprova
                    </button>
                </div>
            )}

            <TaskForm
                key={editingTask?.id ?? 'new-task'}
                editingTask={editingTask}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onCancelEdit={handleCancelEdit}
            />

            {/* Card riepilogo */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="section-card-soft rounded-xl border border-slate-200 bg-white/80 p-3 dark:border-white/10 dark:bg-white/5 sm:rounded-2xl sm:p-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 sm:text-sm">
                        Totali
                    </p>

                    <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-white sm:mt-2 sm:text-2xl">
                        {totalTasks}
                    </p>
                </div>

                <div className="section-card-soft rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 sm:rounded-2xl sm:p-4">
                    <p className="text-xs text-sky-700 dark:text-sky-300 sm:text-sm">
                        Da fare
                    </p>

                    <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-white sm:mt-2 sm:text-2xl">
                        {activeTasks}
                    </p>
                </div>

                <div className="section-card-soft rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 sm:rounded-2xl sm:p-4">
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 sm:text-sm">
                        Completati
                    </p>

                    <p className="mt-1 text-xl font-semibold tabular-nums text-slate-900 dark:text-white sm:mt-2 sm:text-2xl">
                        {completedTasks}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setActiveFilter('all')}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        activeFilter === 'all'
                            ? 'bg-sky-500 text-slate-900 dark:text-white'
                            : 'border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                >
                    Tutti
                </button>

                <button
                    type="button"
                    onClick={() => setActiveFilter('active')}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        activeFilter === 'active'
                            ? 'bg-sky-500 text-slate-900 dark:text-white'
                            : 'border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                >
                    Da fare
                </button>

                <button
                    type="button"
                    onClick={() => setActiveFilter('completed')}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        activeFilter === 'completed'
                            ? 'bg-sky-500 text-slate-900 dark:text-white'
                            : 'border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                >
                    Completati
                </button>
            </div>

            {tasks.length === 0 ? (
                <div className="section-card flex min-h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-8 text-center">
                    <ClipboardList
                        size={40}
                        strokeWidth={1.5}
                        className="text-slate-600 dark:text-slate-400"
                    />

                    <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
                        Nessun task presente
                    </h3>

                    <p className="mt-2 max-w-sm text-sm text-slate-600 dark:text-slate-400">
                        Quando aggiungerai compiti, verifiche o progetti, compariranno qui.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {filteredTasks.length === 1
                            ? '1 task visualizzato'
                            : `${filteredTasks.length} task visualizzati`}
                    </p>

                    {filteredTasks.length === 0 ? (
                        <div className="section-card rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-6 text-center">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Nessun task corrisponde al filtro selezionato.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sortedTasks.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onToggle={onToggleTask}
                                    onDelete={handleDeleteTask}
                                    onEdit={handleEditTask}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

export default TaskManager;
