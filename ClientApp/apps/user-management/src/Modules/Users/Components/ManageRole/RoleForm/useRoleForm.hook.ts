import { useEffect } from 'react';
import { reaction } from 'mobx';
import Form, { Field } from 'mobx-react-form';

import { getFormValidation } from '@wings-shared/core';
import { ROLE_ACCESS_TYPE } from '../../../../Shared/Enums';
import { RolesModel } from '../../../../Shared';

export const fields = [
  {
    name: 'application',
    label: 'Applications Name',
    rules: 'required',
    value: null,
  },
  {
    name: 'service',
    label: 'App Service',
    rules: 'required',
    value: null,
  },
  {
    name: 'role',
    label: 'Role',
    rules: 'required',
    value: null,
  },
  {
    name: 'customer',
    label: 'Customer',
    options: [],
    value: null,
  },
  {
    name: 'registry',
    label: 'Registry',
    options: [],
    value: null,
  },
  {
    name: 'sites',
    label: 'Sites',
    options: [],
    value: null,
  },
  {
    name: 'accessType',
    label: 'Access Type',
    value: ROLE_ACCESS_TYPE.STANDARD,
  },
  {
    name: 'validFrom',
    label: 'Valid From',
    placeholder: 'Select date',
    value: null,
  },
  {
    name: 'validTo',
    label: 'Valid To',
    placeholder: 'Select date',
    value: null,
  },
];

const resetFieldsExcept = (form: Form, fieldsToKeep: string[]) => {
  form.each((field: Field) => {
    if (!fieldsToKeep.includes(field.name)) {
      field.reset();
      field.set('options', []);
    }
  });
};

const form = getFormValidation(fields, {
  successHandler: (form: Form) => {
    const role: RolesModel = form.$('role').value;
    const isAssociationRequired: boolean = role.isExternal && role.isUvgoAppRole;

    if (isAssociationRequired) {
      const customerField: Field = form.$('customer');
      const registryField: Field = form.$('registry');
      const sitesField: Field = form.$('sites');

      if (!customerField.value) {
        customerField.invalidate('Please select a customer');
      }
      if (!registryField.value) {
        registryField.invalidate('Please select a registry');
      }
      if (!sitesField.value) {
        sitesField.invalidate('Please select a site');
      }
    }

    if (form.isValid) {
      form.onSubmitCallback?.(form.values());
    }
  },
});

export const useRoleForm = (onSubmit?: (values: any) => void) => {
  useEffect(() => {
    let previousValues: {
      applicationId?: string;
      serviceId?: string;
      roleId?: string;
    } = {};

    reaction(
      () => ({
        applicationId: form.$('application').value?.id,
        serviceId: form.$('service').value?.id,
        roleId: form.$('role').value?.roleId,
      }),
      ({ applicationId, serviceId, roleId }) => {
        if (applicationId !== previousValues.applicationId) {
          resetFieldsExcept(form, [ 'application' ]);
        } else if (serviceId !== previousValues.serviceId) {
          resetFieldsExcept(form, [ 'application', 'service' ]);
        } else if (roleId !== previousValues.roleId) {
          resetFieldsExcept(form, [ 'application', 'service', 'role' ]);
        }

        previousValues = { applicationId, serviceId, roleId };
      },
      { fireImmediately: true },
    );

    form.onSubmitCallback = onSubmit;
  }, [ form, onSubmit ]);

  return form;
};
