import { scan } from "react-scan";

import "@fontsource-variable/inter";
import "@fontsource-variable/wix-madefor-text";
import "@fontsource/barlow/200.css";
import "@fontsource/barlow/300.css";
import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/barlow/700.css";
import "@fontsource/barlow/800.css";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import App from "./App";
import {
  AuthProvider,
  ProtectedRoute,
  PublicRoute
} from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import "./index.css";
import AuthLayout from "./layouts/AuthLayout";
import { store } from "./lib/store";
import AlertsPage from "./pages/alerts";
import DashboardPage from "./pages/dashboard";
import DataReviewPage from "./pages/data-review";

import HistoryPage from "./pages/history";
import LiveDataPage from "./pages/live-data-new";
import LoginPage from "./pages/login";
import MapDisplay from "./pages/map-display";
import MethodPage from "./pages/method";
import NotFoundPage from "./pages/NotFoundPage";
import QAQCPage from "./pages/qa-qc";
import ReportsPage from "./pages/reports";
import ServicePage from "./pages/service";
import SettingsPage from "./pages/settings";

scan({
  enabled: false
});

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            <Route path="/" element={<App />}>
              {/* renders into the outlet in <Root> at "/" */}
              <Route index element={<Navigate to="/login" replace />} />

              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <AuthLayout />
                  </ProtectedRoute>
                }
              >
                {/* renders into the outlet in <Dashboard> at "/dashboard" */}
                <Route index element={<DashboardPage />} />
                <Route path="map-display" element={<MapDisplay />} />
                <Route path="live-data" element={<LiveDataPage />} />
                <Route path="data-review" element={<DataReviewPage />} />
                <Route path="method" element={<MethodPage />} />
                <Route path="qa-qc" element={<QAQCPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="service" element={<ServicePage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="history" element={<HistoryPage />} />
                {/* Catch-all route for unmatched URLs inside /dashboard */}
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              <Route
                path="login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
            </Route>
            {/* Catch-all route for unmatched URLs outside authenticated area */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </Provider>
);
