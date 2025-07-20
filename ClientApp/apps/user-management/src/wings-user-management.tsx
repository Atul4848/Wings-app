import React, { ElementType } from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import { UserRootStore } from './Modules/Shared';
import { ErrorBoundaryDefault, Layout, ThemeContainer } from '@wings-shared/layout';
import UmRoot from './App';
import { ConfigureOkta } from '@wings/shared';
import { AuthStore } from '@wings-shared/security';

const lifeCycles = singleSpaReact({
  React,
  ReactDOM,
  loadRootComponent: (p: any) =>
    new Promise<ElementType>((resolve, reject) => {
      ConfigureOkta.start();
      AuthStore.configureAgGrid();
      resolve(() => (
        <ThemeContainer store={UserRootStore} appName="user-management">
          <Layout>
            <UmRoot />
          </Layout>
        </ThemeContainer>
      ));
    }),
  errorBoundaryClass: ErrorBoundaryDefault,
});

export const { bootstrap, mount, unmount } = lifeCycles;
export default lifeCycles;
