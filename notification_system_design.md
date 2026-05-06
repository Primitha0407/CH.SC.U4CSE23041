# Notification System Design

## Stage 1

### Priority Algorithm

Each notification is assigned a numeric score used for ranking:

```
score = (type_weight × 1e13) + unix_timestamp_ms
```

**Type Weights:**

| Type      | Weight |
|-----------|--------|
| Placement | 3 (Highest) |
| Result    | 2 (Medium)  |
| Event     | 1 (Lowest)  |

Multiplying the type weight by `1e13` ensures type always dominates the score regardless of timestamp. Within the same type, newer notifications (higher timestamp) rank higher.

### Approach

1. Fetch all notifications from the AffordMed API using the Bearer token.
2. For each notification, compute its score using the formula above.
3. Sort in descending order of score — O(n log n).
4. Return the top N results (default: 10).

### Handling New Notifications Efficiently

As new notifications arrive, re-fetching and re-sorting the full list is acceptable at this scale. For larger systems, a **min-heap of size N** would be more efficient:

- Maintain a heap of the top N notifications.
- For each new notification, compute its score.
- If it exceeds the heap's minimum, replace the minimum with the new notification and re-heapify — O(log N) per insertion.
- This keeps the top N always up to date without sorting the entire dataset.

### Implementation

Implemented in JavaScript (`api.js`) using the `getPriorityNotifications` function:

```js
const TYPE_WEIGHT = { Placement: 3, Result: 2, Event: 1 };

export const getPriorityNotifications = (notifications, n = 10) => {
  const scored = notifications.map((notif) => {
    const typeScore = TYPE_WEIGHT[notif.Type] || 0;
    const recency = new Date(notif.Timestamp).getTime();
    return { ...notif, score: typeScore * 1e13 + recency };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, n);
};
```

---

## Stage 2

### Frontend Architecture

Built with **React** and **Material UI** running on `http://localhost:3000`.

**Folder structure:**
```
notification_app_fe/
├── src/
│   ├── logger.js              ← Logging middleware integration
│   ├── api.js                 ← API layer with auth + error handling
│   ├── App.js                 ← Root component with tab navigation
│   └── components/
│       ├── AllNotifications.js  ← All notifications with filter + viewed state
│       └── PriorityInbox.js     ← Top N ranked notifications with slider
```

**Key Design Decisions:**

- **New vs Viewed:** Tracked entirely in frontend state using a `Set` of viewed notification IDs. Clicking a notification card marks it as viewed — no backend needed.
- **Filtering:** Client-side filter by notification type (All / Placement / Result / Event).
- **Priority Slider:** Users can dynamically adjust top N (5, 10, 15, 20) using a MUI Slider.
- **Responsive:** Uses MUI's responsive `sx` props to adapt layout for mobile and desktop.
- **Logging:** Every significant user action and lifecycle event is logged via the AffordMed logging API using `Log(stack, level, package, message)`.
