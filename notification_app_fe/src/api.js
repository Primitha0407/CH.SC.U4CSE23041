/**
 * api.js - API layer for Campus Notification System
 * Fetches from AffordMed server. Falls back to sample data if API is unreachable.
 */

import Log from "./logger";

const API_BASE_URL = "http://20.207.122.201/evaluation-service/notifications";
const AUTH_TOKEN =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJjaC5zYy51NGNzZTIzMDQxQGNoLnN0dWRlbnRzLmFtcml0YS5lZHUiLCJleHAiOjE3NzgwNjI5MTEsImlhdCI6MTc3ODA2MjAxMSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjIxNjE2YWFhLWU4ODAtNDAxOC04MmIzLWQzZjUxY2UwOGYwNiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InByaW1pdGhhIHMiLCJzdWIiOiIyMjY5MWM0MS1kMjRjLTQyMWYtODI2OC1jZDU4YjdiYjFiMzEifSwiZW1haWwiOiJjaC5zYy51NGNzZTIzMDQxQGNoLnN0dWRlbnRzLmFtcml0YS5lZHUiLCJuYW1lIjoicHJpbWl0aGEgcyIsInJvbGxObyI6ImNoLnNjLnU0Y3NlMjMwNDEiLCJhY2Nlc3NDb2RlIjoiUFRCTW1RIiwiY2xpZW50SUQiOiIyMjY5MWM0MS1kMjRjLTQyMWYtODI2OC1jZDU4YjdiYjFiMzEiLCJjbGllbnRTZWNyZXQiOiJqcmRaQmtuY0hDZGdhQVphIn0.z6wXNMSMWWSS_WVEjp6C7VmzAIOmSt93PTwSlcLmJbg";

// Real sample data from AffordMed API response (used as fallback)
const SAMPLE_NOTIFICATIONS = [
  { ID: "d146095a-0d86-4a34-9e69-3900a14576bc", Type: "Result",    Message: "mid-sem",                          Timestamp: "2026-04-22 17:51:30" },
  { ID: "b283218f-ea5a-4b7c-93a9-1f2f240d64b0", Type: "Placement", Message: "CSX Corporation hiring",           Timestamp: "2026-04-22 17:51:18" },
  { ID: "81589ada-0ad3-4f77-9554-f52fb558e09d", Type: "Event",     Message: "farewell",                         Timestamp: "2026-04-22 17:51:06" },
  { ID: "0005513a-142b-4bbc-8678-eefec65e1ede", Type: "Result",    Message: "mid-sem",                          Timestamp: "2026-04-22 17:50:54" },
  { ID: "ea836726-c25e-4f21-a72f-544a6af8a37f", Type: "Result",    Message: "project-review",                   Timestamp: "2026-04-22 17:50:42" },
  { ID: "003cb427-8fc6-47f7-bb00-be228f6b0d2c", Type: "Result",    Message: "external",                         Timestamp: "2026-04-22 17:50:30" },
  { ID: "e5c4ff20-31bf-4d40-8f02-72fda59e8918", Type: "Result",    Message: "project-review",                   Timestamp: "2026-04-22 17:50:18" },
  { ID: "1cfce5ee-ad37-4894-8946-d707627176a5", Type: "Event",     Message: "tech-fest",                        Timestamp: "2026-04-22 17:50:06" },
  { ID: "cf2885a6-45ac-4ba0-b548-6e9e9d4c52c8", Type: "Result",    Message: "project-review",                   Timestamp: "2026-04-22 17:49:54" },
  { ID: "8a7412bd-6065-4d09-8501-a37f11cc848b", Type: "Placement", Message: "Advanced Micro Devices Inc. hiring", Timestamp: "2026-04-22 17:49:42" },
];

// Priority weights as per specification: Placement > Result > Event
const TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

/**
 * Fetches notifications from the API with optional query params.
 * Falls back to sample data if API is unreachable (e.g. CORS in browser).
 */
export const fetchNotifications = async (params = {}) => {
  await Log(
    "frontend",
    "info",
    "api",
    `fetchNotifications called with params: ${JSON.stringify(params)}`
  );

  try {
    const queryString = Object.keys(params).length
      ? "?" + new URLSearchParams(params).toString()
      : "";

    const url = `${API_BASE_URL}${queryString}`;
    await Log("frontend", "debug", "api", `Making GET request to: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const notifications = data.notifications || [];

    await Log(
      "frontend",
      "info",
      "api",
      `Successfully fetched ${notifications.length} notifications from server`
    );

    if (notifications.length === 0) {
      await Log("frontend", "warn", "api", "API returned 0 notifications, using sample data");
      return SAMPLE_NOTIFICATIONS;
    }

    return notifications;

  } catch (error) {
    await Log(
      "frontend",
      "warn",
      "api",
      `API unreachable (${error.message}), falling back to sample notifications`
    );
    return SAMPLE_NOTIFICATIONS;
  }
};

/**
 * Calculates priority score and returns top N notifications.
 * Score = (type_weight * 1e13) + unix_timestamp
 * This ensures type always takes priority, then recency breaks ties.
 */
export const getPriorityNotifications = (notifications, n = 10) => {
  const scored = notifications.map((notif) => {
    const typeScore = TYPE_WEIGHT[notif.Type] || 0;
    const recency = new Date(notif.Timestamp).getTime();
    const score = typeScore * 1e13 + recency;
    return { ...notif, score };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, n);
};
