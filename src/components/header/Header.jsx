import { LogOut } from 'lucide-react';

import { navigationItems } from '../../data/navigationItems';
import FormattedDate from './FormattedDate';
import Greeting from './Greeting';
import DigitalClock from './DigitalClock';
import Countdown from './Countdown';
import { COUNTDOWN_TARGET_DATE } from '../../constants/dates';

function Header({ activeSection, userEmail, onSignOut }) {
  const currentItem = navigationItems.find(
    (item) => item.id === activeSection
  );

  

  return (
    <header className="glass-header shrink-0 border-b px-6 py-4">
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0">

        <Greeting name="Riccardo" />
        
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Sezione corrente
          </p>

          <h2 className="truncate text-xl font-bold text-slate-900 dark:text-slate-100">
            {currentItem?.label ?? 'Dashboard'}
          </h2>

          <FormattedDate />
        </div>

        <div className="shrink-0 text-right text-sm text-slate-600 dark:text-slate-400">
          <DigitalClock />

          <Countdown targetDate={COUNTDOWN_TARGET_DATE} />

          <div className="mt-3 flex items-center justify-end gap-2">
            <span className="hidden max-w-48 truncate text-xs sm:block">
              {userEmail}
            </span>
            <button
              type="button"
              onClick={onSignOut}
              aria-label="Esci dalla dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white/60 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-sky-400/40 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <LogOut size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
