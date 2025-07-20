import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { HubConnectionStore } from '../../Stores';
import { Logger } from '../../Tools';

@observer
class HubConnection extends Component {
  componentDidMount() {
    HubConnectionStore.enable().catch(err => Logger.error(err));
  }

  componentWillUnmount() {
    HubConnectionStore.unsubscribeToEvents();
    HubConnectionStore.disable();
  }

  render() {
    return <></>;
  }
}

export default HubConnection;
