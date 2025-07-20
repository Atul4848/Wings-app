import { AlertStore, ALERT_TYPES,IAlert } from '@uvgo-shared/alert';
import { ENVIRONMENT_VARS, EnvironmentVarsStore } from '@wings-shared/env-store';

const env = new EnvironmentVarsStore();
export const vendorManagementHeaders =  {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.VENDOR_MANAGEMENT_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};


export const refDataHeaders = {
  'Ocp-Apim-Subscription-Key': env.getVar(ENVIRONMENT_VARS.OCP_APIM_SUBSCRIPTION_KEY),
  'Ocp-Apim-Trace': true,
};


export class BaseStore {
  static showAlert(message:string,alertId:number):void{
    const id = `${alertId}`;
    const alert: IAlert = {
      id,
      message,
      type:ALERT_TYPES.IMPORTANT,
      hideAfter:5000
    };
    AlertStore.removeAlert(id);
    AlertStore.showAlert(alert);
  }
}
