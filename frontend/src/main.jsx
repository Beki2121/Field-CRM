import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import appIcon from "./Asset/images.png";

const favicon = document.querySelector('link[rel="icon"]');
if (favicon) {
  favicon.href = appIcon;
}

// Verify API is available on startup
const API_BASE = import.meta.env.VITE_API_URL;
if (!API_BASE) {
  console.error(
    "ERROR: VITE_API_URL is not set. App requires backend API to function.",
  );
  document.body.innerHTML =
    "<div style='padding: 20px; color: red; font-family: sans-serif;'><h1>Configuration Error</h1><p>Backend API URL is not configured. Please set VITE_API_URL environment variable.</p></div>";
} else {
  console.log("App configured with API:", API_BASE);

  window.addEventListener("load", () => {
    import("virtual:pwa-register").then(({ registerSW }) => {
      registerSW({
        immediate: false,
        onNeedRefresh() {
          console.log("A new version is available.");
        },
        onOfflineReady() {
          console.log("App is ready for offline use.");
        },
      });
    });
  });

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
