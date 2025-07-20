import React, { FC } from 'react';
import { withStyles } from '@material-ui/core';
import { styles } from './ViewExpandInput.styles';
import { Field } from 'mobx-react-form';
import { IViewInputControl } from '../../Interfaces';
import { IClasses, IOptionValue } from '@wings-shared/core';
import ViewInputControl from '../ViewInputControl/ViewInputControl';

type Props = {
  classes?: IClasses;
  isExpandMode: boolean;
  isEditable: boolean;
  showExpandButton?: boolean;
  expandModeField: IViewInputControl;
  onGetField: (fieldKey: string) => Field;
  onValueChange: (option: IOptionValue, fieldKey: string) => void;
  onLabelClick: (label: string, fieldKey: string) => void;
  onFocus?: (fieldKey: string) => void;
};

export const ViewExpandInput: FC<Props> = ({
  classes,
  isExpandMode,
  expandModeField,
  isEditable,
  onGetField,
  onLabelClick,
  onValueChange,
  onFocus = (fieldKey: string) => null,
  showExpandButton = true,
}) => {
  return (
    isExpandMode && (
      <div className={classes.flexContainer}>
        <div className={classes.flexRow}>
          <ViewInputControl
            {...expandModeField}
            isEditable={isEditable}
            classes={{
              flexRow: classes.inputControl,
            }}
            showExpandButton={showExpandButton}
            customErrorMessage={expandModeField.customErrorMessage}
            field={onGetField(expandModeField.fieldKey)}
            onValueChange={(option, fieldKey) => onValueChange(option, expandModeField.fieldKey)}
            onLabelClick={(label, fieldKey) => onLabelClick(label, fieldKey)}
            onFocus={(fieldKey: string) => onFocus(fieldKey)}
          />
        </div>
      </div>
    )
  );
};

export default withStyles(styles)(ViewExpandInput);
