import React, { FC, useEffect } from 'react';
import { reaction } from 'mobx';
import { observer, inject } from 'mobx-react';
import Form, { Field } from 'mobx-react-form';
import { debounceTime, finalize } from 'rxjs/operators';

import { Dialog } from '@uvgo-shared/dialog';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ModalStore } from '@uvgo-shared/modal-keeper';

import { BaseCustomerStore } from '@wings/shared';
import { IAPIPageResponse, SettingsTypeModel, UIStore } from '@wings-shared/core';

import {
  ApplicationsModel,
  AttributesModel,
  CustomerModel,
  CustomersStore,
  RolesModel,
  ServicesModel,
  ServicesStore,
  SiteModel,
  UserProfileRolesModel,
} from '../../../../Shared';
import RoleForm from '../RoleForm/RoleForm';
import { useRoleForm } from '../RoleForm/useRoleForm.hook';

import { useEditRoleClasses } from './EditRole.styles';
import { getApiRole } from '../manageRole.utils';

function canEditRole (
  editableRole: UserProfileRolesModel,
  selectedCustomer: CustomerModel | null,
  selectedSite: SiteModel | null,
  rolesList: UserProfileRolesModel[]
) {
  if (editableRole?.isInternal) return true;

  const existedRoles = rolesList
    .filter(role => role.roleId === editableRole.roleId)
    .filter(role => role.userRoleId !== editableRole.userRoleId);

  return !existedRoles .some(role => {
    return role.customer?.customerId === selectedCustomer?.id
      && role.site?.number === selectedSite?.number;
  });
}

export declare type EditRoleProps = {
  role: UserProfileRolesModel;
  rolesList: UserProfileRolesModel[];
  serviceStore?: ServicesStore;
  customerStore?: CustomersStore;
  registryStore?: BaseCustomerStore;
  onSubmit: (values: any) => void;
};

// eslint-disable-next-line max-len
const EditRole: FC<EditRoleProps> = ({ role: editableRole, rolesList, onSubmit, customerStore, registryStore, serviceStore }: EditRoleProps) => {
  const classes: Record<string,  string> = useEditRoleClasses();
  const form: Form = useRoleForm();

  useEffect(() => {
    const selectedService: ServicesModel = getServiceByRoleName(editableRole.name);
    const selectedRole: RolesModel = getRoleByName(selectedService, editableRole.name);
    const selectedApplication: ApplicationsModel = getApplicationByService(selectedService);

    if (editableRole.customer.customerId) {
      getCustomer(editableRole.customer.customerId);
    }

    const applicationField: Field = form.$('application');
    applicationField.set(selectedApplication);
    applicationField.set('disabled', true);

    setTimeout(() => {
      const serviceField: Field = form.$('service');
      serviceField.set(selectedService);
      serviceField.set('disabled', true);
    });

    setTimeout(() => {
      const roleField: Field = form.$('role');
      selectedRole.userRoleId = editableRole.userRoleId;
      roleField.set(selectedRole);
      roleField.set('disabled', true);
    });

    setTimeout(() => {
      form.$('accessType').set(editableRole.accessType);
      form.$('validFrom').set(editableRole.validFrom);
      form.$('validTo').set(editableRole.validTo);
    });

    fillRegistries();
  }, [ editableRole ]);

  useEffect(() => {
    reaction(
      () => form.values(),
      (values) => {
        const { customer, sites } = values;
        let isValid: boolean = true;

        if (editableRole && customer && sites) {
          isValid = canEditRole(editableRole, customer, sites, rolesList);
        }

        if (!isValid) {
          const roleField: Field = form.$('role');
          roleField.invalidate('This role already exists for the selected customer and site.');
        }
      }
    );
  }, []);

  const fillRegistries = () => {
    const registryName: string = getRegistryName();
    const request = {
      searchCollection: JSON.stringify([
        { propertyName: 'Name', propertyValue: registryName },
      ]),
    };

    UIStore.setPageLoader(true);

    registryStore?.getRegistriesNoSql(request)
      .pipe(
        debounceTime(500),
        finalize(() => UIStore.setPageLoader(false))
      )
      .subscribe((response: IAPIPageResponse<SettingsTypeModel>) => {
        const { results: registries } = response;
        const registryField: Field = form.$('registry');
        const selectedRegistry: SettingsTypeModel = registries
          .find((registry: SettingsTypeModel) => registry.name === registryName);

        registryField.set(selectedRegistry);
        registryField.set('options', registries);
      });
  }

  const getCustomer = (customerId) => {
    UIStore.setPageLoader(true);

    customerStore
      .getCustomer(customerId)
      .pipe(
        finalize(() => UIStore.setPageLoader(false)),
      )
      .subscribe((customer: CustomerModel) => {
        const selectedSite: SiteModel = customer.sites.find(site => site.number === editableRole.site.number);

        form.$('customer').set(customer);
        form.$('sites').set(selectedSite);
        form.$('registry').set(editableRole.registry);
      });
  }

  const getServiceByRoleName = (roleName: string) => {
    if (!serviceStore) return null;
    return serviceStore.services.find(
      (service: ServicesModel) => service.roles.some((role: RolesModel) => role.name === roleName),
    );
  }

  const getApplicationByService = (service: ServicesModel): ApplicationsModel => {
    if (!service) return null;
    return new ApplicationsModel({
      id: service.applicationId,
      name: service.applicationName,
    });
  }

  const getRoleByName = (service: ServicesModel, roleName: string): RolesModel => {
    if (!service) return null;
    return service.roles.find((role: RolesModel) => role.name === roleName);
  }

  const getRegistryName = (): string => {
    const registryAttribute: AttributesModel | undefined = editableRole.attributes
      .find((attribute: AttributesModel) => attribute.type === 'Registry');

    return registryAttribute?.value || '';
  }

  const saveHandler = (values: any) => {
    const apiRole = getApiRole({
      values,
      userRoleId: editableRole.userRoleId,
    });

    onSubmit(apiRole);
  };

  const closeHandler = () => {
    ModalStore.close();
  };

  const cancelHandler = () => {
    ModalStore.close();
  };

  return (
    <Dialog
      title="Edit Role"
      open={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        paperSize: classes.dialogWidth,
        header: classes.headerWrapper,
      }}
      onClose={closeHandler}
      dialogContent={() => (
        <RoleForm onSubmit={saveHandler}>
          <div className={classes.controls}>
            <PrimaryButton
              onClick={cancelHandler}
              variant="text"
            >
              Cancel
            </PrimaryButton>
            <PrimaryButton
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={!form.isValid}
            >
              Update Role
            </PrimaryButton>
          </div>
        </RoleForm>
      )}
    />
  );
};

export default inject((stores: any) => ({
  serviceStore: stores.serviceStore,
  customerStore: stores.customerStore,
  registryStore: stores.registryStore,
}))(observer(EditRole));
