import { OktaAuthOptions } from '@okta/okta-auth-js';
import { ENVIRONMENT_VARS, EnvironmentVarsStore } from '@wings-shared/env-store';
import { AuthStore } from '@wings-shared/security';

class ConfigureOkta {
  static start(){
    const environmentStore = new EnvironmentVarsStore();
    const config: OktaAuthOptions = {
      issuer: `${environmentStore.getVar(ENVIRONMENT_VARS.OKTA_URL)}/oauth2/${environmentStore.getVar(
        ENVIRONMENT_VARS.OKTA_AUTHORIZATION_SERVER_ID
      )}`,
      clientId: environmentStore.getVar(ENVIRONMENT_VARS.OKTA_CLIENT_ID),
    };
    AuthStore.configure(config);
    AuthStore.configureAgGrid();
  }

}
export default ConfigureOkta;
