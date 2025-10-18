import "./App.css";
import { Navigate, Route, Routes } from "react-router";
import Layout from "./componets/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { ToastContainer } from "react-toastify";
import SignUpPage from "./pages/Signup";
import useAuthUser from "./hooks/useAuthUser";
import { useThemeStore } from "./store/useTheme";
import PageLoader from "./pages/PageLoader";
import ProjectsPage from "./pages/ProjectsPage";
import TaskPage from "./pages/TaskPage";


function App() {
  const { isLoading, authUser } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = Boolean(authUser);

  if (isLoading) return <PageLoader />;

  const ProtectedRoute = ({ children }) => {
    if (isAuthenticated) {
      return children;
    }
    return <Navigate to={!isAuthenticated ? "/login" : "/"} replace />;
  };

  return (
    <>
      <div data-theme={theme}>
        <Routes>
          {/* Protected Routes with sidebar layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout showSidebar={true} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="tasks" element={<TaskPage />} />
          </Route>

          {/* Login Route */}
          <Route
            path="/login"
            element={
              !isAuthenticated ? <Login /> : <Navigate to={"/"} replace />
            }
          />

          {/* Signup Route */}
          <Route
            path="/signup"
            element={
              !isAuthenticated ? <SignUpPage /> : <Navigate to={"/"} replace />
            }
          />
        </Routes>
        <ToastContainer />
      </div>
    </>
  );
}

export default App;
