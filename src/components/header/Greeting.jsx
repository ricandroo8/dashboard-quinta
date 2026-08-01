function Greeting({ name = 'Riccardo' }) {
  const currentHour = new Date().getHours();

  let greeting;

  if (currentHour >= 5 && currentHour < 12) {
    greeting = 'Buongiorno';
  } else if (currentHour >= 12 && currentHour < 18) {
    greeting = 'Buon pomeriggio';
  } else if (currentHour >= 18 && currentHour < 23) {
    greeting = 'Buonasera';
  } else {
    greeting = 'Buonanotte';
  }

  return (
    <p className="text-sm font-medium text-slate-300">
      {greeting}, {name}
    </p>
  );
}

export default Greeting;