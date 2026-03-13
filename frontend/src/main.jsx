import React, { StrictMode, useState } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import "./index.css";
import "remixicon/fonts/remixicon.css";
import { UserProvider, UserContext } from "./UserContext";
import { useContext } from "react";

const Root = () => {
  const { user, loading } = useContext(UserContext);

  if (loading) {
    return <div>Loading...</div>;
  }

  const isLoggedIn = !!user;

  return (
    <RouterProvider
      router={router(isLoggedIn)}
      key={isLoggedIn}
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