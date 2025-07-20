import React, { ElementType } from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import Root from './App';
import { CountryRootStore } from './Modules/Shared';
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
          <ThemeContainer store={CountryRootStore} appName="countries">
            <Layout useSideNavigationV2={true}>
              <Root />
            </Layout>
          </ThemeContainer>
        );
      })
    );
  },
  errorBoundaryClass: ErrorBoundaryDefault as any,
  errorBoundary: () => (<ErrorBoundaryDefault>Error Happen in Country App</ErrorBoundaryDefault>) as any,
});

export const { bootstrap, mount, unmount } = lifeCycles;
export default lifeCycles;
