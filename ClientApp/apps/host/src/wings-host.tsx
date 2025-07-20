import React, { StrictMode } from 'react';
import * as ReactDOMClient from 'react-dom/client';
import { EnvironmentVarsStore } from '@wings-shared/env-store';
import { environmentVars } from './environment.vars';
import { ConfigureOkta } from '@wings/shared';
import App from './app';

// Store Env Variables
new Promise<void>((resolve, reject) => {
  const environmentStore = new EnvironmentVarsStore();
  environmentStore.setVars(environmentVars);
  ConfigureOkta.start()
  const container = document.getElementById('root');
  const root = ReactDOMClient.createRoot(container);
  root.render(<App />);
  resolve();
});
