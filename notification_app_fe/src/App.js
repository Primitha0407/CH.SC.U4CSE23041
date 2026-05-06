/**
 * App.js - Root component for Campus Notification System
 * Renders the main layout with tab navigation between pages.
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  AppBar,
  Toolbar,
  Badge,
  CssBaseline,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import AllNotifications from "./components/AllNotifications";
import PriorityInbox from "./components/PriorityInbox";
import Log from "./logger";

function App() {
  const [tab, setTab] = useState(0);

  useEffect(() => {
    Log("frontend", "info", "page", "Campus Notification app initialised and mounted");
  }, []);

  const handleTabChange = (e, newValue) => {
    const tabName = newValue === 0 ? "All Notifications" : "Priority Inbox";
    Log("frontend", "info", "page", `User navigated to tab: ${tabName}`);
    setTab(newValue);
  };

  return (
    <>
      <CssBaseline />
      <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "#f0f4f8" }}>
        {/* Header */}
        <AppBar position="static" elevation={2} sx={{ bgcolor: "#1565c0" }}>
          <Toolbar>
            <NotificationsIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700} letterSpacing={0.5}>
              Campus Notifications
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Tab Navigation */}
        <Box sx={{ bgcolor: "white", borderBottom: "1px solid #e0e0e0" }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            centered
            sx={{
              "& .MuiTab-root": { fontWeight: 600, fontSize: "0.95rem", py: 2 },
              "& .Mui-selected": { color: "#1565c0" },
              "& .MuiTabs-indicator": { bgcolor: "#1565c0", height: 3 },
            }}
          >
            <Tab
              icon={<NotificationsIcon fontSize="small" />}
              iconPosition="start"
              label="All Notifications"
            />
            <Tab
              icon={<StarIcon fontSize="small" />}
              iconPosition="start"
              label="Priority Inbox"
            />
          </Tabs>
        </Box>

        {/* Page Content */}
        <Box sx={{ p: { xs: 1.5, sm: 3 }, maxWidth: 960, margin: "0 auto" }}>
          {tab === 0 && <AllNotifications />}
          {tab === 1 && <PriorityInbox />}
        </Box>
      </Box>
    </>
  );
}

export default App;
