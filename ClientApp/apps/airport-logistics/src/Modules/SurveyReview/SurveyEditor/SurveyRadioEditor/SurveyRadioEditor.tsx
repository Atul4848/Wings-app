import React, { FC } from 'react';
import { observer } from 'mobx-react';
import { FormControlLabel, Radio, RadioGroup, withTheme } from '@material-ui/core';
import { Palette } from '@material-ui/core/styles/createPalette';
import { Field } from 'mobx-react-form';

import { styles } from './SurveyRadioEditor.styles';

type Props = {
  field: Field;
  palette?: Palette;
};

const SurveyRadioEditor: FC<Props> = observer(({ field, palette }) => {
  const classes = styles(palette);

  return (
    <RadioGroup {...field.bind()} className={classes.container}>
      {field?.options.map((value: string) => (
        <FormControlLabel key={value} value={value} control={<Radio />} label={value} />
      ))}
    </RadioGroup>
  );
});

export default withTheme(SurveyRadioEditor);
