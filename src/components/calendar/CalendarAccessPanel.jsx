import { useState } from "react";
import { LockKeyhole } from "lucide-react";

function CalendarAccessPanel({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onUnlock(password);
      setPassword("");
    } catch (error) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="section-card-soft rounded-2xl border border-sky-400/20 bg-sky-400/[0.08] p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
          <LockKeyhole size={18} aria-hidden="true" />
        </span>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Calendario protetto
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-white/60">
            Inserisci la password della dashboard per visualizzare gli eventi.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-3 sm:flex-row"
      >
        <label className="sr-only" htmlFor="calendar-password">
          Password della dashboard
        </label>
        <input
          id="calendar-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-white/10 dark:bg-black/20 dark:text-white"
          placeholder="Password"
        />
        <button
          type="submit"
          disabled={isSubmitting || !password}
          className="min-h-11 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white transition hover:bg-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-950"
        >
          {isSubmitting ? "Verifica..." : "Sblocca"}
        </button>
      </form>

      {submitError && (
        <p
          role="alert"
          className="mt-3 text-sm font-medium text-rose-700 dark:text-rose-200"
        >
          {submitError}
        </p>
      )}
    </div>
  );
}

export default CalendarAccessPanel;
