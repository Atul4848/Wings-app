import React, { ElementType } from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import AirportRoot from './App';
import { AirportRootStore } from './Modules/Shared';
import { Layout, ThemeContainer, ErrorBoundaryDefault } from '@wings-shared/layout';
import { ConfigureOkta } from '@wings/shared';

const lifeCycles = singleSpaReact({
  React,
  ReactDOM,
  loadRootComponent: (p: any) => {
    return new Promise<ElementType>((resolve, reject) =>
      resolve(() => {
        ConfigureOkta.start();
        return (
          <ThemeContainer store={AirportRootStore} appName="w-airport">
            <Layout useSideNavigationV2={true}>
              <AirportRoot {...p} />
            </Layout>
          </ThemeContainer>
        );
      })
    );
  },
  errorBoundaryClass: ErrorBoundaryDefault as any,
  errorBoundary: () => (<ErrorBoundaryDefault>Error Happen in Airport App</ErrorBoundaryDefault>) as any,
});

export const { bootstrap, mount, unmount } = lifeCycles;
export default lifeCycles;
