import * as enzyme from 'enzyme';
import { default as Adapter } from 'enzyme-adapter-react-16';
import { environmentVars } from './apps/host/src/environment.vars';
import { ENVIRONMENT_VARS } from '@wings-shared/env-store';

require('mutationobserver-shim');
global.MutationObserver = global.window.MutationObserver;

const localStorageMock = (function () {
  let store: Record<string, any> = {};

  return {
    getItem(key) {
      return store[key] || null;
    },
    setItem(key, value) {
      store[key] = value.toString();
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

global.localStorage = localStorageMock;

/**
 * Set environment variables
 */
environmentVars[ENVIRONMENT_VARS.HIDDEN_MODULES] = 'country,country.continents,airports';
environmentVars[ENVIRONMENT_VARS.OKTA_URL] = 'https://test.test.test';
environmentVars[ENVIRONMENT_VARS.OKTA_CLIENT_ID] = 'testClientId';
environmentVars[ENVIRONMENT_VARS.OKTA_AUTHORIZATION_SERVER_ID] = 'testAuthServerId';

globalThis.wingsEnvironment = environmentVars;

enzyme.configure({ adapter: new Adapter() });
