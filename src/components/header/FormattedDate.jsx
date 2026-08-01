function FormattedDate() {
  const currentDate = new Date();

  const formattedDate = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(currentDate);

  return (
    <p className="text-sm capitalize text-slate-400">
      {formattedDate}
    </p>
  );
}

export default FormattedDate;