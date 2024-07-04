import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./Layout";
import Users from "./Users/Users";
import ErrorPage from "../components/Error";
import Mails from "./SendMail/Mails";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/nguoi-dung",
        element: <Users />,
      },
      {
        path: "/mail",
        element: <Mails />,
      },
    ],
  },
  {
    path: "*",
    element: <ErrorPage />,
  },
]);

function RoutesPage() {
  return (
    <div>
      <React.Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={router} />
      </React.Suspense>
    </div>
  );
}

export default RoutesPage;
