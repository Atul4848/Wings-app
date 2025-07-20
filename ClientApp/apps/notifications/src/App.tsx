import React, { ReactNode } from 'react';
import Notifications from './index';

export default class App extends React.Component {
  public render(): ReactNode {
    return <Notifications basePath="notifications" />;
  }
}
