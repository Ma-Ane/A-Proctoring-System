import React, { StrictMode, useState } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import "./index.css";
import "remixicon/fonts/remixicon.css";
import { UserProvider } from "./UserContext";

const Root = () => {
  // React state to track login status
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <RouterProvider
      router={router(isLoggedIn, setIsLoggedIn)}
    />
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <Root />
    </UserProvider>
  </StrictMode>
);