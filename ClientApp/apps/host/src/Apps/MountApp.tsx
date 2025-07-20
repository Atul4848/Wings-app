import { observer } from 'mobx-react';
import React, { useEffect, useState, useRef } from 'react';
import * as singleSpa from 'single-spa';

import { Progress, PROGRESS_TYPES } from '@uvgo-shared/progress';
import { UIStore } from '@wings-shared/core';
import { ErrorFallbackDefault } from '@wings-shared/layout';

export type IMountApp = {
  path: string;
  name: string;
  url?: string;
  hideApp?: boolean;
};

type Props = {
  app: IMountApp;
};

declare let System: any;

const MountApp = ({ app, ...props }: Props) => {
  const [ isLoading, setIsLoading ] = useState(true);
  const [ message, setErrorState ] = useState('');

  useEffect(() => {
    const apps = singleSpa.getAppNames();
    // If App Already Registered then wait for unmount then mount again
    if (apps.includes(app.name)) {
      Promise.all([
        singleSpa.unloadApplication(app.name, { waitForUnmount: true }),
        singleSpa.unregisterApplication(app.name),
      ]).then(() => registerApp());
    } else {
      registerApp();
    }

    return () => {
      const apps = singleSpa.getAppNames();
      if (apps.includes(app.name)) {
        singleSpa.unloadApplication(app.name, { waitForUnmount: true });
        singleSpa.unregisterApplication(app.name);
      }
    };
  }, []);

  const registerApp = () => {
    try {
      System.import(app.name)
        .then(mainApp => {
          singleSpa.registerApplication({
            name: app.name,
            app: mainApp.default,
            activeWhen: [ app.path ],
            customProps: {
              domElementGetter: () => document.getElementById(`${app.path}-mount`),
              ...props,
            },
          });
          singleSpa.start();
          setIsLoading(false);
        })
        .catch(e => {
          setIsLoading(false);
          setErrorState(`Unable to load url ${app.url} make sure deployment process is completed.`);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {isLoading && <Progress type={PROGRESS_TYPES.LINEAR} />}
      <div
        id={`${app.path}-mount`}
        style={{ width: '100%', overflow: 'hidden', height: `calc(100% - ${UIStore.isHeaderExpanded ? 140 : 70}px)` }}
      />
      {message && <ErrorFallbackDefault error={{ message, name: '' }} />}
    </>
  );
};

export default observer(MountApp);
