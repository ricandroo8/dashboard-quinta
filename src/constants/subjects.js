export const SUBJECTS = [
  { id: "subj-gpoi", label: "GPOI" },
  { id: "subj-mate", label: "Matematica" },
  { id: "subj-info", label: "Informatica" },
  { id: "subj-sistemi", label: "Sistemi e Reti" },
  { id: "subj-tps", label: "TPS" },
  { id: "subj-italiano", label: "Italiano" },
  { id: "subj-storia", label: "Storia" },
];

export const SUBJECT_LABELS = Object.fromEntries(
  SUBJECTS.map((subject) => [subject.id, subject.label]),
);