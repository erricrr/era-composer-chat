import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

const registerServiceWorker = registerSW({
  immediate: false,
});

const scheduleServiceWorkerRegistration = () => {
  registerServiceWorker();
};

if ("requestIdleCallback" in window) {
  window.requestIdleCallback(scheduleServiceWorkerRegistration, {
    timeout: 3000,
  });
} else {
  window.addEventListener("load", scheduleServiceWorkerRegistration, {
    once: true,
  });
}
