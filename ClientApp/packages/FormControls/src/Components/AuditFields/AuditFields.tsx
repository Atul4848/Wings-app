import React, { FC } from 'react';
import { withStyles } from '@material-ui/core';
import { styles } from './AuditFields.styles';
import { IViewInputControl } from '../../Interfaces';
import { IClasses } from '@wings-shared/core';
import ViewInputControl from '../ViewInputControl/ViewInputControl';

type Props = {
  classes?: IClasses;
  isEditable: boolean;
  fieldControls: IViewInputControl[];
  onGetField: (fieldKey: string) => void;
  isNew: boolean;
};

export const AuditFields: FC<Props> = ({ classes, fieldControls, isEditable, onGetField, isNew }) => {
  // Hide audit fields in new mode
  if (isNew) {
    return null;
  }

  return (
    <div className={classes.root}>
      {fieldControls.map((inputControl: IViewInputControl, index: number) => (
        <ViewInputControl
          {...inputControl}
          key={index}
          isEditable={isEditable}
          isDisabled={isEditable} // Non Editable Fields
          field={onGetField(inputControl.fieldKey)}
          classes={{ flexRow: classes.inputControl }}
        />
      ))}
    </div>
  );
};

export default withStyles(styles)(AuditFields);
