// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'; 
// import './index.css'
// import router from './router.jsx'
// import "remixicon/fonts/remixicon.css";

// // for managing all the routes in the website
// import { RouterProvider } from 'react-router-dom'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//       <RouterProvider router={router}/>
//   </StrictMode>,
// )


import React, { StrictMode, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import "./index.css";
import "remixicon/fonts/remixicon.css";

const Root = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("userId")
  );

  return <RouterProvider router={router(isLoggedIn, setIsLoggedIn)} />;
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
