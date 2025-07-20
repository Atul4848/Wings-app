import React, { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

export function useRouterContext(element: ReactElement) {
  const routes = [
    {
      path: '/',
      element,
    },
  ];
  const router = createMemoryRouter(routes);
  return <RouterProvider router={router} />;
}
