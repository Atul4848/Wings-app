import React, { FC, useEffect, useState } from 'react';
import { finalize, map } from 'rxjs/operators';
import { inject } from 'mobx-react';
import { Checkbox, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { AlertStore } from '@uvgo-shared/alert';

import { SlidePanel } from '@uvgo-shared/slide-panel';
import { FlatIconButton, PrimaryButton } from '@uvgo-shared/buttons';
import { ArrowRightIcon } from '@uvgo-shared/icons';
import { Progress, PROGRESS_TYPES } from '@uvgo-shared/progress';
import { EnvironmentVarsStore, ENVIRONMENT_VARS } from '@wings-shared/env-store';

import {
  CustomerModel,
  CustomersStore,
  RolesModel,
  ServicesModel,
  ServicesStore,
  UserModel,
  UserStore,
} from '../../../Shared';

import { useManageRolesStyles } from './ManageRoles.styles';

export type ManageRolesProps = {
  customerId: string;
  isOpen?: boolean;
  isAllRowsSelected?: boolean;
  onClose: (reload?: boolean) => void;
  servicesStore?: ServicesStore;
  users: UserModel[];
  userStore?: UserStore;
  customerStore?: CustomersStore;
};

const ManageRoles: FC<ManageRolesProps> = ({
  isOpen,
  onClose,
  servicesStore,
  users,
  userStore,
  customerStore,
  customerId,
  isAllRowsSelected,
}: ManageRolesProps) => {
  const classes: Record<string, string> = useManageRolesStyles();
  const [ isLoading, setIsLoading ] = useState<boolean>(false);
  const [ services, setServices ] = useState<ServicesModel[]>([]);
  const [ selectedService, setSelectedService ] = useState<ServicesModel | null>(null);
  const [ selectedRoles, setSelectedRoles ] = useState<[RolesModel]>([]);
  const [ customer, setCustomer ] = useState<CustomerModel>(null);

  useEffect(() => {
    setIsLoading(true);

    servicesStore
      .getServices()
      .pipe(
        map((response: any) => response.results),
        finalize(() => setIsLoading(false)),
      )
      .subscribe(servicesFromApi => setServices(servicesFromApi));
  }, []);

  useEffect(() => setSelectedRoles([]), [ selectedService ]);

  useEffect(() => {
    customerStore
      .getCustomer(customerId)
      .subscribe((customerResponse: CustomerModel) => setCustomer(customerResponse));
  }, [ customerId ]);

  const assignHandler = () => {
    setIsLoading(true);

    const requestItems = selectedRoles.map((role: RolesModel) => {
      return {
        RoleId: role.roleId,
        AssignToAllUsers: isAllRowsSelected,
        ...(!isAllRowsSelected && {
          UserGuids: users.map(user => user.id),
        }),        
        CustomerId: customerId,
        CustomerSite: customerStore?.selectedSiteNumber
      };
    });

    userStore.assignRoles(requestItems).subscribe({
      next: () => AlertStore.info('Roles assigned successfully!'),
      error: error => {AlertStore.critical(error.message)},
      complete: () => onClose(true),
    });
  }

  const unassignHandler = () => {
    setIsLoading(true);

    const requestItems = selectedRoles.map((role: RolesModel) => {
      return {
        RoleId: role.roleId,
        CustomerId: customerId,
        CustomerSite: customerStore?.selectedSiteNumber,
        UserGuids: users.map(user => user.id),
      };
    });

    userStore.unassignRoles(requestItems).subscribe({
      next: () => AlertStore.info('Roles unassigned successfully'),
      error: () => AlertStore.critical('Failed to unassign roles!'),
      complete: () => onClose(true),
    });
  }

  const isRoleSelected = (role: RolesModel) => selectedRoles.some(selectedRole => selectedRole.roleId === role.roleId);

  const handleRoleSelection = (role: RolesModel) => {
    const newRoles = [ ...selectedRoles ];
    const roleIndex = newRoles.findIndex(selectedRole => selectedRole.roleId === role.roleId);

    if (~roleIndex) {
      newRoles.splice(roleIndex, 1);
    } else {
      newRoles.push(role);
    }

    setSelectedRoles(newRoles);
  }

  return (
    <SlidePanel
      panelKey="um-manage-roles"
      isExpanded={isOpen}
      hasBackdrop={true}
    >
      <div className={classes.root}>
        <div className={classes.toolbar}>
          <FlatIconButton onClick={onClose}>
            <ArrowRightIcon size="x-large"/>
          </FlatIconButton>
          <div>
            <PrimaryButton
              variant="contained"
              size="large"
              color="primary"
              disabled={!selectedRoles.length || isLoading}
              onClick={unassignHandler}
            >
              Unassign
            </PrimaryButton>
            <PrimaryButton
              variant="contained"
              size="large"
              color="primary"
              disabled={!selectedRoles.length || isLoading}
              onClick={assignHandler}
            >
              Assign
            </PrimaryButton>
          </div>
        </div>
        <div className={classes.heading}>
          Manage Roles
        </div>
        <div className={classes.content}>
          <FormControl variant="outlined" className="--large" required={true}>
            <InputLabel>App Service</InputLabel>
            <Select
              defaultValue="none"
              value={selectedService}
              renderValue={service => service.displayName}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 200,
                  },
                },
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'center',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'center',
                },
                getContentAnchorEl: null,
              }}
            >
              <MenuItem disabled value="none" className="--no-selection">
                Select an option
              </MenuItem>
              {
                services.map(service => (
                  <MenuItem
                    key={service.applicationId}
                    onClick={() => setSelectedService(service)}
                    selected={service.applicationId === selectedService?.applicationId}
                  >
                    {service.displayName}
                  </MenuItem>
                ))
              }
            </Select>
          </FormControl>

          {
            selectedService && (
              <div>
                <FormControl variant="outlined" className="--large" required={true}>
                  <InputLabel>Roles</InputLabel>
                  <Select
                    multiple
                    value={selectedRoles}
                    renderValue={roles => roles.map(role => role.name).join(', ') || 'Select Options'}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 200,
                        },
                      },
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'center',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'center',
                      },
                      getContentAnchorEl: null,
                    }}
                  >
                    <MenuItem disabled value="none" className="--no-selection">
                      Select Options
                    </MenuItem>
                    {
                      selectedService.roles.map(role => (
                        <MenuItem key={role.roleId} onClick={() => handleRoleSelection(role)}>
                          <Checkbox checked={isRoleSelected(role)}/>
                          <span>{role.name}</span>
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </div>
            )
          }
          {
            isLoading && (
              <Progress type={PROGRESS_TYPES.UVGO} />
            )
          }
        </div>
      </div>
    </SlidePanel>
  );
};

export default inject((stores: any) => ({
  servicesStore: stores.serviceStore,
  userStore: stores.userStore,
  customerStore: stores.customerStore,
}))(ManageRoles);
