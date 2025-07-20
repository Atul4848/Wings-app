import { Navigate } from 'react-router-dom';
import React from 'react';

export const ProtectedRoute = ({
  hasPermission,
  element,
  redirectPath,
  ...otherProps
}: {
  hasPermission: boolean;
  element: any;
  redirectPath: string;
}) => {
  if (hasPermission) {
    return React.cloneElement(element, otherProps);
  }
  return <Navigate to={redirectPath} />;
};
