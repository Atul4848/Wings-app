import React, { ElementType } from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import CustomerRoot from './App';
import { ErrorBoundaryDefault, Layout, ThemeContainer } from '@wings-shared/layout';
import { ConfigureOkta } from '@wings/shared';
import { CustomerRootStore } from './Modules/Shared/Stores';

const lifeCycles = singleSpaReact({
  React,
  ReactDOM,
  loadRootComponent: (p: any) =>
    new Promise<ElementType>((resolve, reject) =>
      resolve(() => {
        ConfigureOkta.start();
        return (
          <ThemeContainer store={CustomerRootStore} appName="customer">
            <Layout useSideNavigationV2={true}>
              <CustomerRoot {...p} />
            </Layout>
          </ThemeContainer>
        );
      })
    ),
  errorBoundaryClass: ErrorBoundaryDefault as any,
});

export const { bootstrap, mount, unmount } = lifeCycles;
export default lifeCycles;
