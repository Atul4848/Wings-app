import React, { Component, ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { ErrorFallbackDefault } from './components/index';

interface IProps {
  children: ReactNode;
}

/**
 * @description React-Error-Boundary instance initiated with ErrorFallbackDefault UI
 * @param{children} ReactNode: the wrapped component
 */

class ErrorBoundaryDefault extends Component<IProps> {
  public render() {
    return <ErrorBoundary FallbackComponent={ErrorFallbackDefault}>{this.props.children}</ErrorBoundary>;
  }
}

export default ErrorBoundaryDefault;
