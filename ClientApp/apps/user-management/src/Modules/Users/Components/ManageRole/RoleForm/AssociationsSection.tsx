import React from 'react';
import { inject, observer } from 'mobx-react';
import Form, { Field } from 'mobx-react-form';
import { debounceTime, finalize } from 'rxjs/operators';

import { BaseCustomerStore } from '@wings/shared';
import { AutoCompleteControl } from '@wings-shared/form-controls';
import { IAPIPageResponse, SettingsTypeModel, UIStore } from '@wings-shared/core';
import { CustomerModel, CustomersStore, RolesModel, SiteModel } from '../../../../Shared';

import { useRoleFormClasses } from './RoleForm.styles';
import { useRoleForm } from './useRoleForm.hook';

export declare type AssociationsSectionProps = {
  customerStore?: CustomersStore,
  registryStore?: BaseCustomerStore,
};

// eslint-disable-next-line max-len
const AssociationsSection: React.FC<AssociationsSectionProps> = ({ customerStore, registryStore }: AssociationsSectionProps) => {
  const classes: Record<string,  string> = useRoleFormClasses();
  const form: Form = useRoleForm();
  const role: RolesModel = form.$('role').value;
  const customerField: Field = form.$('customer');
  const registryField: Field = form.$('registry');
  const sitesField: Field = form.$('sites');

  const searchCustomers = (searchValue: string) => {
    const request = {
      searchCollection: searchValue,
      status: 'ACTIVE',
    };

    UIStore.setPageLoader(true);

    customerStore
      .getCustomers(request)
      .pipe(
        debounceTime(500),
        finalize(() => UIStore.setPageLoader(false)),
      )
      .subscribe((response: IAPIPageResponse<CustomerModel>) => customerField.set('options', response.results));
  }

  const searchRegistries = (searchValue: string) => {
    const request = {
      searchCollection: JSON.stringify([
        { propertyName: 'Name', propertyValue: searchValue },
      ]),
    };

    UIStore.setPageLoader(true);

    registryStore?.getRegistriesNoSql(request)
      .pipe(
        debounceTime(500),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((users: IAPIPageResponse<SettingsTypeModel>) => registryField.set('options', users.results));
  }

  if (!role || role.isInternal || !role.isUvgoAppRole) return null;

  return (
    <div className={classes.section}>
      <div className={classes.sectionTitle}>Associations</div>
      <div className={classes.sectionContent}>
        <div className={classes.sectionRow}>
          <div className={classes.sectionColumn}>
            <AutoCompleteControl
              customErrorMessage={customerField.error}
              field={customerField}
              onClear={() => customerField.set(null)}
              onDropDownChange={(option: CustomerModel) => customerField.set(option)}
              onSearch={searchCustomers}
              options={customerField.options}
              placeHolder="Search Customer"
              value={customerField.value}
            />
          </div>
          <div className={classes.sectionColumn}>
            <AutoCompleteControl
              customErrorMessage={sitesField.error}
              field={sitesField}
              onDropDownChange={(option: SiteModel) => sitesField.set(option)}
              options={customerField.value?.sites || []}
              placeHolder="Search Sites"
              value={sitesField.value}
            />
          </div>
        </div>
        <div className={classes.sectionRow}>
          <div className={classes.sectionColumn}>
            <AutoCompleteControl
              customErrorMessage={registryField.error}
              field={registryField}
              onDropDownChange={(option: SettingsTypeModel) => registryField.set(option)}
              onSearch={searchRegistries}
              options={registryField.options}
              placeHolder="Search Registry"
              value={registryField.value}
            />
          </div>
          <div className={classes.sectionColumn}/>
        </div>
      </div>
    </div>
  );
}

export default inject((stores: any) => ({
  customerStore: stores.customerStore,
  registryStore: stores.registryStore,
}))(observer(AssociationsSection));
