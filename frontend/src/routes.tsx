import { RouteObject } from 'react-router-dom';
import { Layout } from '~/layout';
import { Checkout } from '~/features/checkout';
import { About } from '~/features/about';
import { ErrorBoundary, NotFound } from '~/features/core';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/about',
        element: <About />,
      },
      {
        path: '/cart',
        element: <Checkout />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];
