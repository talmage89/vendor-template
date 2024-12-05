import * as React from "react";
import { createBrowserRouter, RouteObject, RouterProvider } from "react-router-dom";

import { Spinner } from "~/components";
import { useAuthStore, useToast } from "~/hooks";
import { NotFound, ErrorBoundary } from "~/features/core";
import { Layout } from "~/layout";

import { authenticatedRoutes } from "./authenticated";
import { commonRoutes } from "./common";
import { unauthenticatedRoutes } from "./unauthenticated";

const routeWrapper = (children: RouteObject[]): RouteObject[] => [
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      ...commonRoutes,
      ...children,
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

export const Router = () => {
  const [loading, setLoading] = React.useState(true);

  const { user, getUser } = useAuthStore();
  const toaster = useToast();

  React.useEffect(() => {
    setLoading(true);
    getUser()
      .catch((res) => {
        res.status === 401 && res.code !== "token_missing" && toaster.error("Please log in again.");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="Layout">
        <div className="flex flex-1 justify-center items-center mb-8">
          <Spinner />
        </div>
      </div>
    );
  }

  const routes = routeWrapper(user ? authenticatedRoutes : unauthenticatedRoutes);
  return <RouterProvider router={createBrowserRouter(routes)} />;
};
