import React from 'react';
import { observer } from 'mobx-react';
import Form, { Field } from 'mobx-react-form';

import { EDITOR_TYPES, ViewInputControl } from '@wings-shared/form-controls';
import { DATE_FORMAT } from '@wings-shared/core';
import { ROLE_ACCESS_TYPE } from '../../../../Shared/Enums';
import { useRoleForm } from './useRoleForm.hook';

import { useRoleFormClasses } from './RoleForm.styles';

const ValidityPeriodSection: React.FC = () => {
  const classes: Record<string, string> = useRoleFormClasses();
  const form: Form = useRoleForm();
  const accessType: ROLE_ACCESS_TYPE = form.$('accessType').value;
  const validFromField: Field = form.$('validFrom');
  const validToField: Field = form.$('validTo');

  if (!accessType || accessType === ROLE_ACCESS_TYPE.STANDARD) return null;

  const controlFieldProps = {
    type: EDITOR_TYPES.DATE_TIME,
    dateTimeFormat: DATE_FORMAT.GRID_DISPLAY,
    is12HoursFormat: false,
    isEditable: true,
    allowKeyboardInput: false,
    onValueChange: (value: string, fieldName: string) => form.$(fieldName).set(value),
  };

  return (
    <div className={classes.section}>
      <div className={classes.sectionTitle}>Role validity period</div>
      <div className={classes.sectionContent}>
        <div className={classes.sectionRow}>
          <div className={classes.sectionColumn}>
            <ViewInputControl
              {...controlFieldProps}
              field={validFromField}
            />
          </div>
          <div className={classes.sectionColumn}>
            <ViewInputControl
              {...controlFieldProps}
              field={validToField}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default observer(ValidityPeriodSection);
