import {
  getCalendarAuthConfiguration,
  isCalendarRequestAuthenticated,
} from "./_calendarAuth.js";
import { env } from "node:process";

const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

function jsonError(message, status) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: JSON_HEADERS,
  });
}

export default {
  async fetch(request) {
    if (request.method !== "GET") {
      return new Response(
        JSON.stringify({ error: "Metodo non consentito" }),
        {
          status: 405,
          headers: {
            ...JSON_HEADERS,
            Allow: "GET",
          },
        },
      );
    }

    const authConfiguration = getCalendarAuthConfiguration();

    if (!authConfiguration) {
      return jsonError(
        "Protezione calendario non configurata",
        500,
      );
    }

    if (
      !isCalendarRequestAuthenticated(
        request,
        authConfiguration.sessionSecret,
      )
    ) {
      return jsonError("Autenticazione richiesta", 401);
    }

    const configuredUrl = env.SCHOOL_CALENDAR_URL?.trim();

    if (!configuredUrl) {
      return jsonError(
        "Calendario non configurato sul server",
        500,
      );
    }

    let calendarUrl;

    try {
      calendarUrl = new URL(configuredUrl);
    } catch {
      return jsonError(
        "Configurazione del calendario non valida",
        500,
      );
    }

    if (calendarUrl.protocol !== "https:") {
      return jsonError(
        "Configurazione del calendario non valida",
        500,
      );
    }

    try {
      const calendarResponse = await fetch(calendarUrl, {
        headers: {
          Accept: "text/calendar, text/plain;q=0.9, */*;q=0.1",
        },
        signal: AbortSignal.timeout(8_000),
      });

      if (!calendarResponse.ok) {
        return jsonError(
          "Il calendario non è momentaneamente disponibile",
          502,
        );
      }

      const calendarContent = await calendarResponse.text();

      if (!calendarContent.includes("BEGIN:VCALENDAR")) {
        return jsonError(
          "Il server del calendario ha restituito un feed non valido",
          502,
        );
      }

      return new Response(calendarContent, {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store",
          "Content-Type": "text/calendar; charset=utf-8",
        },
      });
    } catch (error) {
      const isTimeout = error?.name === "TimeoutError";

      return jsonError(
        isTimeout
          ? "Il calendario ha impiegato troppo tempo a rispondere"
          : "Impossibile contattare il calendario",
        isTimeout ? 504 : 502,
      );
    }
  },
};
