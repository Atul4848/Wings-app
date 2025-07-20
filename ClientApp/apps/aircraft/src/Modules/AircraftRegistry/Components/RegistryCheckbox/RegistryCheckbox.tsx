import React, { FC } from 'react';
import { RegistrySequenceBaseModel } from '../../../Shared';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import { useStyles } from './RegistryCheckbox.styles';
import { observer } from 'mobx-react';

type Props = {
  options: RegistrySequenceBaseModel[];
  values: RegistrySequenceBaseModel[];
  onValueChange: (option: RegistrySequenceBaseModel[]) => void;
  isEditable: boolean;
};

const RegistryCheckbox: FC<Props> = ({ ...props }) => {
  const classes = useStyles();
  const isChecked = (option: RegistrySequenceBaseModel): boolean => {
    return props.values.some(a => a.id === option.id);
  };

  const onValueChange = (option: RegistrySequenceBaseModel): void => {
    if (props.values.some(a => a.id === option.id)) {
      const newValue = props.values.filter(a => a.id !== option.id);
      props.onValueChange([ ...newValue ]);
      return;
    }
    props.onValueChange([ ...props.values, option ]);
  };

  return (
    <div className={classes.flexWrap}>
      {props.options.map((inputOption: RegistrySequenceBaseModel, index: number) => (
        <FormControlLabel
          label={inputOption.name}
          classes={{ root: classes.checkboxRoot }}
          disabled={!props.isEditable}
          control={
            <Checkbox
              name={inputOption.name}
              checked={isChecked(inputOption)}
              onChange={(_, checked: boolean) => onValueChange(inputOption)}
            />
          }
        />
      ))}
    </div>
  );
};

export default observer(RegistryCheckbox);
