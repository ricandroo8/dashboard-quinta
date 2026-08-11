function getValue(lines, propertyName) {
  const line = lines.find((line) =>
    line.startsWith(`${propertyName}:`)
  );

  if (!line) {
    return null;
  }

  return line.slice(propertyName.length + 1).trim();
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const year = value.slice(0, 4);
  const month = value.slice(4, 6);
  const day = value.slice(6, 8);
  const hour = value.slice(9, 11);
  const minute = value.slice(11, 13);
  const second = value.slice(13, 15);

  return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
}

export function parseICal(text) {
  const blocks = text
    .split("BEGIN:VEVENT")
    .slice(1);

  return blocks.map((block) => {
    const lines = block.split(/\r?\n/);

    const id = getValue(lines, "UID");
    const rawTitle = getValue(lines, "SUMMARY");

    const startDateRaw = getValue(lines, "DTSTART");
    const endDateRaw = getValue(lines, "DTEND");

    const startDate = parseDate(startDateRaw);
    const endDate = parseDate(endDateRaw) ?? startDate;

    const description = getValue(lines, "DESCRIPTION") ?? "";
    const location = getValue(lines, "LOCATION") ?? "";

    return {
      id,
      rawTitle,
      startDate,
      endDate,
      isAllDay: false,
      description,
      location,
    };
  });
}

