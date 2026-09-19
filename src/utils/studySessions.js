export function summarizeStudySessionsForDate(
  studySessions,
  referenceDate = new Date(),
) {
  const referenceDay = referenceDate.toDateString();

  const sessions = studySessions.filter((session) => {
    const completedAt = new Date(session.completedAt);

    return (
      !Number.isNaN(completedAt.getTime()) &&
      completedAt.toDateString() === referenceDay
    );
  });

  const totalMinutes = sessions.reduce(
    (total, session) => total + session.durationMinutes,
    0,
  );

  const minutesBySubject = sessions.reduce(
    (minutes, session) => ({
      ...minutes,
      [session.subjectId]:
        (minutes[session.subjectId] ?? 0) + session.durationMinutes,
    }),
    {},
  );

  const subjects = Object.entries(minutesBySubject)
    .map(([subjectId, minutes]) => ({ subjectId, minutes }))
    .sort((a, b) => b.minutes - a.minutes);

  return {
    sessions,
    sessionCount: sessions.length,
    totalMinutes,
    minutesBySubject,
    subjects,
  };
}
