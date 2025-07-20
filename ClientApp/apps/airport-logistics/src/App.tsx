import React, { ReactNode } from 'react';
import AirportLogistics from './index';

export default class App extends React.Component {
  public render(): ReactNode {
    return <AirportLogistics basePath="airport-logistics" />;
  }
}
