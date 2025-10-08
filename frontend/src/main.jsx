import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'; 
import './index.css'
import router from './router.jsx'
import "remixicon/fonts/remixicon.css";

// for managing all the routes in the website
import { RouterProvider } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <RouterProvider router={router}/>
  </StrictMode>,
)
