import React, { FC, useEffect } from 'react';
import { reaction } from 'mobx';
import { observer } from 'mobx-react';
import Form, { Field } from 'mobx-react-form';

import { Dialog } from '@uvgo-shared/dialog';
import { PrimaryButton } from '@uvgo-shared/buttons';
import { ModalStore } from '@uvgo-shared/modal-keeper';

import RoleForm from '../RoleForm/RoleForm';
import { CustomerModel, RolesModel, SiteModel, UserProfileRolesModel } from '../../../../Shared';
import { ROLE_ACCESS_TYPE } from '../../../../Shared/Enums';
import { useRoleForm } from '../RoleForm/useRoleForm.hook';

import { useAddRoleClasses } from './AddRole.styles';
import { getApiRole } from '../manageRole.utils';

function canAddRole (
  selectedRole: RolesModel | null,
  selectedCustomer: CustomerModel | null,
  selectedSite: SiteModel | null,
  rolesList: UserProfileRolesModel[]
)  {
  const existedRoles = rolesList?.filter(role => role.roleId === selectedRole?.roleId);

  if (!selectedRole?.roleId) {
    return true;
  }

  if (selectedRole?.isExternal && (!selectedCustomer?.id || !selectedSite?.number)) {
    return true;
  }

  if (selectedRole?.isInternal && existedRoles.length) {
    return false;
  }

  if (selectedRole?.isExternal && existedRoles.length) {
    const roleExists = existedRoles.some(role => {
      return role.customer?.customerId === selectedCustomer?.id && role.site?.number === selectedSite?.number;
    });

    return !roleExists;
  }

  return true;
}

export declare type AddRoleProps = {
  rolesList: UserProfileRolesModel[];
  onSubmit: (values: any) => void;
};

const AddRole: FC<AddRoleProps> = ({ rolesList, onSubmit }: AddRoleProps) => {
  const classes: Record<string,  string> = useAddRoleClasses();
  const form: Form = useRoleForm();

  useEffect(() => {
    const disposer = reaction(
      () => form.values(),
      (values) => {
        const { role, customer, sites } = values;
        let isValid: boolean = true;

        if (role && customer && sites) {
          isValid = canAddRole(role, customer, sites, rolesList);
        }

        if (!isValid) {
          const roleField: Field = form.$('role');
          roleField.invalidate('This role already exists for the selected customer and site.');
        }
      }
    );

    return () => disposer();
  }, []);

  const saveHandler = (values: any) => {
    const apiRole = getApiRole({ values, userRoleId: null });
    onSubmit(apiRole);
  }

  const closeHandler = () => {
    ModalStore.close();
  }

  const cancelHandler = () => {
    ModalStore.close();
  }

  return (
    <Dialog
      title="Add New Role"
      open={true}
      onClose={closeHandler}
      disableBackdropClick={true}
      disableEscapeKeyDown={true}
      classes={{
        dialogWrapper: classes.modalRoot,
        paperSize: classes.dialogWidth,
        header: classes.headerWrapper,
      }}
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
              Add Role
            </PrimaryButton>
          </div>
        </RoleForm>
      )}
    />
  );
};

export default observer(AddRole);