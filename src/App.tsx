import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SharePage } from "./pages/SharePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AuthPage } from "./pages/AuthPage";
import { HistoryPage } from "./pages/HistoryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { TeamPage } from "./pages/TeamPage";
import { JoinPage } from "./pages/JoinPage"; // <-- Añadido el import de la nueva página

export function App() {
  return (
    <BrowserRouter>
      {/* ── ESTE ES EL FONDO MÁGICO PARA TODA LA WEB ── */}
      <div className="premium-bg">
        <div className="orb-1"></div>
        <div className="orb-2"></div>
      </div>
      {/* ────────────────────────────────────────────── */}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* LA PUERTA DE INVITADOS (Sin proteger para que puedan entrar al link) */}
        <Route path="/join/:code" element={<JoinPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <TeamPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/share/:id"
          element={
            <ProtectedRoute>
              <SharePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
