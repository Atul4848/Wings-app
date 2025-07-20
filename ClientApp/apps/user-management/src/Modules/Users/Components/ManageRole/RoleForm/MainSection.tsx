import React, { useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import Form, { Field } from 'mobx-react-form';

import { AutoCompleteControl } from '@wings-shared/form-controls';
import { useRoleForm } from './useRoleForm.hook';
import {
  ApplicationsModel,
  ApplicationsStore,
  RolesModel,
  ServicesModel,
  ServicesStore,
  UserResponseModel,
  UserStore,
} from '../../../../Shared';

import { useRoleFormClasses } from './RoleForm.styles';

function groupServicesByApplicationId(services: ServicesModel[], user: UserResponseModel): GroupedServices {
  const { isQA, isInternal } = user;

  const filteredServices = isQA || isInternal
    ? services.filter(service => service.applicationId !== 'uvx-app')
    : services.filter(service => service.applicationId !== 'uvx-app' && service.enabled);

  return filteredServices.reduce((acc, service) => {
    const { applicationId } = service;

    if (!acc[applicationId]) {
      acc[applicationId] = [];
    }

    acc[applicationId].push(service);
    return acc;
  }, {});
}

export declare type MainsSectionProps = {
  applicationStore?: ApplicationsStore;
  serviceStore?: ServicesStore;
  userStore?: UserStore;
};

type GroupedServices = Record<string, ServicesModel[]>;

// eslint-disable-next-line max-len
const MainsSection: React.FC<MainsSectionProps> = ({ applicationStore, serviceStore, userStore }: MainsSectionProps) => {
  const classes: Record<string,  string> = useRoleFormClasses();
  const form: Form = useRoleForm();
  const [ services, setServices ] = React.useState<GroupedServices>([]);

  const applicationField: Field = form.$('application');
  const serviceField: Field = form.$('service');
  const roleField: Field = form.$('role');

  useEffect(() => {
    userStore
      .getUserData(userStore.oktaUserId)
      .subscribe((user: UserResponseModel) => {
        setServices(groupServicesByApplicationId(serviceStore.services, user));
      });
  }, []);

  return (
    <div className={classes.section}>
      <div className={classes.sectionContent}>
        <div className={classes.sectionRow}>
          <AutoCompleteControl
            field={applicationField}
            value={applicationField.value}
            onDropDownChange={(option: ApplicationsModel) => applicationField.set(option)}
            disabled={applicationField.disabled}
            options={applicationStore.applications}
            placeHolder="Search Application Name"
          />
        </div>
        <div className={classes.sectionRow}>
          <div className={classes.sectionColumn}>
            <AutoCompleteControl
              freeSolo={false}
              field={serviceField}
              value={serviceField.value}
              onDropDownChange={(option: ServicesModel) => serviceField.set(option)}
              disabled={!applicationField.value || serviceField.disabled}
              placeHolder="Search App Services"
              options={services[applicationField.value.id] || []}
            />
          </div>
          <div className={classes.sectionColumn}>
            <AutoCompleteControl
              freeSolo={false}
              field={roleField}
              value={roleField.value}
              onDropDownChange={(option: RolesModel) => roleField.set(option)}
              placeHolder="Select Role"
              disabled={!serviceField.value || roleField.disabled}
              options={serviceField.value?.roles || []}
              customErrorMessage={roleField.isDirty && roleField.error}
              customRenderOption={(option: RolesModel) => {
                return (
                  <>
                    <div className={classes.roleOptionHeader}>
                      <span className={classes.roleOptionName}>
                        {option.name}
                      </span>
                      <span className={classes.roleOptionType}>
                        {option.isExternal ? 'external' : 'internal'}
                      </span>
                    </div>
                    <div className={classes.roleOptionDescription}>
                      {option.description}
                    </div>
                  </>
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default inject((stores: any) => ({
  applicationStore: stores.applicationStore,
  serviceStore: stores.serviceStore,
  userStore: stores.userStore,
}))(observer(MainsSection));
