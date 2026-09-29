import {
  clearCalendarSessionCookie,
  createCalendarSessionCookie,
  createCalendarSessionToken,
  getCalendarAuthConfiguration,
  isCalendarRequestAuthenticated,
  secretsMatch,
} from "./_calendarAuth.js";

const JSON_HEADERS = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

function jsonResponse(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...JSON_HEADERS,
      ...headers,
    },
  });
}

export default {
  async fetch(request) {
    const configuration = getCalendarAuthConfiguration();

    if (!configuration) {
      return jsonResponse(
        { error: "Protezione calendario non configurata" },
        500,
      );
    }

    if (request.method === "GET") {
      return jsonResponse({
        authenticated: isCalendarRequestAuthenticated(
          request,
          configuration.sessionSecret,
        ),
      });
    }

    if (request.method === "DELETE") {
      return jsonResponse(
        { authenticated: false },
        200,
        {
          "Set-Cookie": clearCalendarSessionCookie(request.url),
        },
      );
    }

    if (request.method !== "POST") {
      return jsonResponse(
        { error: "Metodo non consentito" },
        405,
        { Allow: "GET, POST, DELETE" },
      );
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Richiesta non valida" }, 400);
    }

    if (!secretsMatch(body?.password, configuration.password)) {
      return jsonResponse({ error: "Password non corretta" }, 401);
    }

    const token = createCalendarSessionToken(
      configuration.sessionSecret,
    );

    return jsonResponse(
      { authenticated: true },
      200,
      {
        "Set-Cookie": createCalendarSessionCookie(
          token,
          request.url,
        ),
      },
    );
  },
};
