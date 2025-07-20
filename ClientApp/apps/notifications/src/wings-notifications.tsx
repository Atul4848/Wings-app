import React, { ElementType } from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import Root from './App';
import { ErrorBoundaryDefault, Layout, ThemeContainer } from '@wings-shared/layout';
import NotificationsRootStore from './Modules/Shared/Stores/NotificationsRoot.store';
import { ConfigureOkta } from '@wings/shared';

const lifeCycles = singleSpaReact({
  React,
  ReactDOM,
  loadRootComponent: (p: any) =>
    new Promise<ElementType>((resolve, reject) =>
      resolve(() => {
        ConfigureOkta.start()
        return (
          <ThemeContainer store={NotificationsRootStore} appName="notifications">
            <Layout>
              <Root />
            </Layout>
          </ThemeContainer>
        );
      })
    ),
  errorBoundaryClass: ErrorBoundaryDefault as any,
});

export const { bootstrap, mount, unmount } = lifeCycles;
export default lifeCycles;
