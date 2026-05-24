import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { PortfolioProvider } from "./context/PortfolioContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { PublicLayout } from "./components/PublicLayout";
import { Layout } from "./components/Layout";
import { LandingPage } from "./pages/LandingPage";
import { OverviewPage } from "./pages/OverviewPage";
import { HoldingsPage } from "./pages/HoldingsPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { DividendsPage } from "./pages/DividendsPage";
import { Routes } from "./routes";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to={Routes.LandingPage} replace />;
  return <>{children}</>;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path={Routes.LandingPage} element={<LandingPage />} />
      </Route>

      {/* Protected app routes */}
      <Route
        element={
          <RequireAuth>
            <PortfolioProvider>
              <Layout />
            </PortfolioProvider>
          </RequireAuth>
        }
      >
        <Route path={Routes.Overview} element={<OverviewPage />} />
        <Route path={Routes.Holdings} element={<HoldingsPage />} />
        <Route path={Routes.Transactions} element={<TransactionsPage />} />
        <Route path={Routes.Dividends} element={<DividendsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={Routes.LandingPage} replace />} />
    </>,
  ),
);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
