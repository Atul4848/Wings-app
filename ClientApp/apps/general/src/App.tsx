import React, { ReactNode } from 'react';
import General from './index';

export default class App extends React.Component {
  public render(): ReactNode {
    return <General basePath="general" />;
  }
}
