import React, { Component } from 'react';
import { observable, reaction } from 'mobx';
import { Progress } from '@uvgo-shared/progress';
import { finalize, switchMap, take } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { disposeOnUnmount, observer } from 'mobx-react';
import { NavigateFunction } from 'react-router';
import { UIStore, NotFoundPage, withRouter } from '@wings-shared/core';
import { AuthStore } from '../../Stores';
import Login from '../Login/Login';
import { HubConnectionStore, NOTIFICATIONS_EVENTS } from '@wings-shared/security';

type Props = {
  navigate: NavigateFunction;
  children: any;
  useLoginV2?: boolean; // use to enable new login page
};

@observer
class Authorization extends Component<Props> {
  @observable private isLoading: boolean = true;
  @observable private isLoadingPermissions: boolean = false;

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const restoreOriginalUri = (): Promise<void> => {
      const redirectionPath = localStorage.getItem('redirectionPath') || '/';
      // If redirect is not default path then we need to refresh page
      if (redirectionPath !== '/') {
        window.location.href = redirectionPath;
        localStorage.removeItem('redirectionPath');
      } else {
        this.props.navigate('/');
      }
      return Promise.resolve();
    };

    AuthStore.configure({ restoreOriginalUri: restoreOriginalUri });
    AuthStore.getUserAsync()
      .pipe(
        switchMap(() => {
          return AuthStore.isLoginRedirect ? AuthStore.authenticate() : EMPTY;
        }),
        take(1),
        finalize(() => (this.isLoading = false))
      )
      .subscribe();

    disposeOnUnmount(this, [
      reaction(
        () => AuthStore.isAuthenticated,
        isAuthenticated => {
          if (isAuthenticated) {
            this.isLoadingPermissions = true;
            AuthStore.getUserPermissions(() => (this.isLoadingPermissions = false));
          }
        },
        { fireImmediately: true }
      ),
      reaction(
        () => HubConnectionStore.connection,
        connection => {
          if (!connection) return;

          connection.on(NOTIFICATIONS_EVENTS.USER_UPDATED_LISTENER, notification => {
            const userId = notification?.data?.user?.id;

            if (localStorage.debugger) {
              console.log('%cUser updated:', 'color: mediumOrchid; font-size: 13px;', notification);
            }

            if (userId === AuthStore.user?.userGUID) {
              const pascalCasing = x => String(x).charAt(0).toUpperCase() + String(x).slice(1);
              const roles = notification?.data?.user.roles.map(role =>
                Object.keys(role).reduce((t, c) => (t[pascalCasing(c)] = role[c]), {})
              );
              AuthStore.permissions.setDataFromApi({ Roles: roles });
            }
          });
        },
        { fireImmediately: true }
      ),
    ]);
  }

  componentWillUnmount() {
    HubConnectionStore?.connection?.off(NOTIFICATIONS_EVENTS.USER_UPDATED_LISTENER);
  }

  render() {
    if (this.isLoading || this.isLoadingPermissions) {
      return <Progress />;
    }

    if (!AuthStore.isAuthenticated) {
      return (
        <Login
          onLoginClick={() => {
            localStorage.setItem('redirectionPath', location.pathname);
            AuthStore.authenticate().subscribe();
          }}
        />
      );
    }

    if (UIStore.forcePageNotFound) {
      return <NotFoundPage />;
    }

    return this.props.children;
  }
}

export default withRouter(Authorization);
