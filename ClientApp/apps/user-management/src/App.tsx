import React, { ReactNode } from 'react';
import UserManagement from './index';
import { HubConnectionStore, NOTIFICATIONS_EVENTS, AuthStore } from '@wings-shared/security';
import { AlertStore } from '@uvgo-shared/alert';
import { UserStore } from './Modules';
import { inject } from 'mobx-react';

type Props = {
  userStore?: UserStore;
};

@inject('userStore')
export default class App extends React.Component<Props> {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    setTimeout(() => {
      this.subscribeToNotifications();
      this.subscribeToUserUpdated();
    }, 2000);
  }
  
  componentWillUnmount() {
    HubConnectionStore.connection?.off(NOTIFICATIONS_EVENTS.JOB_STATUS_NOTIFICATION);
    HubConnectionStore.connection?.off(NOTIFICATIONS_EVENTS.USER_UPDATED_LISTENER);
  }

  /* istanbul ignore next */
  private subscribeToNotifications(): void {
    HubConnectionStore.connection?.on(NOTIFICATIONS_EVENTS.JOB_STATUS_NOTIFICATION, notification => {
      if (notification?.data) {
        if (notification?.data?.isSuccess) {
          AlertStore.info(notification?.data?.message);
        }else {
          AlertStore.critical(notification?.data?.message);
        }
      }
    });
  }

  /* istanbul ignore next */
  private subscribeToUserUpdated(): void {
    HubConnectionStore.connection?.on(NOTIFICATIONS_EVENTS.USER_UPDATED_LISTENER, notification => {
      if (notification?.data && AuthStore.user?.userGUID != notification?.data?.triggeredByUserGuid) {
        AlertStore.info(`User ${notification?.data?.user.username} updated successfully!`);
      }
      this.props.userStore?.updatedUser(notification?.data?.user);
    });
  }

  public render(): ReactNode {
    return <UserManagement basePath="user-management" />;
  }
}
