import { TASK_SUBJECT_LABELS } from "../../constants/tasks";

function StudySummary({ studySessions }) {
  const today = new Date().toDateString();

  const todaySessions = studySessions.filter((session) => {
    return new Date(session.completedAt).toDateString() === today;
  });

  const todayMinutes = todaySessions.reduce((total, session) => {
    return total + session.durationMinutes;
  }, 0);

  const minutesBySubject = todaySessions.reduce(
    (accumulator, session) => {
      const subjectId = session.subjectId;

      accumulator[subjectId] =
        (accumulator[subjectId] || 0) + session.durationMinutes;

      return accumulator;
    },
    {}
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6">
        <p className="text-sm text-slate-400">
            Attività di oggi
        </p>

        <h3 className="text-xl font-semibold text-white">
            Study Tracker
        </h3>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/5 p-4">
            <p className="text-2xl font-semibold text-white">
            {todaySessions.length}
            </p>

            <p className="mt-1 text-sm text-slate-400">
            Sessioni
            </p>
        </div>

        <div className="rounded-xl bg-white/5 p-4">
            <p className="text-2xl font-semibold text-white">
            {todayMinutes}
            </p>

            <p className="mt-1 text-sm text-slate-400">
            Minuti
            </p>
        </div>
        </div>

        <div>
        <p className="mb-3 text-sm font-medium text-slate-300">
            Tempo per materia
        </p>

        {Object.entries(minutesBySubject).length === 0 ? (
            <p className="text-sm text-slate-500">
            Nessuna sessione completata oggi.
            </p>
        ) : (
            <div className="space-y-2">
            {Object.entries(minutesBySubject).map(
                ([subjectId, minutes]) => (
                <div
                    key={subjectId}
                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                >
                    <span className="text-sm text-slate-300">
                    {TASK_SUBJECT_LABELS[subjectId] || subjectId}
                    </span>

                    <span className="text-sm font-medium text-white">
                    {minutes} min
                    </span>
                </div>
                )
            )}
            </div>
        )}
        </div>
    </section>
    );
}

export default StudySummary;