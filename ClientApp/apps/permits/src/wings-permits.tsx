import React, { ElementType } from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import { PermitRootStore } from './Modules/Shared/Stores';
import { ErrorBoundaryDefault, Layout, ThemeContainer } from '@wings-shared/layout';
import Root from './App';
import { ConfigureOkta } from '@wings/shared';

const lifeCycles = singleSpaReact({
  React,
  ReactDOM,
  loadRootComponent: (p: any) =>
    new Promise<ElementType>((resolve, reject) =>
      resolve(() => {
        ConfigureOkta.start()
        return (
          <ThemeContainer store={PermitRootStore} appName="Permits">
            <Layout useSideNavigationV2={true}>
              <Root />
            </Layout>
          </ThemeContainer>
        );
      })
    ),
  errorBoundaryClass: ErrorBoundaryDefault,
});

export const { bootstrap, mount, unmount } = lifeCycles;
export default lifeCycles;
