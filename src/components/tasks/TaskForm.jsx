import { useEffect, useState } from 'react';
import { Plus, Save, X } from 'lucide-react';

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
    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (!editingTask) {
            setFormData(initialFormData);
            return;
        }

        setFormData({
            title: editingTask.title ?? '',
            description: editingTask.description ?? '',
            subjectId: editingTask.subjectId ?? '',
            dueDate: toDateTimeLocalValue(editingTask.dueDate),
            type: editingTask.type ?? 'HOMEWORK',
            isUrgent: editingTask.isUrgent ?? false,
            isImportant: editingTask.isImportant ?? false,
        });
    }, [editingTask]);

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

        const newTask = {
            id: `tsk-${Date.now()}`,
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
            className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
            <div>
                <h3 className="text-lg font-semibold text-white">
                    {editingTask ? 'Modifica task' : 'Nuovo task'}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                    {editingTask
                        ? 'Aggiorna le informazioni del task selezionato.'
                        : 'Inserisci un compito, una verifica o un progetto.'}
                </p>
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="title"
                    className="text-sm font-medium text-slate-200"
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
                    className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10"
                />
            </div>

            <div className="space-y-2">
                <label
                    htmlFor="description"
                    className="text-sm font-medium text-slate-200"
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
                    className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10"
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                    <label
                        htmlFor="subjectId"
                        className="text-sm font-medium text-slate-200"
                    >
                        Materia
                    </label>

                    <select
                        id="subjectId"
                        name="subjectId"
                        value={formData.subjectId}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/60"
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
                        className="text-sm font-medium text-slate-200"
                    >
                        Tipologia
                    </label>

                    <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/60"
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
                        className="text-sm font-medium text-slate-200"
                    >
                        Scadenza
                    </label>

                    <input
                        id="dueDate"
                        name="dueDate"
                        type="datetime-local"
                        value={formData.dueDate}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white outline-none focus:border-sky-400/60"
                    />
                </div>
            </div>

            <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                    <input
                        name="isUrgent"
                        type="checkbox"
                        checked={formData.isUrgent}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-white/20 bg-slate-900"
                    />

                    Urgente
                </label>

                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                    <input
                        name="isImportant"
                        type="checkbox"
                        checked={formData.isImportant}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-white/20 bg-slate-900"
                    />

                    Importante
                </label>
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={!formData.title.trim()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
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
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10"
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