import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalysisProvider } from "@/contexts/AnalysisContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { FlightDataProvider } from "@/contexts/FlightDataContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import IncidentReplay from "./pages/IncidentReplay";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <FlightDataProvider>
        <AnalysisProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />

                {/* Protected routes */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Audit replay route - requires supervisor/admin */}
                <Route
                  path="/audit/:incidentId"
                  element={
                    <ProtectedRoute requiredPermissions={["view-audit", "replay-incidents"]}>
                      <IncidentReplay />
                    </ProtectedRoute>
                  }
                />

                {/* Full replay without specific incident */}
                <Route
                  path="/replay"
                  element={
                    <ProtectedRoute requiredPermissions={["view-audit", "replay-incidents"]}>
                      <IncidentReplay />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AnalysisProvider>
      </FlightDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
