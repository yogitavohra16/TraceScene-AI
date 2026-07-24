/**
 * ToastContext - a tiny global notification queue. Every API hook surfaces
 * errors here (Section 33: "Frontend API errors" strategy) instead of each
 * component managing its own error banner.
 */
import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, variant = "info") => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`animate-fade-in-up rounded-lg border px-4 py-2 text-sm shadow-lg ${
              toast.variant === "error"
                ? "border-severity-critical/40 bg-surface-elevated text-severity-critical"
                : toast.variant === "success"
                  ? "border-severity-low/40 bg-surface-elevated text-severity-low"
                  : "border-border-subtle bg-surface-elevated text-text-primary"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
