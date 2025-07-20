import { MenuItem } from '@wings-shared/layout';
import { Utilities } from '@wings-shared/core';

/* istanbul ignore next */
export const customerSidebarOptions = (
  defaultOptions: boolean,
  isCustomerOptions?: boolean,
  isDisabled?: boolean
): MenuItem[] => {
  if (isCustomerOptions) {
    return upsertCustomerOptions(isDisabled || false);
  }
  return defaultOptions ? defaultCustomerOptions : operatorOptions(isDisabled || false);
};

export const upsertAssociatedRegistryBackNavLink = (idQuery: string | number, viewMode: string) =>
  `/customer/upsert/${idQuery}/${viewMode}/associated-registries`;

export const defaultCustomerOptions: MenuItem[] = [
  { to: '', title: 'Customer', icon: 'PeopleIcon' },
  { to: 'registry', title: 'Registry', icon: 'AirplaneIcon' },
  { to: 'operator', title: 'Operator', icon: 'HandlerCloneIcon' },
  { to: 'contacts', title: 'Contacts', icon: 'ContactBookIcon' },
  { to: 'communications', title: 'Communications', icon: 'PhoneIcon' },
  { to: 'external-customer-mappings', title: 'External Customer Mappings', icon: 'MappingIcon' },
  { to: 'import-customs-decal', title: 'Import Customs Decal', icon: 'CloudUploadIcon' },
  { to: 'team', title: 'Team', icon: 'PeopleIcon' },
  { to: 'team-members', title: 'Team Members', icon: 'PeopleIcon' },
  { to: 'settings', title: 'Settings', icon: 'SettingIcon' },
];

const upsertCustomerOptions = (isDisabled: boolean): MenuItem[] => [
  { to: '', title: 'General Information', icon: 'InfoIcon' },
  { to: 'associated-registries', title: 'Associated Registries', icon: 'AirplaneIcon', isDisabled },
  { to: 'associated-operators', title: 'Associated Operators', icon: 'HandlerCloneIcon', isDisabled },
  { to: 'associated-bill-to-sites', title: 'Associated Bill To Sites', icon: 'WorldIcon', isDisabled },
  { to: 'associated-special-care', title: 'Associated Special Care/Inform', icon: 'SpecialCareIcon', isDisabled },
  { to: 'associated-office', title: 'Associated Office', icon: 'OfficeIcon', isDisabled },
  { to: 'manage-registries', title: 'Manage Registries', icon: 'AirplaneIcon', isDisabled },
  { to: 'external-customer-mappings', title: 'External Customer Mappings', icon: 'MappingIcon' },
  { to: 'customer-profile', title: 'Customer Profile', icon: 'PeopleIcon' },
];

const operatorOptions = (isDisabled: boolean): MenuItem[] => [
  { to: '', title: 'General Information', icon: 'InfoIcon' },
  { to: 'associated-customers', title: 'Associated Customers', icon: 'PeopleIcon', isDisabled },
];

export const registryOptions = (isDisabled: boolean): MenuItem[] => [
  { to: '', title: 'General Information', icon: 'InfoIcon' },
  { to: 'associated-customers', title: 'Associated Customers', icon: 'PeopleIcon', isDisabled },
  { to: 'customs-decal', title: 'Customs Decal', icon: 'PeopleIcon', isDisabled },
  { to: 'associated-airframe', title: 'Associated Airframe', icon: 'PeopleIcon', isDisabled },
];

export const associatedSiteSidebarOptions = (): MenuItem[] => [
  { to: '', title: 'General Information', icon: 'InfoIcon' },
];

export const associatedRegistrySidebarOptions = (isDisabled?: boolean): MenuItem[] => [
  { to: '', title: 'General Information', icon: 'InfoIcon' },
  { to: 'sites', title: 'Sites', icon: 'WorldIcon', isDisabled },
];

export const customerCommunicationOptions = (isDisabled: boolean): MenuItem[] => [
  { to: '', title: 'General Information', icon: 'InfoIcon' },
];

export const teamSidebarOptions = (isDisabled?: boolean): MenuItem[] => [
  { to: '', title: 'General Information', icon: 'InfoIcon' },
  { to: 'internal-user-assignment', title: 'Internal User Assignment', icon: 'PeopleIcon', isDisabled },
];

export const updateCustomerSidebarOptions = (tabQuery: string): MenuItem[] =>
  Utilities.updateSidebarOptions(defaultCustomerOptions, tabQuery) as MenuItem[];
