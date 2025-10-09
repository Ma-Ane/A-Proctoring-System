import { createBrowserRouter } from "react-router-dom"
import App from "./App";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Portfolio from "./pages/Portfolio";

const router = createBrowserRouter([
    {
        // basic home page
        path: '/',
        element: <App />,

        children: [
            {index: true, element: <HomePage />},
            {path: "/portfolio", element: <Portfolio />}
        ]
    },
    {
        path: '/login',
        element: <LoginPage/>
    }
]);


export default router;