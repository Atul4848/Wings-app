import React, { FC } from 'react';
import { observer } from 'mobx-react';
import { TextField, withTheme, MenuItem } from '@material-ui/core';
import { Palette } from '@material-ui/core/styles/createPalette';
import { Field } from 'mobx-react-form';

import { styles } from './SurveyValueUnitPairEditor.styles';

type Props = {
  field: Field;
  palette?: Palette;
};

const SurveyValueUnitPairEditor: FC<Props> = observer(({ field, palette }) => {
  const classes = styles(palette);
  const valueField: Field = field.select('value');
  const unitField: Field = field.select('unit');

  return (
    <div className={classes.container}>
      <div className={classes.textfield}>
        <TextField
          {...valueField.bind()}
          type="text"
          margin="none"
          variant="outlined"
          error={!valueField.isValid}
          helperText={valueField.error}
        />
      </div>
      <div className={classes.select}>
        <TextField
          select
          {...unitField.bind()}
          error={!unitField.isValid}
        >
          {
            field?.select('unit')?.options.map((option: string) =>
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            )
          }
        </TextField>
      </div>
    </div>
  );
});

export default withTheme(SurveyValueUnitPairEditor);
