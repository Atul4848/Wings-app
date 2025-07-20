import React from 'react';
import { Route as RouterDomRoute, Navigate } from 'react-router-dom';
import { PathRouteProps } from 'react-router';

interface Props extends PathRouteProps {
  hasPermission?: boolean;
  redirectPath?: string;
}

/* istanbul ignore next */
const Route = ({ hasPermission = true, path, element, redirectPath, ...rest }: Props) => {
  if (hasPermission) {
    return <RouterDomRoute path={path} element={React.cloneElement(element as any, rest)} />;
  }
  return <Navigate to={redirectPath} />;
};

export default Route;
