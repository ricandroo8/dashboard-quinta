import { SUBJECTS } from './subjects';

export const TASK_SUBJECTS = [
    { id: '', label: 'Nessuna materia' },
    ...SUBJECTS,
];

export const TASK_TYPES = [
    { value: 'HOMEWORK', label: 'Compito' },
    { value: 'VERIFICATION', label: 'Verifica' },
    { value: 'PROJECT', label: 'Progetto' },
    { value: 'OTHER', label: 'Altro' },
];

export const TASK_SUBJECT_LABELS = Object.fromEntries(
    TASK_SUBJECTS.map((subject) => [subject.id, subject.label])
);

export const TASK_TYPE_LABELS = Object.fromEntries(
    TASK_TYPES.map((type) => [type.value, type.label])
);
