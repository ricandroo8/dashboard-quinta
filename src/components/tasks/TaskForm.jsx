import { useState } from 'react';
import {
    Check,
    Flame,
    Plus,
    Save,
    Star,
    X,
} from 'lucide-react';

import {
    TASK_SUBJECTS,
    TASK_TYPES,
} from '../../constants/tasks';

const initialFormData = {
    title: '',
    description: '',
    subjectId: '',
    dueDate: '',
    type: 'HOMEWORK',
    isUrgent: false,
    isImportant: false,
};

function getInitialFormData(editingTask) {
    if (!editingTask) {
        return initialFormData;
    }

    return {
        title: editingTask.title ?? '',
        description: editingTask.description ?? '',
        subjectId: editingTask.subjectId ?? '',
        dueDate: toDateTimeLocalValue(editingTask.dueDate),
        type: editingTask.type ?? 'HOMEWORK',
        isUrgent: editingTask.isUrgent ?? false,
        isImportant: editingTask.isImportant ?? false,
    };
}

function toDateTimeLocalValue(dateString) {
    if (!dateString) {
        return '';
    }

    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function TaskForm({
    editingTask,
    onAddTask,
    onUpdateTask,
    onCancelEdit,
}) {
    const [formData, setFormData] = useState(() =>
        getInitialFormData(editingTask)
    );

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setFormData((currentFormData) => ({
            ...currentFormData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        const trimmedTitle = formData.title.trim();

        if (!trimmedTitle) {
            return;
        }

        const taskData = {
            title: trimmedTitle,
            description: formData.description.trim(),
            subjectId: formData.subjectId,
            dueDate: formData.dueDate
                ? new Date(formData.dueDate).toISOString()
                : null,
            type: formData.type,
            isUrgent: formData.isUrgent,
            isImportant: formData.isImportant,
        };

        if (editingTask) {
            onUpdateTask({
                ...editingTask,
                ...taskData,
            });

            return;
        }

        const uniqueId = globalThis.crypto?.randomUUID?.() ??
            `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        const newTask = {
            id: `tsk-${uniqueId}`,
            ...taskData,
            completed: false,
            completedAt: null,
            createdAt: new Date().toISOString(),
            externalTaskId: null,
        };

        onAddTask(newTask);
        setFormData(initialFormData);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="section-card space-y-5 rounded-2xl border border-slate-200 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5 sm:p-6"
        >
            <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {editingTask ? 'Modifica task' : 'Nuovo task'}
                </h3>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {editingTask
                        ? 'Aggiorna le informazioni del task selezionato.'
                        : 'Inserisci un compito, una verifica o un progetto.'}
                </p>
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="title"
                    className="text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                    Titolo
                </label>

                <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Es. Studiare subnetting"
                    className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/40 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10"
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="description"
                    className="text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                    Descrizione
                </label>

                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Aggiungi dettagli o note..."
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/40 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <label
                        htmlFor="subjectId"
                        className="text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        Materia
                    </label>

                    <select
                        id="subjectId"
                        name="subjectId"
                        value={formData.subjectId}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/40 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-400/60"
                    >
                        {TASK_SUBJECTS.map((subject) => (
                            <option
                                key={subject.id || 'none'}
                                value={subject.id}
                            >
                                {subject.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="type"
                        className="text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        Tipologia
                    </label>

                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/40 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-400/60"
                    >
                        {TASK_TYPES.map((taskType) => (
                            <option
                                key={taskType.value}
                                value={taskType.value}
                            >
                                {taskType.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="dueDate"
                        className="text-sm font-medium text-slate-700 dark:text-slate-200"
                    >
                        Scadenza
                    </label>

                    <input
                        id="dueDate"
                        name="dueDate"
                        type="datetime-local"
                        value={formData.dueDate}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/40 px-4 py-3 text-sm text-slate-900 dark:text-white outline-none focus:border-sky-400/60"
                    />
                </div>
            </div>

            <fieldset>
                <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Priorità
                </legend>

                <div className="grid grid-cols-2 gap-3">
                    <label
                        className={`relative flex min-h-14 cursor-pointer items-center gap-2 rounded-xl border p-2.5 pr-7 transition sm:min-h-16 sm:gap-3 sm:p-3 sm:pr-9 ${
                            formData.isUrgent
                                ? 'border-rose-400/50 bg-rose-500/10'
                                : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20'
                        }`}
                    >
                        <input
                            name="isUrgent"
                            type="checkbox"
                            checked={formData.isUrgent}
                            onChange={handleChange}
                            className="peer sr-only"
                        />

                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-700 ring-offset-2 peer-focus-visible:ring-2 peer-focus-visible:ring-rose-500 dark:text-rose-300 dark:ring-offset-slate-950 sm:h-9 sm:w-9">
                            <Flame size={17} aria-hidden="true" />
                        </span>

                        <span className="min-w-0">
                            <span className="block text-xs font-semibold text-slate-900 dark:text-white sm:text-sm">
                                Urgente
                            </span>
                            <span className="mt-0.5 hidden text-xs text-slate-500 sm:block">
                                Da gestire presto
                            </span>
                        </span>

                        <span
                            aria-hidden="true"
                            className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border transition sm:right-3 sm:top-3 ${
                                formData.isUrgent
                                    ? 'border-rose-500 bg-rose-500 text-white'
                                    : 'border-slate-300 text-transparent dark:border-slate-600'
                            }`}
                        >
                            <Check size={12} strokeWidth={3} />
                        </span>
                    </label>

                    <label
                        className={`relative flex min-h-14 cursor-pointer items-center gap-2 rounded-xl border p-2.5 pr-7 transition sm:min-h-16 sm:gap-3 sm:p-3 sm:pr-9 ${
                            formData.isImportant
                                ? 'border-amber-400/60 bg-amber-500/10'
                                : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20'
                        }`}
                    >
                        <input
                            name="isImportant"
                            type="checkbox"
                            checked={formData.isImportant}
                            onChange={handleChange}
                            className="peer sr-only"
                        />

                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 ring-offset-2 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-500 dark:text-amber-300 dark:ring-offset-slate-950 sm:h-9 sm:w-9">
                            <Star size={17} aria-hidden="true" />
                        </span>

                        <span className="min-w-0">
                            <span className="block text-xs font-semibold text-slate-900 dark:text-white sm:text-sm">
                                Importante
                            </span>
                            <span className="mt-0.5 hidden text-xs text-slate-500 sm:block">
                                Alta rilevanza
                            </span>
                        </span>

                        <span
                            aria-hidden="true"
                            className={`absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border transition sm:right-3 sm:top-3 ${
                                formData.isImportant
                                    ? 'border-amber-500 bg-amber-500 text-white'
                                    : 'border-slate-300 text-transparent dark:border-slate-600'
                            }`}
                        >
                            <Check size={12} strokeWidth={3} />
                        </span>
                    </label>
                </div>
            </fieldset>

            <div className="grid gap-3 sm:flex">
                <button
                    type="submit"
                    disabled={!formData.title.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none dark:focus-visible:ring-offset-slate-950 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 sm:w-auto"
                >
                    {editingTask ? (
                        <Save size={18} />
                    ) : (
                        <Plus size={18} />
                    )}

                    {editingTask
                        ? 'Salva modifiche'
                        : 'Aggiungi task'}
                </button>

                {editingTask && (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 sm:w-auto"
                    >
                        <X size={18} />
                        Annulla
                    </button>
                )}
            </div>
        </form>
    );
}

export default TaskForm;
