/**
 * PriorityInbox.js
 * Displays top N priority notifications ranked by type weight + recency.
 * Priority: Placement (3) > Result (2) > Event (1), then by timestamp.
 */

import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Slider,
  Stack,
  CircularProgress,
  Paper,
  Alert,
  Divider,
  Avatar,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { fetchNotifications, getPriorityNotifications } from "../api";
import Log from "../logger";

const TYPE_CONFIG = {
  Placement: { color: "success", icon: <WorkIcon fontSize="small" /> },
  Result:    { color: "primary", icon: <SchoolIcon fontSize="small" /> },
  Event:     { color: "warning", icon: <EventIcon fontSize="small" /> },
};

// Medal colors for top 3
const RANK_STYLES = [
  { border: "#FFD700", bg: "#fffde7", medal: "🥇" },
  { border: "#C0C0C0", bg: "#f5f5f5", medal: "🥈" },
  { border: "#CD7F32", bg: "#fff3e0", medal: "🥉" },
];

export default function PriorityInbox() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [topN, setTopN] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Log("frontend", "info", "component", "PriorityInbox component mounted, fetching all notifications for ranking");

    fetchNotifications()
      .then((data) => {
        setAllNotifications(data);
        setLoading(false);
        Log(
          "frontend",
          "info",
          "component",
          `PriorityInbox loaded ${data.length} notifications, ready to rank top ${topN}`
        );
      })
      .catch((err) => {
        Log(
          "frontend",
          "error",
          "component",
          `PriorityInbox failed to fetch notifications: ${err.message}`
        );
        setError("Failed to load notifications. Please try again.");
        setLoading(false);
      });
  }, []);

  const handleSliderChange = (e, val) => {
    Log(
      "frontend",
      "info",
      "component",
      `User adjusted priority inbox display count from ${topN} to ${val}`
    );
    setTopN(val);
  };

  // Compute priority ranked list
  const prioritized = getPriorityNotifications(allNotifications, topN);

  // ── Loading state ──
  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" mt={8} gap={2}>
        <CircularProgress size={48} sx={{ color: "#1565c0" }} />
        <Typography color="text.secondary">Calculating priorities...</Typography>
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
      {/* Header */}
      <Box mb={2.5}>
        <Typography variant="h6" fontWeight={700} color="#1565c0">
          Priority Inbox
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Ranked by importance: Placement › Result › Event, then by recency
        </Typography>
      </Box>

      {/* Slider Control */}
      <Paper elevation={2} sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: "#e8eaf6" }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <StarIcon sx={{ color: "#1565c0", fontSize: 20 }} />
          <Typography fontWeight={700} color="#1565c0">
            Showing Top {topN} Notifications
          </Typography>
        </Box>
        <Slider
          value={topN}
          min={5}
          max={20}
          step={5}
          marks={[
            { value: 5,  label: "5"  },
            { value: 10, label: "10" },
            { value: 15, label: "15" },
            { value: 20, label: "20" },
          ]}
          onChange={handleSliderChange}
          sx={{
            color: "#1565c0",
            "& .MuiSlider-markLabel": { fontSize: "0.75rem" },
          }}
        />
        <Typography variant="caption" color="text.secondary">
          Drag slider to change how many top priority notifications to display
        </Typography>
      </Paper>

      <Divider sx={{ mb: 2 }} />

      {/* Priority list */}
      {prioritized.length === 0 ? (
        <Box textAlign="center" py={8}>
          <EmojiEventsIcon sx={{ fontSize: 56, color: "#bdbdbd" }} />
          <Typography color="text.secondary" mt={1}>
            No notifications available.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {prioritized.map((notif, index) => {
            const rankStyle = RANK_STYLES[index] || { border: "#1565c0", bg: "#fff", medal: null };
            const config = TYPE_CONFIG[notif.Type] || { color: "default", icon: null };

            return (
              <Card
                key={notif.ID}
                elevation={index < 3 ? 4 : 1}
                sx={{
                  borderLeft: `4px solid ${rankStyle.border}`,
                  bgcolor: rankStyle.bg,
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: 6 },
                }}
              >
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Box display="flex" alignItems="flex-start" gap={1.5}>
                    {/* Rank badge */}
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: rankStyle.border,
                        fontSize: index < 3 ? "1.1rem" : "0.85rem",
                        fontWeight: 700,
                        flexShrink: 0,
                        color: index < 3 ? "white" : "white",
                      }}
                    >
                      {rankStyle.medal || `#${index + 1}`}
                    </Avatar>

                    {/* Content */}
                    <Box flex={1}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
                        <Typography variant="body1" fontWeight={700} sx={{ flex: 1, lineHeight: 1.4 }}>
                          {notif.Message}
                        </Typography>
                        <Chip
                          icon={config.icon}
                          label={notif.Type}
                          color={config.color}
                          size="small"
                        />
                      </Box>

                      <Box display="flex" gap={2} mt={0.5}>
                        <Typography variant="caption" color="text.secondary">
                          🕐 {notif.Timestamp}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          ID: {notif.ID.slice(0, 8)}…
                        </Typography>
                      </Box>
                    </Box>
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
