import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import './utils/i18n'
import Login from './pages/Login.tsx';
import App from './App.tsx'
import { Admin } from './pages/Admin.tsx';
import UserListPage from './pages/UserList.tsx';


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />
  },
  {
    path: "/admin",
    element: <Admin />,
    children: [
      {
        path: "user",
        element: <UserListPage />,

      },
    ]
  },
  {
    path: "/login",
    element: <Login />
  },
], { basename: import.meta.env.BASE_URL });


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)