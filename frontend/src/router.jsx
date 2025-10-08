import { createBrowserRouter } from "react-router-dom"
import App from "./App";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

const router = createBrowserRouter([
    {
        // basic home page
        path: '/',
        element: <App />,

        children: [
            {index: true, element: <HomePage />}
        ]
    },
    {
        path: '/login',
        element: <LoginPage/>
    }
]);


export default router;