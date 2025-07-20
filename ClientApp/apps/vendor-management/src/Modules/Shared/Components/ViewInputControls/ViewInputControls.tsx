import React, { FC } from 'react';
import { useStyles } from './ViewInputControls.styles';
import { IClasses, IOptionValue } from '@wings-shared/core';
import { ViewInputControl, IGroupInputControls, IViewInputControl } from '@wings-shared/form-controls';
import { Collapsable } from '@wings-shared/layout';
import { Typography } from '@material-ui/core';

type Props = {
  classes?: IClasses;
  isEditable: boolean;
  onGetField: (fieldKey: string) => void;
  field: (fieldKey: string) => Field;
  groupInputControls: IGroupInputControls[];
  onValueChange: (option: IOptionValue, fieldKey: string) => void;
  onSearch?: (searchValue: string, fieldKey: string) => void;
  onFocus?: (fieldKey: string) => void;
  onBlur?: (fieldKey: string) => void;
};

export const ViewInputControls: FC<Props> = ({
  isEditable,
  onGetField,
  field,
  groupInputControls,
  onValueChange,
  onSearch,
  onFocus,
  onBlur,
  classes,
}) => {
  const styles = classes ? classes : useStyles();
  return (
    <div className={`flexWrap ${styles.flexWrap}`}>
      <div className={styles.flexRow}>
        {groupInputControls.map(({ title, inputControls }, index) => (
          <div key={index}>
            <Typography variant="h5" className={styles.title}>
              {title}
            </Typography>
            <div className={`flexWrap ${styles.flexWrap}`}>
              {inputControls
                .filter(inputControl => !inputControl.isHidden)
                .map((inputControl: IViewInputControl, index: number) => (
                  <ViewInputControl
                    {...inputControl}
                    key={index}
                    isExists={inputControl.isExists}
                    customErrorMessage={inputControl.customErrorMessage}
                    field={onGetField(inputControl.fieldKey)}
                    isEditable={isEditable}
                    // classes={{ flexRow: classes.inputControl }}
                    onFocus={onFocus}
                    onSearch={onSearch}
                    onBlur={onBlur}
                    onValueChange={(option, fieldKey) => onValueChange(option, inputControl.fieldKey)}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewInputControls;
