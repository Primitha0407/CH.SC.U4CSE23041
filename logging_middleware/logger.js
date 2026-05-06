/**
 * Logging Middleware - AffordMed Campus Notification System
 * Reusable logging package that sends logs to the AffordMed evaluation server.
 * Usage: Log(stack, level, package, message)
 */

const LOG_API_URL = "http://20.207.122.201/evaluation-service/logs";
const AUTH_TOKEN =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJjaC5zYy51NGNzZTIzMDQxQGNoLnN0dWRlbnRzLmFtcml0YS5lZHUiLCJleHAiOjE3NzgwNjI5MTEsImlhdCI6MTc3ODA2MjAxMSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjIxNjE2YWFhLWU4ODAtNDAxOC04MmIzLWQzZjUxY2UwOGYwNiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InByaW1pdGhhIHMiLCJzdWIiOiIyMjY5MWM0MS1kMjRjLTQyMWYtODI2OC1jZDU4YjdiYjFiMzEifSwiZW1haWwiOiJjaC5zYy51NGNzZTIzMDQxQGNoLnN0dWRlbnRzLmFtcml0YS5lZHUiLCJuYW1lIjoicHJpbWl0aGEgcyIsInJvbGxObyI6ImNoLnNjLnU0Y3NlMjMwNDEiLCJhY2Nlc3NDb2RlIjoiUFRCTW1RIiwiY2xpZW50SUQiOiIyMjY5MWM0MS1kMjRjLTQyMWYtODI2OC1jZDU4YjdiYjFiMzEiLCJjbGllbnRTZWNyZXQiOiJqcmRaQmtuY0hDZGdhQVphIn0.z6wXNMSMWWSS_WVEjp6C7VmzAIOmSt93PTwSlcLmJbg";

// Valid values as per AffordMed spec
const VALID_STACKS = ["frontend", "backend"];
const VALID_LEVELS = ["debug", "info", "warn", "error", "fatal"];
const VALID_PACKAGES = [
  "api", "component", "hook", "page", "state", "style",
  "auth", "config", "middleware", "utils",
];

/**
 * Log an event to the AffordMed evaluation server.
 * @param {string} stack   - "frontend" or "backend"
 * @param {string} level   - "debug" | "info" | "warn" | "error" | "fatal"
 * @param {string} pkg     - package name (e.g. "api", "component", "hook")
 * @param {string} message - descriptive log message
 */
const Log = async (stack, level, pkg, message) => {
  // Validate inputs silently — do not break the app if logging fails
  if (
    !VALID_STACKS.includes(stack) ||
    !VALID_LEVELS.includes(level) ||
    !VALID_PACKAGES.includes(pkg)
  ) {
    return;
  }

  try {
    await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN,
      },
      body: JSON.stringify({
        stack: stack,
        level: level,
        package: pkg,
        message: message,
      }),
    });
  } catch (_) {
    // Intentionally silent — logging must never crash the application
  }
};

export default Log;
