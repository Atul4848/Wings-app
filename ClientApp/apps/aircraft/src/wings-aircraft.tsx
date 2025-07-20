import React, { ElementType } from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import { AircraftModuleSecurity, AircraftRootStore, FlightPlanStore } from './Modules/Shared';
import { ErrorBoundaryDefault, ThemeContainer, Layout } from '@wings-shared/layout';
import Root from './App';
import { AuthStore, SettingsModuleSecurity } from '@wings-shared/security';
import { ConfigureOkta } from '@wings/shared';

const lifeCycles = singleSpaReact({
  React,
  ReactDOM,
  loadRootComponent: (p: any) =>
    new Promise<ElementType>((resolve, reject) =>
      resolve(() => {
        ConfigureOkta.start();
        return (
          <ThemeContainer store={{ ...AircraftRootStore, ...FlightPlanStore }} appName="aircraft">
            <Layout useSideNavigationV2={true}>
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
