import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/index.css";
import { DestinationProvider } from "./context/DestinationContext.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Get Google Client ID from environment variable
const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "405633779192-ske6aht168e7j3iv99tg37ibh2asp6vb.apps.googleusercontent.com").trim();

console.log("[DEBUG] Current Origin:", window.location.origin);
console.log("[DEBUG] Using Google Client ID:", GOOGLE_CLIENT_ID);

if (!GOOGLE_CLIENT_ID) {
  console.error("VITE_GOOGLE_CLIENT_ID is not set in environment variables!");
}

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <DestinationProvider>
        <App />
      </DestinationProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
