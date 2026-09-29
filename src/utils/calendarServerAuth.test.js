import assert from "node:assert/strict";
import { env } from "node:process";
import test from "node:test";

import calendarSessionHandler from "../../api/calendar-session.js";
import schoolCalendarHandler from "../../api/school-calendar.js";
import {
  createCalendarSessionToken,
  secretsMatch,
  verifyCalendarSessionToken,
} from "../../api/_calendarAuth.js";

test("confronta i segreti e rifiuta valori diversi", () => {
  assert.equal(secretsMatch("password-corretta", "password-corretta"), true);
  assert.equal(secretsMatch("password-errata", "password-corretta"), false);
  assert.equal(secretsMatch(null, "password-corretta"), false);
});

test("firma la sessione, rileva manomissioni e rispetta la scadenza", () => {
  const secret = "a".repeat(32);
  const now = 1_700_000_000_000;
  const token = createCalendarSessionToken(secret, now);

  assert.equal(
    verifyCalendarSessionToken(token, secret, now + 1_000),
    true,
  );
  assert.equal(
    verifyCalendarSessionToken(`${token}x`, secret, now + 1_000),
    false,
  );
  assert.equal(
    verifyCalendarSessionToken(token, secret, now + 13 * 60 * 60 * 1_000),
    false,
  );
});

test("protegge il feed e lo restituisce dopo il login", async () => {
  const originalEnvironment = {
    accessPassword: env.DASHBOARD_ACCESS_PASSWORD,
    calendarUrl: env.SCHOOL_CALENDAR_URL,
    sessionSecret: env.DASHBOARD_SESSION_SECRET,
  };
  const originalFetch = globalThis.fetch;

  env.DASHBOARD_ACCESS_PASSWORD = "password-di-test";
  env.DASHBOARD_SESSION_SECRET = "s".repeat(32);
  env.SCHOOL_CALENDAR_URL = "https://calendar.google.com/test.ics";

  try {
    const unauthorizedResponse = await schoolCalendarHandler.fetch(
      new Request("https://dashboard.example/api/school-calendar"),
    );

    assert.equal(unauthorizedResponse.status, 401);

    const wrongPasswordResponse = await calendarSessionHandler.fetch(
      new Request("https://dashboard.example/api/calendar-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "password-errata" }),
      }),
    );

    assert.equal(wrongPasswordResponse.status, 401);

    const loginResponse = await calendarSessionHandler.fetch(
      new Request("https://dashboard.example/api/calendar-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: "password-di-test" }),
      }),
    );
    const setCookie = loginResponse.headers.get("set-cookie");

    assert.equal(loginResponse.status, 200);
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /SameSite=Strict/);
    assert.match(setCookie, /Secure/);

    globalThis.fetch = async () =>
      new Response("BEGIN:VCALENDAR\r\nEND:VCALENDAR", {
        status: 200,
      });

    const calendarResponse = await schoolCalendarHandler.fetch(
      new Request("https://dashboard.example/api/school-calendar", {
        headers: {
          Cookie: setCookie.split(";", 1)[0],
        },
      }),
    );

    assert.equal(calendarResponse.status, 200);
    assert.match(
      calendarResponse.headers.get("content-type"),
      /^text\/calendar/,
    );
    assert.match(await calendarResponse.text(), /BEGIN:VCALENDAR/);
  } finally {
    globalThis.fetch = originalFetch;

    for (const [name, value] of Object.entries({
      DASHBOARD_ACCESS_PASSWORD: originalEnvironment.accessPassword,
      DASHBOARD_SESSION_SECRET: originalEnvironment.sessionSecret,
      SCHOOL_CALENDAR_URL: originalEnvironment.calendarUrl,
    })) {
      if (value === undefined) {
        delete env[name];
      } else {
        env[name] = value;
      }
    }
  }
});
