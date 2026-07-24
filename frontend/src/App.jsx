/**
 * App - top-level composition root. Wraps the router in the two global
 * contexts every screen depends on: auth (token) and toast notifications
 * (Section 19 folder structure: context/AuthContext, context/ToastContext).
 */
import AppRouter from "./router/AppRouter.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
      </ToastProvider>
    </AuthProvider>
  );
}
