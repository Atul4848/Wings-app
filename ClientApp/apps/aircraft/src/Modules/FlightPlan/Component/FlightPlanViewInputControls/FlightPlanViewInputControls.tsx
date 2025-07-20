import React, { FC } from 'react';
import { useStyles } from './FlightPlanViewInputControls.style';
import classNames from 'classnames';
import { ViewInputControl, IViewInputControl, IGroupInputControls } from '@wings-shared/form-controls';
import { IClasses, IOptionValue } from '@wings-shared/core';
import { CollapsibleWithButton } from '@wings-shared/layout';

type Props = {
  classes?: IClasses;
  isEditable: boolean;
  isFpfOpenButtonDisabled: boolean;
  title?: string;
  onGetField: (fieldKey: string) => void;
  groupInputControls: IGroupInputControls;
  onValueChange: (option: IOptionValue, fieldKey: string) => void;
  onButtonClick: () => void;
  onFocus?: (fieldKey: string) => void;
};

const FlightPlanViewInputControls: FC<Props> = ({
  isEditable,
  isFpfOpenButtonDisabled,
  groupInputControls,
  title,
  onGetField,
  onValueChange,
  onButtonClick,
  onFocus,
}) => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <CollapsibleWithButton
        title={title || ''}
        buttonText="Set to Open"
        isButtonDisabled={isFpfOpenButtonDisabled}
        onButtonClick={onButtonClick}
        classes={{
          button: classes.button,
        }}
      >
        <div className={classes.flexWrap}>
          {groupInputControls.inputControls
            .filter(inputControl => !inputControl.isHidden)
            .map((inputControl: IViewInputControl, index: number) => (
              <ViewInputControl
                {...inputControl}
                key={index}
                classes={{
                  flexRow: classNames({
                    [classes.halfFlex]: inputControl.isHalfFlex,
                    [classes.inputControl]: !inputControl.isHalfFlex && !inputControl.isFullFlex,
                    [classes.fullFlex]: inputControl.isFullFlex,
                  }),
                  autoCompleteRoot: classNames({
                    [classes.labelRoot]: inputControl.isHalfFlex,
                  }),
                }}
                field={onGetField(inputControl.fieldKey || '')}
                isEditable={isEditable}
                onValueChange={(option, _) => onValueChange(option, inputControl.fieldKey || '')}
                onFocus={onFocus}
              />
            ))}
        </div>
      </CollapsibleWithButton>
    </div>
  );
};

export default FlightPlanViewInputControls;
