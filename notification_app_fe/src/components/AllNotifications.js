/**
 * AllNotifications.js
 * Displays all notifications with filter by type and new/viewed distinction.
 */

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Stack,
  Alert,
  Divider,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import { fetchNotifications } from "../api";
import Log from "../logger";

// Color and icon mapping per notification type
const TYPE_CONFIG = {
  Placement: {
    color: "success",
    bgColor: "#e8f5e9",
    borderColor: "#2e7d32",
    icon: <WorkIcon fontSize="small" />,
  },
  Result: {
    color: "primary",
    bgColor: "#e3f2fd",
    borderColor: "#1565c0",
    icon: <SchoolIcon fontSize="small" />,
  },
  Event: {
    color: "warning",
    bgColor: "#fff8e1",
    borderColor: "#e65100",
    icon: <EventIcon fontSize="small" />,
  },
};

export default function AllNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("All");
  const [viewed, setViewed] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Log("frontend", "info", "component", "AllNotifications component mounted, beginning data fetch");

    fetchNotifications()
      .then((data) => {
        setNotifications(data);
        setLoading(false);
        Log(
          "frontend",
          "info",
          "component",
          `AllNotifications rendered with ${data.length} notifications loaded`
        );
      })
      .catch((err) => {
        Log(
          "frontend",
          "error",
          "component",
          `AllNotifications failed to load notifications: ${err.message}`
        );
        setError("Failed to load notifications. Please try again.");
        setLoading(false);
      });
  }, []);

  const handleView = (id) => {
    if (!viewed.has(id)) {
      Log(
        "frontend",
        "info",
        "component",
        `Notification marked as viewed by user: ID=${id}`
      );
      setViewed((prev) => new Set([...prev, id]));
    }
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    Log(
      "frontend",
      "info",
      "component",
      `User applied notification type filter: ${value}`
    );
    setFilter(value);
  };

  // Apply client-side filter
  const filtered =
    filter === "All"
      ? notifications
      : notifications.filter((n) => n.Type === filter);

  const unreadCount = filtered.filter((n) => !viewed.has(n.ID)).length;

  // ── Loading state ──
  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={8} gap={2}>
        <CircularProgress size={48} sx={{ color: "#1565c0" }} />
        <Typography color="text.secondary">Loading notifications...</Typography>
      </Box>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Toolbar row: count + filter */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2.5}
        flexWrap="wrap"
        gap={1.5}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} color="#1565c0">
            All Notifications
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {filtered.length} total · {unreadCount} unread
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Filter by Type</InputLabel>
          <Select value={filter} label="Filter by Type" onChange={handleFilterChange}>
            <MenuItem value="All">All Types</MenuItem>
            <MenuItem value="Placement">Placement</MenuItem>
            <MenuItem value="Result">Result</MenuItem>
            <MenuItem value="Event">Event</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Notification list */}
      {filtered.length === 0 ? (
        <Box textAlign="center" py={8}>
          <NotificationsIcon sx={{ fontSize: 56, color: "#bdbdbd" }} />
          <Typography color="text.secondary" mt={1}>
            No notifications found for this filter.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {filtered.map((notif) => {
            const isNew = !viewed.has(notif.ID);
            const config = TYPE_CONFIG[notif.Type] || {
              color: "default",
              bgColor: "#f5f5f5",
              borderColor: "#9e9e9e",
              icon: <NotificationsIcon fontSize="small" />,
            };

            return (
              <Card
                key={notif.ID}
                onClick={() => handleView(notif.ID)}
                elevation={isNew ? 3 : 1}
                sx={{
                  cursor: "pointer",
                  borderLeft: `4px solid ${isNew ? config.borderColor : "#bdbdbd"}`,
                  bgcolor: isNew ? config.bgColor : "#fafafa",
                  opacity: isNew ? 1 : 0.72,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: 4,
                    opacity: 1,
                  },
                }}
              >
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                    {/* Message */}
                    <Typography
                      variant="body1"
                      fontWeight={isNew ? 700 : 400}
                      sx={{ flex: 1, lineHeight: 1.4 }}
                    >
                      {notif.Message}
                    </Typography>

                    {/* Badges */}
                    <Box display="flex" gap={0.75} flexShrink={0}>
                      {isNew && (
                        <Chip label="NEW" color="error" size="small" sx={{ fontWeight: 700, fontSize: "0.65rem" }} />
                      )}
                      <Chip
                        icon={config.icon}
                        label={notif.Type}
                        color={config.color}
                        size="small"
                        variant={isNew ? "filled" : "outlined"}
                      />
                    </Box>
                  </Box>

                  {/* Metadata */}
                  <Box display="flex" gap={2} mt={0.75}>
                    <Typography variant="caption" color="text.secondary">
                      🕐 {notif.Timestamp}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      ID: {notif.ID.slice(0, 8)}…
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
