import React, { FC, ChangeEvent } from 'react';
import { observer } from 'mobx-react';
import { TextField, withTheme } from '@material-ui/core';
import { Palette } from '@material-ui/core/styles/createPalette';
import { Field } from 'mobx-react-form';

import { styles } from './SurveyValueEditor.styles';

type Props = {
  field: Field;
  palette?: Palette;
};

const SurveyValueEditor: FC<Props> = observer(({ field, palette }) => {
  const classes = styles(palette);

  const changeHandler = () => {
    return field.name === 'nearbyParkingAirports' ?
      (event: ChangeEvent<HTMLInputElement>) => {
        field.set('value', event.target.value.toUpperCase())
      } :
      field.onChange;
  };

  return (
    <div className={classes.container}>
      <TextField
        {...field.bind()}
        type="text"
        margin="none"
        variant="outlined"
        value={field.value || ''}
        placeholder={field.placeholder}
        error={!!field.error}
        helperText={field.error}
        onChange={changeHandler()}
      />
    </div>
  );
});

export default withTheme(SurveyValueEditor);
