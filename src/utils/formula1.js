export function formatRaceDate(dateString) {
    const date = new Date(dateString);

    if(Number.isNaN(date.getTime())) {
        return "Data non disponibile";
    }

    const dataFormatted = new Intl.DateTimeFormat("it-IT", {
            day: "numeric",
            month: "long",
            weekday: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);

    return dataFormatted;
}

export function calculateCountdown(dateString) {
    const race = new Date(dateString).getTime();

    if (Number.isNaN(race)) {
        return null;
    }

    const today = Date.now();

    const difference = race - today;

    if(difference <= 0) {
        return null;
    }

    const totalSeconds = Math.floor(difference / 1000);

    const days = Math.floor(totalSeconds / 86400);

    const hours = Math.floor(
        (totalSeconds % 86400) / 3600
    );

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );

    const seconds = totalSeconds % 60;

    return {
        days,
        hours,
        minutes,
        seconds,
    };
}