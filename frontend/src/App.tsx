import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AudioProvider } from "./context/AudioContext";
import ProtectedRoute from "./router/ProtectedRoute";
import { ToastContainer } from "react-toastify";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/producer/Dashboard";
import Profile from "./pages/user/Profile";
import ProducerPage from "./pages/user/ProducerPage";
import Favorites from "./pages/Favorites";

import UserLayout from "./layouts/UserLayout";
import ProducerLayout from "./layouts/ProducerLayout";
import UploadBeat from "./pages/producer/UploadBeat";

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { userRole } = useAuth();

  if (userRole === "PRODUCER") {
    return <ProducerLayout>{children}</ProducerLayout>;
  }

  return <UserLayout>{children}</UserLayout>;
}

function App() {
  return (
    <BrowserRouter>
      <AudioProvider>
        <AuthProvider>
          <ToastContainer
            position="top-right"
            autoClose={2000}
            pauseOnHover
            theme="dark"
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* ANA SAYFA */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Home />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />

            {/* PROFİL */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Profile />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />

            {/* FAVORİLER */}
            <Route
              path="/favorites"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <Favorites />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />

            {/* PRODUCER DETAY SAYFASI */}
            <Route
              path="/producer/:id"
              element={
                <ProtectedRoute>
                  <LayoutWrapper>
                    <ProducerPage />
                  </LayoutWrapper>
                </ProtectedRoute>
              }
            />

            {/* PRODUCER DASHBOARD */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute role="PRODUCER">
                  <ProducerLayout>
                    <Dashboard />
                  </ProducerLayout>
                </ProtectedRoute>
              }
            />

            {/* BEAT YÜKLEME */}
            <Route
              path="/upload"
              element={
                <ProtectedRoute role="PRODUCER">
                  <ProducerLayout>
                    <UploadBeat />
                  </ProducerLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </AudioProvider>
    </BrowserRouter>
  );
}

export default App;
