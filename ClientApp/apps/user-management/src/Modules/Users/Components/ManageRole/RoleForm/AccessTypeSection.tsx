import React from 'react';
import { observer } from 'mobx-react';
import Form, { Field } from 'mobx-react-form';
import { FormControl, RadioGroup, FormControlLabel, Radio } from '@material-ui/core';

import { SelectOption } from '@wings-shared/form-controls';
import { RolesModel } from '../../../../Shared';
import { ROLE_ACCESS_TYPE } from '../../../../Shared/Enums';
import { useRoleForm } from './useRoleForm.hook';

import { useRoleFormClasses } from './RoleForm.styles';

function getIsoStringWithTimeZone(date: Date): string {
  const timezoneOffset: number = new Date().getTimezoneOffset();
  date.setMinutes(date.getMinutes() - timezoneOffset);
  return date.toISOString();
}

function setDates(form: Form, validFrom: Date, validTo: Date): void {
  const setFieldValue = (field: Field, date: Date) => {
    field.set(date ? getIsoStringWithTimeZone(date) : '');
  };

  setFieldValue(form.$('validFrom'), validFrom);
  setFieldValue(form.$('validTo'), validTo);
}

function setStandardRoleDates(form: Form): void {
  setDates(form, null, null);
}

function setTrialRoleDates(form: Form): void {
  const today: Date = new Date();
  const inOneMonth: Date = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

  setDates(form, today, inOneMonth);
}

function setSubscriptionRoleDates(form: Form): void {
  const today: Date = new Date();
  const inOneYear: Date = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

  setDates(form, today, inOneYear);
}

const options = [
  new SelectOption({ id: 1, name: 'Standard', value: ROLE_ACCESS_TYPE.STANDARD }),
  new SelectOption({ id: 2, name: 'Trial', value: ROLE_ACCESS_TYPE.TRIAL }),
  new SelectOption({ id: 3, name: 'Subscription', value: ROLE_ACCESS_TYPE.SUBSCRIPTION }),
];

const AccessTypeSection: React.FC = () => {
  const classes: Record<string,  string> = useRoleFormClasses();
  const form: Form = useRoleForm();
  const role: RolesModel = form.$('role').value;
  const accessTypeField: Field = form.$('accessType');

  const clickHandler = (value: ROLE_ACCESS_TYPE) => {
    accessTypeField.set(value);

    switch (value){
      case ROLE_ACCESS_TYPE.STANDARD:
        setStandardRoleDates(form);
        break;
      case ROLE_ACCESS_TYPE.TRIAL:
        setTrialRoleDates(form);
        break;
      case ROLE_ACCESS_TYPE.SUBSCRIPTION:
        setSubscriptionRoleDates(form);
        break;
    }
  }

  if (!role || role.isInternal || !role.isUvgoAppRole) return null;

  return (
    <div className={classes.section}>
      <div className={classes.sectionTitle}>Access Type</div>
      <div className={classes.sectionContent}>
        <FormControl
          {...accessTypeField.bind()}
          value={accessTypeField.value}
        >
          <RadioGroup className={classes.sectionRow}>
            {
              options.map((option: any) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio checked={option.value === accessTypeField.value} />}
                  label={option.name}
                  onClick={() => clickHandler(option.value)}
                />
              ))
            }
          </RadioGroup>
        </FormControl>
      </div>
    </div>
  );
}

export default observer(AccessTypeSection);
