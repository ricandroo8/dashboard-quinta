import { LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";

import useAuth from "../../hooks/useAuth";

function AuthShell({ children }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.16),transparent_42%)]" />
      <section className="relative w-full max-w-md rounded-3xl border border-white/15 bg-slate-900/75 p-6 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:p-8">
        {children}
      </section>
    </main>
  );
}

function ConfigurationNotice() {
  return (
    <AuthShell>
      <ShieldCheck className="text-sky-300" size={36} aria-hidden="true" />
      <h1 className="mt-5 text-2xl font-semibold">Configurazione richiesta</h1>
      <p className="mt-3 text-sm leading-6 text-slate-300">
        La dashboard è protetta e rimane chiusa finché Supabase non è
        configurato. Aggiungi <code>VITE_SUPABASE_URL</code> e{" "}
        <code>VITE_SUPABASE_ANON_KEY</code> seguendo il README.
      </p>
    </AuthShell>
  );
}

function LoginForm() {
  const { error: sessionError, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await signIn({ email: email.trim(), password });
    } catch (error) {
      const isInvalidCredentials =
        error?.message?.toLowerCase().includes("invalid login credentials");

      setFormError(
        isInvalidCredentials
          ? "Email o password non corrette."
          : "Accesso non riuscito. Controlla la connessione e riprova.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/10 text-sky-300">
        <LockKeyhole size={24} aria-hidden="true" />
      </span>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
        Centro di controllo
      </p>
      <h1 className="mt-2 text-2xl font-semibold">Dashboard Quinta</h1>
      <p className="mt-2 text-sm text-slate-400">
        Accedi al tuo profilo personale per continuare.
      </p>

      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium text-slate-200" htmlFor="email">
            Email
          </label>
          <input
            autoComplete="email"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            id="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-200" htmlFor="password">
            Password
          </label>
          <input
            autoComplete="current-password"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
            id="password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </div>

        {(formError || sessionError) && (
          <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-3 py-2 text-sm text-rose-200" role="alert">
            {formError ?? sessionError}
          </p>
        )}

        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300/50 disabled:cursor-wait disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting && <LoaderCircle className="animate-spin" size={17} aria-hidden="true" />}
          {isSubmitting ? "Accesso in corso…" : "Accedi"}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        Le registrazioni non sono disponibili da questa schermata.
      </p>
    </AuthShell>
  );
}

function AuthGate({ children }) {
  const { isConfigured, isLoading, session } = useAuth();

  if (!isConfigured) {
    return <ConfigurationNotice />;
  }

  if (isLoading) {
    return (
      <AuthShell>
        <div className="flex items-center gap-3 text-sm text-slate-300" role="status">
          <LoaderCircle className="animate-spin text-sky-300" size={22} aria-hidden="true" />
          Verifica della sessione…
        </div>
      </AuthShell>
    );
  }

  if (!session) {
    return <LoginForm />;
  }

  return children;
}

export default AuthGate;
