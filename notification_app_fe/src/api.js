/**
 * api.js - API layer for Campus Notification System
 * Handles all communication with AffordMed evaluation server.
 */

import Log from "./logger";

const API_BASE_URL = "http://20.207.122.201/evaluation-service/notifications";
const AUTH_TOKEN =
  "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJjaC5zYy51NGNzZTIzMDQxQGNoLnN0dWRlbnRzLmFtcml0YS5lZHUiLCJleHAiOjE3NzgwNjI5MTEsImlhdCI6MTc3ODA2MjAxMSwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6IjIxNjE2YWFhLWU4ODAtNDAxOC04MmIzLWQzZjUxY2UwOGYwNiIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6InByaW1pdGhhIHMiLCJzdWIiOiIyMjY5MWM0MS1kMjRjLTQyMWYtODI2OC1jZDU4YjdiYjFiMzEifSwiZW1haWwiOiJjaC5zYy51NGNzZTIzMDQxQGNoLnN0dWRlbnRzLmFtcml0YS5lZHUiLCJuYW1lIjoicHJpbWl0aGEgcyIsInJvbGxObyI6ImNoLnNjLnU0Y3NlMjMwNDEiLCJhY2Nlc3NDb2RlIjoiUFRCTW1RIiwiY2xpZW50SUQiOiIyMjY5MWM0MS1kMjRjLTQyMWYtODI2OC1jZDU4YjdiYjFiMzEiLCJjbGllbnRTZWNyZXQiOiJqcmRaQmtuY0hDZGdhQVphIn0.z6wXNMSMWWSS_WVEjp6C7VmzAIOmSt93PTwSlcLmJbg";

// Priority weights as per specification: Placement > Result > Event
const TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

/**
 * Fetches notifications from the API with optional query params.
 * Supports: limit, page, notification_type
 */
export const fetchNotifications = async (params = {}) => {
  await Log(
    "frontend",
    "info",
    "api",
    `fetchNotifications called with params: ${JSON.stringify(params)}`
  );

  try {
    // Build query string from params
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
      await Log(
        "frontend",
        "error",
        "api",
        `API responded with status ${response.status}: ${response.statusText}`
      );
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

    return notifications;
  } catch (error) {
    await Log(
      "frontend",
      "error",
      "api",
      `fetchNotifications failed with error: ${error.message}`
    );
    return [];
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
