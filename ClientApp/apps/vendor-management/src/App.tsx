import React, { ReactNode } from 'react';
import VendorManagement from './index';

export default class App extends React.Component {
  public render(): ReactNode {
    return <VendorManagement basePath="vendor-management" />;
  }
}
