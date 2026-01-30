import { createBrowserRouter } from "react-router-dom"
import App from "./App";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Portfolio from "./pages/Portfolio";
import Result from "./pages/Result";
import Instructions from "./pages/Instructions";
import TakeExam from "./pages/TakeExam";
import StartExam from "./pages/StartExam";

const router = createBrowserRouter([
    {
        // basic home page
        path: '/',
        element: <App />,

        children: [
            {index: true, element: <HomePage />},
            {path: "/portfolio", element: <Portfolio />},
            {path: '/results', element: <Result />},
            {path: '/instructions', element: <Instructions />}
        ]
    },

    {
        path: '/login',
        element: <LoginPage/>
    },

    {
        path: "/take-exam/:examId",
        element: <TakeExam/>
    },
    {
        path: '/start-exam/:examId',
        element: <StartExam />
    }
]);


export default router;