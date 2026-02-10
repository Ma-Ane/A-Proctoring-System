import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Portfolio from "./pages/Portfolio";
import Result from "./pages/Result";
import Instructions from "./pages/Instructions";
import TakeExam from "./pages/TakeExam";
import StartExam from "./pages/StartExam";
import SetQuestions from "./pages/SetQuestions";
import CheckResult from "./pages/CheckResult";

const ProtectedRoute = ({ isLoggedIn, children }) => {
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const router = (isLoggedIn, setIsLoggedIn) =>
  createBrowserRouter([
    {
      path: "/",
      element: <App />,
      children: [
        {
          index: true,
          element: (
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <HomePage />
            </ProtectedRoute>
          ),
        },
        {
          path: "portfolio",
          element: (
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Portfolio />
            </ProtectedRoute>
          ),
        },
        {
          path: "results",
          element: (
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Result />
            </ProtectedRoute>
          ),
        },
        {
          path: "instructions",
          element: (
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Instructions />
            </ProtectedRoute>
          ),
        },
        {
          path: "set_questions",
          element: (
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <SetQuestions />
            </ProtectedRoute>
          ),
        },
        {
          path: "check_result",
          element: (
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <CheckResult />
            </ProtectedRoute>
          ),
        },
      ],
    },

    {
      path: "/login",
      element: <LoginPage onLogin={() => setIsLoggedIn(true)} />,
    },

    {
      path: "/take-exam/:examId",
      element: (
        <ProtectedRoute isLoggedIn={isLoggedIn}>
          <TakeExam />
        </ProtectedRoute>
      ),
    },

    {
      path: "/start-exam/:examId",
      element: (
        <ProtectedRoute isLoggedIn={isLoggedIn}>
          <StartExam />
        </ProtectedRoute>
      ),
    },
  ]);

export default router;
