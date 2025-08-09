
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/tailwind.css'
import Menu from './app/routes/Menu'
import Play from './app/routes/Play'
import Settings from './app/routes/Settings'

const router = createBrowserRouter([
  { path: '/', element: <Menu /> },
  { path: '/play', element: <Play /> },
  { path: '/settings', element: <Settings /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
