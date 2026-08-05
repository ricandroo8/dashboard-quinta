import { ClipboardList } from 'lucide-react';
import { useState } from 'react';
import useLocalStorage from '../../hooks/useLocalStorage';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';

function TaskManager() {
    const [tasks, setTasks] = useLocalStorage('dashboard_tasks', []);
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

    function handleToggleTask(taskId) {
        setTasks((currentTasks) =>
            currentTasks.map((task) => {
                if (task.id !== taskId) {
                    return task;
                }

                const nextCompletedState = !task.completed;

                return {
                    ...task,
                    completed: nextCompletedState,
                    completedAt: nextCompletedState
                        ? new Date().toISOString()
                        : null,
                };
            })
        );
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

    const sortedTasks = [...filteredTasks].sort((firstTask, secondTask) => {
        if (firstTask.completed !== secondTask.completed) {
            return Number(firstTask.completed) - Number(secondTask.completed);
        }

        const firstPriority = Number(firstTask.isUrgent) + Number(firstTask.isImportant);

        const secondPriority = Number(secondTask.isUrgent) + Number(secondTask.isImportant);

        if(firstPriority !== secondPriority) {
            return secondPriority - firstPriority;
        }

        if (firstTask.dueDate && secondTask.dueDate) {
            return (
                new Date(firstTask.dueDate).getTime() -
                new Date(secondTask.dueDate).getTime()
            );
        }

        if (firstTask.dueDate) {
            return -1;
        }
        
        if (secondTask.dueDate) {
            return 1;
        }

        return (
            new Date(firstTask.createdAt).getTime() -
            new Date(secondTask.createdAt).getTime()
        );
    })

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

            <TaskForm
                editingTask={editingTask}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onCancelEdit={handleCancelEdit}
            />

            {/* Card riepilogo */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-slate-400">
                        Totali
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-white">
                        {totalTasks}
                    </p>
                </div>

                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-4">
                    <p className="text-sm text-sky-300">
                        Da fare
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-white">
                        {activeTasks}
                    </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-sm text-emerald-300">
                        Completati
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-white">
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
                            ? 'bg-sky-500 text-white'
                            : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                >
                    Tutti
                </button>

                <button
                    type="button"
                    onClick={() => setActiveFilter('active')}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        activeFilter === 'active'
                            ? 'bg-sky-500 text-white'
                            : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                >
                    Da fare
                </button>

                <button
                    type="button"
                    onClick={() => setActiveFilter('completed')}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                        activeFilter === 'completed'
                            ? 'bg-sky-500 text-white'
                            : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                >
                    Completati
                </button>
            </div>

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
                <div className="space-y-4">
                    <p className="text-sm text-slate-400">
                        {filteredTasks.length === 1
                            ? '1 task visualizzato'
                            : `${filteredTasks.length} task visualizzati`}
                    </p>

                    {filteredTasks.length === 0 ? (
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
                            <p className="text-sm text-slate-400">
                                Nessun task corrisponde al filtro selezionato.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {sortedTasks.map((task) => (
                                <TaskItem
                                    key={task.id}
                                    task={task}
                                    onToggle={handleToggleTask}
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