import {
  createHash,
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import { env } from "node:process";

export const CALENDAR_SESSION_COOKIE =
  "dashboard_calendar_session";

const SESSION_DURATION_MS = 12 * 60 * 60 * 1000;
const SESSION_DURATION_SECONDS = SESSION_DURATION_MS / 1000;

function sign(value, secret) {
  return createHmac("sha256", secret)
    .update(value)
    .digest("base64url");
}

function hash(value) {
  return createHash("sha256").update(value).digest();
}

export function secretsMatch(providedValue, expectedValue) {
  if (
    typeof providedValue !== "string" ||
    typeof expectedValue !== "string"
  ) {
    return false;
  }

  return timingSafeEqual(
    hash(providedValue),
    hash(expectedValue),
  );
}

export function createCalendarSessionToken(
  secret,
  now = Date.now(),
) {
  const expiresAt = String(now + SESSION_DURATION_MS);
  return `${expiresAt}.${sign(expiresAt, secret)}`;
}

export function verifyCalendarSessionToken(
  token,
  secret,
  now = Date.now(),
) {
  if (!token || !secret) {
    return false;
  }

  const separatorIndex = token.indexOf(".");

  if (separatorIndex <= 0) {
    return false;
  }

  const expiresAt = token.slice(0, separatorIndex);
  const receivedSignature = token.slice(separatorIndex + 1);
  const numericExpiration = Number(expiresAt);

  if (
    !Number.isFinite(numericExpiration) ||
    numericExpiration <= now
  ) {
    return false;
  }

  return secretsMatch(
    receivedSignature,
    sign(expiresAt, secret),
  );
}

function readCookie(request, cookieName) {
  const cookieHeader = request.headers.get("cookie") ?? "";

  for (const cookiePart of cookieHeader.split(";")) {
    const separatorIndex = cookiePart.indexOf("=");

    if (separatorIndex < 0) {
      continue;
    }

    const name = cookiePart.slice(0, separatorIndex).trim();

    if (name === cookieName) {
      return cookiePart.slice(separatorIndex + 1).trim();
    }
  }

  return null;
}

export function isCalendarRequestAuthenticated(
  request,
  secret = env.DASHBOARD_SESSION_SECRET,
) {
  const token = readCookie(request, CALENDAR_SESSION_COOKIE);
  return verifyCalendarSessionToken(token, secret);
}

export function createCalendarSessionCookie(token, requestUrl) {
  const isSecure = new URL(requestUrl).protocol === "https:";

  return [
    `${CALENDAR_SESSION_COOKIE}=${token}`,
    "Path=/api",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${SESSION_DURATION_SECONDS}`,
    isSecure ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearCalendarSessionCookie(requestUrl) {
  const isSecure = new URL(requestUrl).protocol === "https:";

  return [
    `${CALENDAR_SESSION_COOKIE}=`,
    "Path=/api",
    "HttpOnly",
    "SameSite=Strict",
    "Max-Age=0",
    isSecure ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");
}

export function getCalendarAuthConfiguration() {
  const password = env.DASHBOARD_ACCESS_PASSWORD ?? "";
  const sessionSecret =
    env.DASHBOARD_SESSION_SECRET ?? "";

  if (password.length < 12 || sessionSecret.length < 32) {
    return null;
  }

  return {
    password,
    sessionSecret,
  };
}
