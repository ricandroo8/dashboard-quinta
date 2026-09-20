export const SUBJECTS = [
  { id: "subj-computer-science", label: "Computer Science" },
  { id: "subj-gpoi", label: "GPOI" },
  { id: "subj-inglese", label: "Inglese" },
  { id: "subj-italiano", label: "Italiano" },
  { id: "subj-mate", label: "Matematica" },
  { id: "subj-sistemi", label: "Sistemi e Reti" },
  { id: "subj-storia", label: "Storia" },
  { id: "subj-tps", label: "TPS" },
  { id: "subj-info", label: "Informatica" },
];

export const SUBJECT_LABELS = Object.fromEntries(
  SUBJECTS.map((subject) => [subject.id, subject.label]),
);
