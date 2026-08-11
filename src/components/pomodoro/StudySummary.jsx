import { SUBJECT_LABELS } from "../../constants/subjects";

function StudySummary({ studySessions }) {
  const today = new Date().toDateString();

  const todaySessions = studySessions.filter((session) => {
    return new Date(session.completedAt).toDateString() === today;
  });

  const todayMinutes = todaySessions.reduce(
    (total, session) => {
      return total + session.durationMinutes;
    },
    0,
  );

  const minutesBySubject = todaySessions.reduce(
    (accumulator, session) => {
      const subjectId = session.subjectId;

      accumulator[subjectId] =
        (accumulator[subjectId] || 0) +
        session.durationMinutes;

      return accumulator;
    },
    {},
  );

  const subjectEntries = Object.entries(minutesBySubject);

  const maxMinutes = Math.max(
    ...Object.values(minutesBySubject),
    1,
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
        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
          <p className="text-2xl font-semibold text-white">
            {todaySessions.length}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Sessioni
          </p>
        </div>

        <div className="rounded-xl border border-white/5 bg-white/5 p-4">
          <p className="text-2xl font-semibold text-white">
            {todayMinutes}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Minuti
          </p>
        </div>
      </div>

      <div>
        <p className="mb-4 text-sm font-medium text-slate-300">
          Tempo per materia
        </p>

        {subjectEntries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4">
            <p className="text-sm leading-relaxed text-slate-500">
              Completa una sessione per visualizzare la distribuzione dello
              studio.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {subjectEntries.map(([subjectId, minutes]) => {
              const percentage =
                (minutes / maxMinutes) * 100;

              const subjectName =
                SUBJECT_LABELS[subjectId] ||
                "Materia sconosciuta";

              return (
                <div key={subjectId}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-medium text-slate-300">
                      {subjectName}
                    </span>

                    <span className="shrink-0 text-xs font-medium text-slate-400">
                      {minutes} min
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className="h-full rounded-full bg-blue-400 transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default StudySummary;