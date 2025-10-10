import { createBrowserRouter } from "react-router-dom"
import App from "./App";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Portfolio from "./pages/Portfolio";
import Result from "./pages/Result";

const router = createBrowserRouter([
    {
        // basic home page
        path: '/',
        element: <App />,

        children: [
            {index: true, element: <HomePage />},
            {path: "/portfolio", element: <Portfolio />},
            {path: '/results', element: <Result />}
        ]
    },
    {
        path: '/login',
        element: <LoginPage/>
    }
]);


export default router;