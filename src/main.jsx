import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import appIcon from "./Asset/images.png";

const favicon = document.querySelector('link[rel="icon"]');
if (favicon) {
  favicon.href = appIcon;
}

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
