import React from 'react';
import { expect } from 'chai';
import {
  associatedRegistrySidebarOptions,
  associatedSiteSidebarOptions,
  customerCommunicationOptions,
  customerSidebarOptions,
  defaultCustomerOptions,
  registryOptions,
  upsertAssociatedRegistryBackNavLink,
} from '../Components';

describe('upsertAssociatedRegistryBackNavLink', () => {
  it('should have the correct structure and values', () => {
    const idQuery = 1;
    const viewMode = 'edit';
    const expectedOptions = `/customer/upsert/${idQuery}/${viewMode}/associated-registries`;
    expect(upsertAssociatedRegistryBackNavLink('1', 'edit')).to.deep.equal(expectedOptions);
  });
});

describe('customerSidebarOptions', () => {
  it('should return defaultCustomerOptions when isCustomerOptions is false', () => {
    const result = customerSidebarOptions(true, false);

    expect(result).to.deep.equal(defaultCustomerOptions);
  });

  it('should return upsertCustomerOptions when isCustomerOptions is true', () => {
    const isDisabled = true;
    const result = customerSidebarOptions(true, true, isDisabled);
    const expectedOptions = [
      { to: '', title: 'General Information', icon: 'InfoIcon' },
      { to: 'associated-registries', title: 'Associated Registries', icon: 'AirplaneIcon', isDisabled },
      { to: 'associated-operators', title: 'Associated Operators', icon: 'HandlerCloneIcon', isDisabled },
      { to: 'associated-bill-to-sites', title: 'Associated Bill To Sites', icon: 'WorldIcon', isDisabled },
      { to: 'associated-special-care', title: 'Associated Special Care/Inform', icon: 'SpecialCareIcon', isDisabled },
      { to: 'associated-office', title: 'Associated Office', icon: 'OfficeIcon', isDisabled },
      { to: 'manage-registries', title: 'Manage Registries', icon: 'AirplaneIcon', isDisabled },
    ];

    expect(result).to.deep.equal(expectedOptions);
  });

  it('should return defaultCustomerOptions when isCustomerOptions is false and isDisabled is true', () => {
    const isDisabled = true;
    const result = customerSidebarOptions(false, true, isDisabled);
    const expectedOptions = [
      { to: '', title: 'General Information', icon: 'InfoIcon' },
      { to: 'associated-registries', title: 'Associated Registries', icon: 'AirplaneIcon', isDisabled },
      { to: 'associated-operators', title: 'Associated Operators', icon: 'HandlerCloneIcon', isDisabled },
      { to: 'associated-bill-to-sites', title: 'Associated Bill To Sites', icon: 'WorldIcon', isDisabled },
      { to: 'associated-special-care', title: 'Associated Special Care/Inform', icon: 'SpecialCareIcon', isDisabled },
      { to: 'associated-office', title: 'Associated Office', icon: 'OfficeIcon', isDisabled },
      { to: 'manage-registries', title: 'Manage Registries', icon: 'AirplaneIcon', isDisabled },
    ];
    expect(result).to.deep.equal(expectedOptions);
  });

  it('should return operatorOptions when isCustomerOptions is false and isDefaultOptions is false', () => {
    const isDisabled = true;
    const result = customerSidebarOptions(false, false, isDisabled);
    const expectedOptions = [
      { to: '', title: 'General Information', icon: 'InfoIcon' },
      { to: 'associated-customers', title: 'Associated Customers', icon: 'PeopleIcon', isDisabled },
    ];
    expect(result).to.deep.equal(expectedOptions);
  });
});

describe('defaultCustomerOptions', () => {
  it('should have the correct structure and values', () => {
    // Define the expected defaultCustomerOptions array
    const expectedOptions = [
      { to: '', title: 'Customer', icon: 'PeopleIcon' },
      { to: 'registry', title: 'Registry', icon: 'AirplaneIcon' },
      { to: 'operator', title: 'Operator', icon: 'HandlerCloneIcon' },
      { to: 'contacts', title: 'Contacts', icon: 'ContactBookIcon' },
      { to: 'communications', title: 'Communications', icon: 'PhoneIcon' },
      { to: 'import-customs-decal', title: 'Import Customs Decal', icon: 'CloudUploadIcon' },
      { to: 'settings', title: 'Settings', icon: 'SettingIcon'},
    ];

    expect(defaultCustomerOptions).to.deep.equal(expectedOptions);
  });
});

describe('associatedSiteSidebarOptions', () => {
  it('should have the correct structure and values', () => {
    const expectedOptions = [{ to: '', title: 'General Information', icon: 'InfoIcon' }];

    expect(associatedSiteSidebarOptions()).to.deep.equal(expectedOptions);
  });
});

describe('associatedRegistrySidebarOptions', () => {
  it('should have the correct structure and values', () => {
    const isDisabled = true;
    const expectedOptions = [
      { to: '', title: 'General Information', icon: 'InfoIcon' },
      { to: 'sites', title: 'Sites', icon: 'WorldIcon', isDisabled },
    ];

    expect(associatedRegistrySidebarOptions(true)).to.deep.equal(expectedOptions);
  });
});

describe('registryOptions', () => {
  it('should have the correct structure and values', () => {
    const isDisabled = true;
    const expectedOptions = [
      { to: '', title: 'General Information', icon: 'InfoIcon' },
      { to: 'associated-customers', title: 'Associated Customers', icon: 'PeopleIcon', isDisabled },
      { to: 'customs-decal', title: 'Customs Decal', icon: 'PeopleIcon', isDisabled },
    ];

    expect(registryOptions(true)).to.deep.equal(expectedOptions);
  });
});

describe('customerCommunicationOptions', () => {
  it('should have the correct structure and values', () => {
    const isDisabled = true;
    const expectedOptions = [{ to: '', title: 'General Information', icon: 'InfoIcon' }];

    expect(customerCommunicationOptions(true)).to.deep.equal(expectedOptions);
  });
});
