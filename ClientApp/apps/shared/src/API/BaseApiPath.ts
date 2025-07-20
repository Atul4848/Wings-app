import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';

const env = new EnvironmentVarsStore();
export const baseApiPath = {
  noSqlData: `${env.getVar(ENVIRONMENT_VARS.REFERENCE_DATA_BASE_API)}/nosqlreferencedata`,
  timezones: `${env.getVar(ENVIRONMENT_VARS.REFERENCE_DATA_BASE_API)}/geographics`,
  countries: `${env.getVar(ENVIRONMENT_VARS.REFERENCE_DATA_BASE_API)}/countries`,
  airports: `${env.getVar(ENVIRONMENT_VARS.REFERENCE_DATA_BASE_API)}/airports`,
  permits: `${env.getVar(ENVIRONMENT_VARS.REFERENCE_DATA_BASE_API)}/permits`,
  restrictions: `${env.getVar(ENVIRONMENT_VARS.REFERENCE_DATA_BASE_API)}/restrictions`,
  userManagement: `${env.getVar(ENVIRONMENT_VARS.USER_MANAGEMENT_BASE_API)}`,
  customer: `${env.getVar(ENVIRONMENT_VARS.REFERENCE_DATA_BASE_API)}/customer`,
  aircraft: `${env.getVar(ENVIRONMENT_VARS.REFERENCE_DATA_BASE_API)}/aircraft`,
  events: `${env.getVar(ENVIRONMENT_VARS.EVENTS_BASE_API)}`,
  adminPortal: `${env.getVar(ENVIRONMENT_VARS.ADMIN_PORTAL_BASE_API)}`,
  publicApi: `${env.getVar(ENVIRONMENT_VARS.PUBLIC_BASE_API)}`,
  fuelUrl: `${env.getVar(ENVIRONMENT_VARS.FUEL_BASE_URL)}`,
  flightPlanningUrl: `${env.getVar(ENVIRONMENT_VARS.FLIGHT_PLANNING_BASE_URL)}`,
  vendorManagementCoreUrl: `${env.getVar(ENVIRONMENT_VARS.VENDOR_MANAGEMENT_CORE_API)}`,
  vendorManagementNoSqlUrl: `${env.getVar(ENVIRONMENT_VARS.VENDOR_MANAGEMENT_NOSQL_API)}`,
  authorizationApi: `${env.getVar(ENVIRONMENT_VARS.AUTHORIZATION_BASE_API)}`,
};
