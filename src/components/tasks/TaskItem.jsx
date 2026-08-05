import {
    CalendarDays,
    Check,
    Circle,
    Pencil,
    Trash2,
} from 'lucide-react';

import {
    TASK_SUBJECT_LABELS,
    TASK_TYPE_LABELS,
} from '../../constants/tasks';

function formatDueDate(dueDate) {
    if (!dueDate) {
        return 'Nessuna scadenza';
    }

    return new Intl.DateTimeFormat('it-IT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(dueDate));
}

function TaskItem({ task, onToggle, onDelete, onEdit }) {
    const subjectLabel =
        TASK_SUBJECT_LABELS[task.subjectId] ?? 'Nessuna materia';

    const typeLabel =
        TASK_TYPE_LABELS[task.type] ?? 'Altro';

    return (
        <article
            className={`rounded-2xl border p-5 transition ${
                task.completed
                    ? 'border-emerald-500/20 bg-emerald-500/5'
                    : 'border-white/10 bg-white/5'
            }`}
        >
            <div className="flex items-start gap-4">
                <button
                    type="button"
                    onClick={() => onToggle(task.id)}
                    aria-label={
                        task.completed
                            ? 'Segna come non completato'
                            : 'Segna come completato'
                    }
                    className="mt-1 shrink-0 text-slate-400 transition hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40"
                >
                    {task.completed ? (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                            <Check size={16} strokeWidth={3} />
                        </span>
                    ) : (
                        <Circle size={24} />
                    )}
                </button>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <h3
                                className={`font-semibold ${
                                    task.completed
                                        ? 'text-slate-500 line-through'
                                        : 'text-white'
                                }`}
                            >
                                {task.title}
                            </h3>

                            {task.description && (
                                <p
                                    className={`mt-1 text-sm ${
                                        task.completed
                                            ? 'text-slate-600'
                                            : 'text-slate-400'
                                    }`}
                                >
                                    {task.description}
                                </p>
                            )}
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                            <button
                                type="button"
                                onClick={() => onEdit(task)}
                                aria-label={`Modifica ${task.title}`}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-sky-500/10 hover:text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
                            >
                                <Pencil size={18} />
                            </button>

                            <button
                                type="button"
                                onClick={() => onDelete(task.id)}
                                aria-label={`Elimina ${task.title}`}
                                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/30"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                            {subjectLabel}
                        </span>

                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                            {typeLabel}
                        </span>

                        {task.isUrgent && (
                            <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-red-300">
                                Urgente
                            </span>
                        )}

                        {task.isImportant && (
                            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-amber-300">
                                Importante
                            </span>
                        )}
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <CalendarDays size={15} />
                        <span>{formatDueDate(task.dueDate)}</span>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default TaskItem;