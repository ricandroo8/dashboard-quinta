import { navigationItems } from '../../data/navigationItems';
import FormattedDate from './FormattedDate';
import Greeting from './Greeting';
import DigitalClock from './DigitalClock';
import Countdown from './Countdown';
import { COUNTDOWN_TARGET_DATE } from '../../constants/dates';

function Header({ activeSection }) {
  const currentItem = navigationItems.find(
    (item) => item.id === activeSection
  );

  

  return (
    <header className="shrink-0 border-b border-slate-800 bg-slate-900/80 px-6 py-4">
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0">

        <Greeting name="Riccardo" />
        
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Sezione corrente
          </p>

          <h2 className="truncate text-xl font-bold text-slate-100">
            {currentItem?.label ?? 'Dashboard'}
          </h2>

          <FormattedDate />
        </div>

        <div className="shrink-0 text-sm text-slate-400">
          <DigitalClock />

          <Countdown targetDate={COUNTDOWN_TARGET_DATE} />
        </div>
      </div>
    </header>
  );
}

export default Header;