export const TASK_SUBJECTS = [
    { id: '', label: 'Nessuna materia' },
    { id: 'subj-gpoi', label: 'GPOI' },
    { id: 'subj-mate', label: 'Matematica' },
    { id: 'subj-info', label: 'Informatica' },
    { id: 'subj-sistemi', label: 'Sistemi e Reti' },
    { id: 'subj-tps', label: 'TPS' },
    { id: 'subj-italiano', label: 'Italiano' },
    { id: 'subj-storia', label: 'Storia' }
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