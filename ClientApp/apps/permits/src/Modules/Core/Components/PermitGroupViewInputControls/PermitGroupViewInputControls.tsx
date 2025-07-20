import React, { FC } from 'react';
import { withStyles } from '@material-ui/core';
import { styles } from './PermitGroupViewInputControls.styles';
import { IClasses, IOptionValue } from '@wings-shared/core';
import { ViewInputControl, IViewInputControl, IGroupInputControls } from '@wings-shared/form-controls';
import { Collapsable } from '@wings-shared/layout';
import classNames from 'classnames';

type Props = {
  classes?: IClasses;
  isEditable: boolean;
  onGetField: (fieldKey: string) => void;
  groupInputControls: IGroupInputControls[];
  onValueChange: (option: IOptionValue, fieldKey: string) => void;
};

export const PermitGroupViewInputControls: FC<Props> = ({
  classes,
  isEditable,
  groupInputControls,
  onGetField,
  onValueChange,
}) => {
  const _classes = classes as IClasses;
  return (
    <div className={_classes.flexWrap}>
      <div className={_classes.flexRow}>
        {groupInputControls.map(({ title, inputControls }, index) => (
          <Collapsable key={index} title={title}>
            <div className={_classes.flexWrap}>
              {inputControls
                .filter(inputControl => !inputControl.isHidden)
                .map((inputControl: IViewInputControl, index: number) => (
                  <ViewInputControl
                    {...inputControl}
                    key={index}
                    isExists={inputControl.isExists}
                    customErrorMessage={inputControl.customErrorMessage}
                    field={onGetField(inputControl.fieldKey || '')}
                    isEditable={isEditable}
                    classes={{
                      flexRow: classNames({
                        [_classes.inputControl]: true,
                        [_classes.overflowHidden]: inputControl.isFullFlex,
                      }),
                    }}
                    onValueChange={(option, fieldKey) => onValueChange(option, inputControl.fieldKey || '')}
                  />
                ))}
            </div>
          </Collapsable>
        ))}
      </div>
    </div>
  );
};

export default withStyles(styles)(PermitGroupViewInputControls);
